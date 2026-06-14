import fs from "node:fs/promises";
import path from "node:path";
import * as turf from "@turf/turf";
import type { Feature, LineString, BBox } from "geojson";
import { Resources } from "../../src/lib/data.js";
import {
  createBoundingBox,
  fetchPoisForResourceCategories,
} from "../../src/lib/overpass_helpers.js";
import { formatPoiAddress } from "../../src/lib/dataFetching/fetchOverPassPOIsAlongRoute.js";
import type { PointOfInterest, Resource } from "../../src/types/index.js";
import { colorForResource, iconNameForCategory } from "./iconMap.js";
import { DEFAULT_ROUTE_BUFFER_METERS, PROJECT_ROOT } from "./config.js";
import {
  categoryCacheDir,
  clearCategoryCache,
  isCacheComplete,
  listCachedCategories,
  readAllCategoryCaches,
  readCategoryCache,
  writeCategoryCache,
  writeCompleteMarker,
} from "./overpassCategoryCache.js";

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

export async function loadManualPois(
  manualPoisPath: string,
): Promise<ManualPoiInput[]> {
  try {
    return JSON.parse(
      await fs.readFile(manualPoisPath, "utf-8"),
    ) as ManualPoiInput[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
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

function legacyMonolithicCachePath(slug: string, bufferMeters: number): string {
  return path.join(
    PROJECT_ROOT,
    "routes",
    ".overpass-cache",
    `${slug}-${bufferMeters}m.json`,
  );
}

async function readLegacyMonolithicCache(
  slug: string,
  bufferMeters: number,
): Promise<SerializedPoi[] | null> {
  try {
    const raw = await fs.readFile(
      legacyMonolithicCachePath(slug, bufferMeters),
      "utf-8",
    );
    return JSON.parse(raw) as SerializedPoi[];
  } catch {
    return null;
  }
}

function enrichRawPois(
  rawPois: PointOfInterest[],
  linestring2d: Feature<LineString>,
  resources: Record<string, Resource>,
): SerializedPoi[] {
  const enriched: SerializedPoi[] = [];

  for (const [resourceId, resource] of Object.entries(resources)) {
    for (const poi of rawPois) {
      const matchesResource = Object.values(resource.categories).some((category) =>
        category.osmTags.some(([key, value]) => poi.tags[key] === value),
      );
      if (matchesResource) {
        enriched.push(enrichPoi(poi, linestring2d, resourceId, resource));
      }
    }
  }

  return enriched;
}

async function fetchPoisForResource(
  bbox: BBox,
  resourceId: string,
  resource: Resource,
  slug: string,
  bufferMeters: number,
): Promise<PointOfInterest[]> {
  return fetchPoisForResourceCategories(bbox, resource.categories, {
    onCategoryStart: (categoryId) => {
      console.log(`  Overpass: ${resourceId}/${categoryId}`);
    },
    loadCategoryCache: (categoryId) =>
      readCategoryCache(slug, bufferMeters, resourceId, categoryId),
    saveCategoryCache: (categoryId, pois) =>
      writeCategoryCache(slug, bufferMeters, resourceId, categoryId, pois),
  });
}

async function loadOsmPoisFromCache(
  slug: string,
  bufferMeters: number,
  linestring2d: Feature<LineString>,
  resources: Record<string, Resource>,
): Promise<SerializedPoi[] | null> {
  if (!(await isCacheComplete(slug, bufferMeters))) {
    return null;
  }

  const cachedCategories = await listCachedCategories(slug, bufferMeters);
  if (cachedCategories.size > 0) {
    const rawPois = await readAllCategoryCaches(slug, bufferMeters);
    return enrichRawPois(rawPois, linestring2d, resources);
  }

  return readLegacyMonolithicCache(slug, bufferMeters);
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
  bufferMeters = DEFAULT_ROUTE_BUFFER_METERS,
  skipOverpass = false,
  forceRefresh = false,
}: {
  slug: string;
  lineString: LineString;
  manualPois: ManualPoiInput[];
  bufferMeters?: number;
  skipOverpass?: boolean;
  forceRefresh?: boolean;
}): Promise<SerializedPoi[]> {
  const linestring2d = create2DLineString(lineString);
  const resources = Object.fromEntries(Resources.map((r) => [r.id, r]));
  const bbox = createBoundingBox(lineString, bufferMeters);

  let osmPois: SerializedPoi[] = [];

  if (skipOverpass) {
    const cached = await loadOsmPoisFromCache(
      slug,
      bufferMeters,
      linestring2d,
      resources,
    );
    if (cached) {
      osmPois = cached;
    }
  } else if (forceRefresh) {
    await clearCategoryCache(slug, bufferMeters);
  }

  if (!skipOverpass) {
    const cached =
      !forceRefresh
        ? await loadOsmPoisFromCache(
            slug,
            bufferMeters,
            linestring2d,
            resources,
          )
        : null;

    if (cached) {
      osmPois = cached;
    } else {
      const allRaw: PointOfInterest[] = [];

      for (const [resourceId, resource] of Object.entries(resources)) {
        console.log(`Fetching ${resourceId} POIs…`);
        const pois = await fetchPoisForResource(
          bbox,
          resourceId,
          resource,
          slug,
          bufferMeters,
        );
        allRaw.push(...pois);
      }

      osmPois = enrichRawPois(allRaw, linestring2d, resources);

      const unique = new Map<string, SerializedPoi>();
      for (const poi of osmPois) {
        unique.set(poiKey(poi), poi);
      }
      osmPois = Array.from(unique.values());

      await writeCompleteMarker(slug, bufferMeters);
      console.log(
        `Cached ${(await listCachedCategories(slug, bufferMeters)).size} categories under ${categoryCacheDir(slug, bufferMeters)}`,
      );
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
