import queryOverpass from "@derhuerst/query-overpass";
import * as turf from "@turf/turf";
import type { Feature, LineString, BBox } from "geojson";
import {
  createBoundingBox,
  constructOverpassQuery,
} from "@/lib/overpass_helpers";
import { Resources } from "@/lib/data";
import type { PointOfInterest, Resource } from "@/types";
import { resolveIconName } from "./iconMap.js";

const BUFFER_METERS = 2500;

function create2DLineString(lineString: LineString): Feature<LineString> {
  return turf.lineString(
    lineString.coordinates.map((coord) => [coord[0], coord[1]]),
  );
}

function formatPoiAddress(poi: PointOfInterest): string | null {
  const tags = poi.tags ?? {};
  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const postcode = tags["addr:postcode"];
  const city = tags["addr:city"];

  if (!street) return null;

  let address = street;
  if (houseNumber) address += ` ${houseNumber}`;
  if (postcode || city) {
    address += ",";
    if (postcode && city) address += ` ${postcode} ${city}`;
    else if (city) address += ` ${city}`;
    else if (postcode) address += ` ${postcode}`;
  }
  return address;
}

function enrichOsmPoi(
  poi: PointOfInterest,
  linestring2d: Feature<LineString>,
  resourceId: string,
  resource: Resource,
): PointOfInterest {
  poi.trackDistance = turf.pointToLineDistance(
    turf.point([poi.lon, poi.lat]),
    linestring2d,
    { units: "meters" },
  );

  const category = Object.values(resource.categories).find((cat) =>
    cat.osmTags.some(([key, value]) => poi.tags[key] === value),
  );

  if (!category) {
    throw new Error(`No category found for POI ${poi.id}`);
  }

  poi.resourceId = resourceId;
  poi.resourceCategoryId = category.id;
  poi.icon = resolveIconName(resourceId, category.id);
  poi.color = resource.color;
  if (poi.tags?.name) poi.name = poi.tags.name;
  if (poi.tags?.website) poi.website = poi.tags.website;
  if (poi.tags?.phone) poi.phone = poi.tags.phone;
  poi.address = formatPoiAddress(poi) ?? "";

  return poi;
}

async function fetchPOIsForResource(
  bbox: BBox,
  resource: Resource,
): Promise<PointOfInterest[]> {
  const selectors = Object.values(resource.categories)
    .flatMap((category) => category.osmTags)
    .map((selector) => [selector[0], selector[1]] as [string, string]);

  const query = constructOverpassQuery(bbox, selectors);
  return queryOverpass(query);
}

async function fetchOsmPois(lineString: LineString): Promise<PointOfInterest[]> {
  const bbox = createBoundingBox(lineString, BUFFER_METERS);
  const linestring2d = create2DLineString(lineString);

  const poiResults = await Promise.all(
    Resources.map(async (resource) => {
      const pois = await fetchPOIsForResource(bbox, resource);
      return pois
        .map((poi) => {
          try {
            return enrichOsmPoi(poi, linestring2d, resource.id, resource);
          } catch {
            return null;
          }
        })
        .filter((p): p is PointOfInterest => p !== null);
    }),
  );

  const unique = new Map<string, PointOfInterest>();
  for (const poi of poiResults.flat()) {
    const poiId = poi.id ? String(poi.id) : `${poi.lat},${poi.lon}`;
    unique.set(poiId, poi);
  }
  return Array.from(unique.values());
}

export interface ManualPoiInput {
  id?: string | number;
  lat: number;
  lon: number;
  name?: string;
  resourceId: string;
  resourceCategoryId: string;
  website?: string;
  phone?: string;
  address?: string;
  type?: string;
  tags?: Record<string, string>;
}

function resourceColor(resourceId: string): [number, number, number] {
  const resource = Resources.find((r) => r.id === resourceId);
  if (!resource) return [128, 128, 128];
  return resource.color;
}

export function enrichManualPois(
  inputs: ManualPoiInput[],
  lineString: LineString,
): PointOfInterest[] {
  const linestring2d = create2DLineString(lineString);

  return inputs.map((input, index) => {
    const id =
      typeof input.id === "number"
        ? input.id
        : typeof input.id === "string"
          ? -(index + 1)
          : -(index + 1);

    const poi: PointOfInterest = {
      type: input.type ?? "node",
      id,
      lat: input.lat,
      lon: input.lon,
      tags: input.tags ?? {},
      resourceId: input.resourceId,
      resourceCategoryId: input.resourceCategoryId,
      icon: resolveIconName(input.resourceId, input.resourceCategoryId),
      color: resourceColor(input.resourceId),
      trackDistance: turf.pointToLineDistance(
        turf.point([input.lon, input.lat]),
        linestring2d,
        { units: "meters" },
      ),
    };
    if (input.name) poi.name = input.name;
    if (input.website) poi.website = input.website;
    if (input.phone) poi.phone = input.phone;
    poi.address = input.address ?? "";

    return poi;
  });
}

export async function buildRoutePois(
  lineString: LineString,
  manualInputs: ManualPoiInput[],
): Promise<PointOfInterest[]> {
  console.log("  Fetching OSM POIs (Overpass)...");
  const osmPois = await fetchOsmPois(lineString);
  console.log(`  Found ${osmPois.length} OSM POIs`);

  const manualPois = enrichManualPois(manualInputs, lineString);
  const unique = new Map<string, PointOfInterest>();

  for (const poi of [...osmPois, ...manualPois]) {
    const poiId = poi.id !== undefined && !Number.isNaN(poi.id)
      ? String(poi.id)
      : `${poi.lat},${poi.lon}`;
    unique.set(poiId, poi);
  }

  return Array.from(unique.values());
}
