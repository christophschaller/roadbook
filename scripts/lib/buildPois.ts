import fs from "node:fs/promises";
import path from "node:path";
import queryOverpass from "@derhuerst/query-overpass";
import * as turf from "@turf/turf";
import type { Feature, LineString, BBox } from "geojson";
import { Resources } from "../../src/lib/data.js";
import {
  createBoundingBox,
  constructOverpassQuery,
} from "../../src/lib/overpass_helpers.js";
import { formatPoiAddress } from "../../src/lib/dataFetching/fetchOverPassPOIsAlongRoute.js";
import type { PointOfInterest, Resource } from "../../src/types/index.js";
import { colorForResource, iconNameForCategory } from "./iconMap.js";
import { PROJECT_ROOT } from "./config.js";

export interface ManualPoiInput {
  lat: number;
  lon: number;
  name: string;
  resourceId: string;
  resourceCategoryId: string;
  website?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface SerializedPoi {
  type: string;
  id: string | number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  name?: string;
  website?: string;
  phone?: string;
  address?: string;
  trackDistance: number;
  resourceId: string;
  resourceCategoryId: string;
  icon: string;
  color: [number, number, number];
}

function create2DLineString(lineString: LineString): Feature<LineString> {
  return turf.lineString(
    lineString.coordinates.map((coord) => [coord[0], coord[1]]),
  );
}

function enrichPoi(
  poi: PointOfInterest,
  linestring2d: Feature<LineString>,
  resourceId: string,
  resource: Resource,
): SerializedPoi {
  const category = Object.values(resource.categories).find((entry) =>
    entry.osmTags.some(([key, value]) => poi.tags[key] === value),
  );

  if (!category) {
    throw new Error(`No category found for POI ${poi.id}`);
  }

  const trackDistance = turf.pointToLineDistance(
    turf.point([poi.lon, poi.lat]),
    linestring2d,
    { units: "meters" },
  );

  return {
    type: poi.type,
    id: poi.id,
    lat: poi.lat,
    lon: poi.lon,
    tags: poi.tags,
    trackDistance,
    resourceId,
    resourceCategoryId: category.id,
    icon: iconNameForCategory(category.id),
    color: resource.color,
    name: "name" in poi.tags ? poi.tags.name : poi.name,
    website: "website" in poi.tags ? poi.tags.website : poi.website,
    phone: "phone" in poi.tags ? poi.tags.phone : poi.phone,
    address: formatPoiAddress(poi) ?? "",
  };
}

async function fetchPoisForResource(
  bbox: BBox,
  resourceId: string,
  resource: Resource,
): Promise<PointOfInterest[]> {
  const selectors = Object.values(resource.categories)
    .flatMap((category) => category.osmTags)
    .map((selector) => [selector[0], selector[1]] as [string, string]);

  const query = constructOverpassQuery(bbox, selectors);
  return queryOverpass(query);
}

async function fetchWithRetries<T>(
  fn: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw lastError;
}

function cachePath(slug: string): string {
  return path.join(PROJECT_ROOT, "routes", ".overpass-cache", `${slug}.json`);
}

async function readOverpassCache(slug: string): Promise<SerializedPoi[] | null> {
  try {
    const raw = await fs.readFile(cachePath(slug), "utf-8");
    return JSON.parse(raw) as SerializedPoi[];
  } catch {
    return null;
  }
}

async function writeOverpassCache(slug: string, pois: SerializedPoi[]): Promise<void> {
  const filePath = cachePath(slug);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(pois));
}

function manualToSerialized(
  manual: ManualPoiInput,
  index: number,
  slug: string,
  linestring2d: Feature<LineString>,
): SerializedPoi {
  const resource = Resources.find((entry) => entry.id === manual.resourceId);
  if (!resource) {
    throw new Error(`Unknown manual POI resourceId: ${manual.resourceId}`);
  }

  if (!resource.categories[manual.resourceCategoryId]) {
    throw new Error(
      `Unknown manual POI resourceCategoryId: ${manual.resourceCategoryId}`,
    );
  }

  const trackDistance = turf.pointToLineDistance(
    turf.point([manual.lon, manual.lat]),
    linestring2d,
    { units: "meters" },
  );

  return {
    type: "node",
    id: `manual-${slug}-${index + 1}`,
    lat: manual.lat,
    lon: manual.lon,
    tags: { name: manual.name },
    name: manual.name,
    website: manual.website,
    phone: manual.phone,
    address: manual.address ?? "",
    trackDistance,
    resourceId: manual.resourceId,
    resourceCategoryId: manual.resourceCategoryId,
    icon: iconNameForCategory(manual.resourceCategoryId),
    color: colorForResource(manual.resourceId),
  };
}

function poiKey(poi: SerializedPoi): string {
  return String(poi.id);
}

export async function buildPoisForRoute({
  slug,
  lineString,
  manualPois,
  skipOverpass = false,
}: {
  slug: string;
  lineString: LineString;
  manualPois: ManualPoiInput[];
  skipOverpass?: boolean;
}): Promise<SerializedPoi[]> {
  const linestring2d = create2DLineString(lineString);
  const resources = Object.fromEntries(Resources.map((r) => [r.id, r]));
  const bbox = createBoundingBox(lineString, 2500);

  let osmPois: SerializedPoi[] = [];

  if (skipOverpass) {
    const cached = await readOverpassCache(slug);
    if (cached) {
      osmPois = cached;
    }
  }

  if (!skipOverpass) {
    const cached = await readOverpassCache(slug);
    if (cached) {
      osmPois = cached;
    } else {
      const results = await fetchWithRetries(async () => {
        const poiPromises = Object.entries(resources).map(
          async ([resourceId, resource]) => {
            const pois = await fetchPoisForResource(bbox, resourceId, resource);
            return pois.map((poi) => enrichPoi(poi, linestring2d, resourceId, resource));
          },
        );
        return (await Promise.all(poiPromises)).flat();
      });

      const unique = new Map<string, SerializedPoi>();
      for (const poi of results) {
        unique.set(poiKey(poi), poi);
      }
      osmPois = Array.from(unique.values());
      await writeOverpassCache(slug, osmPois);
    }
  }

  const merged = new Map<string, SerializedPoi>();
  for (const poi of osmPois) {
    merged.set(poiKey(poi), poi);
  }

  manualPois.forEach((manual, index) => {
    const poi = manualToSerialized(manual, index, slug, linestring2d);
    merged.set(poiKey(poi), poi);
  });

  return Array.from(merged.values());
}
