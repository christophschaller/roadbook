import queryOverpass from "@derhuerst/query-overpass";
import {
  createBoundingBox,
  constructOverpassQuery,
} from "@/lib/overpass_helpers";
import { poiStore } from "@/stores/poiStore";
import type { PointOfInterest, Resource, ResourceCategory } from "@/types";
import { type LineString, type Feature, type BBox } from "geojson";
import * as turf from "@turf/turf";

function create2DLineString(lineString: LineString): Feature<LineString> {
  return turf.lineString(
    lineString.coordinates.map((coord: number[]) => [coord[0], coord[1]]),
  );
}

export function formatPoiAddress(poi: PointOfInterest): string | null {
  const tags = poi.tags;
  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const postcode = tags["addr:postcode"];
  const city = tags["addr:city"];

  // If we don't have a street, we can't form a valid address
  if (!street) {
    return null;
  }

  // Build the first part of the address (street + optional house number)
  let address = street;
  if (houseNumber) {
    address += ` ${houseNumber}`;
  }

  // Add postcode and city if either exists
  if (postcode || city) {
    address += ",";
    if (postcode && city) {
      address += ` ${postcode} ${city}`;
    } else if (city) {
      address += ` ${city}`;
    } else if (postcode) {
      address += ` ${postcode}`;
    }
  }

  return address;
}

function enrichPOI(
  poi: PointOfInterest,
  linestring2d: Feature<LineString>,
  resourceId: string,
  resource: Resource,
): PointOfInterest {
  try {
    // Calculate distance to route
    poi.trackDistance = turf.pointToLineDistance(
      turf.point([poi.lon, poi.lat]),
      linestring2d,
      { units: "meters" },
    );

    // Find matching category
    const category: ResourceCategory | undefined = Object.values(
      resource.categories,
    ).find((category) =>
      category.osmTags.some(([key, value]) => poi.tags[key] === value),
    );

    if (!category) {
      throw new Error(`No category found for POI ${poi.id}`);
    }

    // Assign resource information
    poi.resourceId = resourceId;
    poi.resourceCategoryId = category.id;
    poi.icon = category.icon;
    poi.color = resource.color;
    if ("name" in poi.tags) {
      poi.name = poi.tags["name"];
    }
    if ("website" in poi.tags) {
      poi.website = poi.tags["website"];
    }
    if ("phone" in poi.tags) {
      poi.phone = poi.tags["phone"];
    }
    poi.address = formatPoiAddress(poi) ?? "";

    return poi;
  } catch (error) {
    const errorMessage = `Error enriching POI ${poi.id}: ${error}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function fetchPOIsForResource(
  bbox: BBox,
  resourceId: string,
  resource: Resource,
): Promise<PointOfInterest[]> {
  try {
    // Extract selectors from the resource
    const selectors = Object.values(resource.categories)
      .flatMap((category) => category.osmTags)
      .map((selector) => [selector[0], selector[1]]);

    // Create and execute query
    const query = constructOverpassQuery(bbox, selectors);
    return queryOverpass(query);
  } catch (error) {
    const errorMessage = `Error fetching POIs for resource ${resourceId}: ${error}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function fetchAndEnrichPOIsForResource(
  bbox: BBox,
  resourceId: string,
  resource: Resource,
  linestring2d: Feature<LineString>,
): Promise<PointOfInterest[]> {
  try {
    const pois = await fetchPOIsForResource(bbox, resourceId, resource);
    const enrichedPois = pois.map((poi) =>
      enrichPOI(poi, linestring2d, resourceId, resource),
    );
    return enrichedPois;
  } catch (error) {
    const errorMessage = `Error fetching and enriching POIs for resource ${resourceId}: ${error}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export async function fetchOverPassPOIsAlongRoute({
  resources,
  lineString,
  bufferMeters,
}: {
  resources: Record<string, Resource>;
  lineString: LineString;
  bufferMeters: number;
}): Promise<void> {
  try {
    // Create bounding box and lineString
    const bbox = createBoundingBox(lineString, bufferMeters);
    const linestring2d = create2DLineString(lineString);

    // Fetch and enrich POIs for each resource in parallel
    const poiPromises = Object.entries(resources).map(
      ([resourceId, resource]) =>
        fetchAndEnrichPOIsForResource(bbox, resourceId, resource, linestring2d),
    );

    // Wait for all queries to complete
    const poiResults = await Promise.all(poiPromises);

    // Flatten and deduplicate POIs (in case a POI matches multiple resources)
    const uniquePOIs = new Map<string, PointOfInterest>();

    poiResults.flat().forEach((poi) => {
      // Use a unique identifier for each POI (id or coordinates)
      const poiId = poi.id ? String(poi.id) : `${poi.lat},${poi.lon}`;
      uniquePOIs.set(poiId, poi);
    });

    // Update the store with all POIs
    poiStore.set(Array.from(uniquePOIs.values()));
  } catch (error) {
    const errorMessage = `Error fetching POIs: ${error}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
