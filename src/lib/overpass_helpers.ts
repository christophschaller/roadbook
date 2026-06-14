import queryOverpass from "@derhuerst/query-overpass";
import { bbox, buffer, simplify } from "@turf/turf";
import { type BBox, type LineString } from "geojson";
import type { PointOfInterest, ResourceCategory } from "@/types";

const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://maps.mail.de/osm/tools/overpass/api/interpreter",
];

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }
  return process.env[name];
}

function overpassEndpoints(): string[] {
  const fromEnv =
    readEnv("OVERPASS_ENDPOINTS") ?? readEnv("OVERPASS_ENDPOINT");
  if (fromEnv) {
    return fromEnv.split(",").map((endpoint) => endpoint.trim()).filter(Boolean);
  }
  return DEFAULT_OVERPASS_ENDPOINTS;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function envMs(name: string, fallback: number): number {
  const value = readEnv(name);
  if (value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Pause between Overpass category queries to reduce rate-limiting. */
const CATEGORY_QUERY_DELAY_MS = envMs("OVERPASS_CATEGORY_DELAY_MS", 1500);

const MAX_ATTEMPTS = envMs("OVERPASS_MAX_ATTEMPTS", 4);
const RATE_LIMIT_BACKOFF_MS = envMs("OVERPASS_RATE_LIMIT_BACKOFF_MS", 45000);
const ENDPOINT_DELAY_MS = envMs("OVERPASS_ENDPOINT_DELAY_MS", 2000);
const ROUND_BACKOFF_MS = envMs("OVERPASS_ROUND_BACKOFF_MS", 10000);

export function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /too many requests|429|rate.?limit/i.test(msg);
}

export function createBoundingBox(
  lineString: LineString,
  bufferMeters: number,
): BBox {
  const simpleLineString = simplify(lineString, {
    tolerance: 0.001,
    highQuality: false,
  });
  const buffered = buffer(simpleLineString, bufferMeters, { units: "meters" });
  if (!buffered) {
    return bbox(simpleLineString);
  }
  return bbox(buffered);
}

// TODO: rework query building
// 1. instead of searching for node, way, relation its possible to use nwr
// nwr: Searches for nodes, ways, and relations
// nw: Searches for nodes and ways
// nr: Searches for nodes and relations
// wr: Searches for ways and relations
//
// 2. when exactly are ways and relations important for us?
// how do we filter them out or process them if we want to display points?

export function constructOverpassQuery(
  bbox: BBox,
  selectors: string[][],
): string {
  const [west, south, east, north] = bbox;

  // Convert selectors array into a query string for Overpass
  const selectorQueries = selectors
    .map((selector) => {
      const [key, value] = selector;
      return `node["${key}"="${value}"](${south},${west},${north},${east});`;
      // return `node["${key}"="${value}"](${south},${west},${north},${east});\n  way["${key}"="${value}"](${south},${west},${north},${east});\n  relation["${key}"="${value}"](${south},${west},${north},${east});`;
    })
    .join("\n");

  // Wrap the selectors in an Overpass query
  return `
[out:json][timeout:25];
(
${selectorQueries}
);
out body;
>;
out skel qt;
`.trim();
}

export interface FetchPoisForResourceCategoriesOptions {
  onCategoryStart?: (categoryId: string) => void;
  loadCategoryCache?: (categoryId: string) => Promise<PointOfInterest[] | null>;
  saveCategoryCache?: (
    categoryId: string,
    pois: PointOfInterest[],
  ) => Promise<void>;
}

/** Query one category at a time so large routes do not hit Overpass timeouts. */
export async function fetchPoisForResourceCategories(
  bbox: BBox,
  categories: Record<string, ResourceCategory>,
  options?: FetchPoisForResourceCategoriesOptions,
): Promise<PointOfInterest[]> {
  const unique = new Map<string, PointOfInterest>();

  const categoryList = Object.values(categories);

  for (let index = 0; index < categoryList.length; index++) {
    const category = categoryList[index];
    options?.onCategoryStart?.(category.id);

    let pois: PointOfInterest[];

    const cached = options?.loadCategoryCache
      ? await options.loadCategoryCache(category.id)
      : null;

    if (cached) {
      console.log(`  Cache hit: ${category.id}`);
      pois = cached;
    } else {
      const selectors = category.osmTags.map(([key, value]) => [key, value]);
      const query = constructOverpassQuery(bbox, selectors);
      pois = await queryOverpassWithRetries(query);
      if (options?.saveCategoryCache) {
        await options.saveCategoryCache(category.id, pois);
      }
    }

    for (const poi of pois) {
      unique.set(String(poi.id), poi);
    }

    if (index < categoryList.length - 1 && CATEGORY_QUERY_DELAY_MS > 0) {
      await sleep(CATEGORY_QUERY_DELAY_MS);
    }
  }

  return Array.from(unique.values());
}

async function queryOverpassWithRetries(
  query: string,
): Promise<PointOfInterest[]> {
  const endpoints = overpassEndpoints();
  let lastError: unknown;

  for (let round = 1; round <= MAX_ATTEMPTS; round++) {
    for (let endpointIndex = 0; endpointIndex < endpoints.length; endpointIndex++) {
      const endpoint = endpoints[endpointIndex];
      try {
        return await queryOverpass(query, {
          endpoint,
          retryOpts: { retries: 0, minTimeout: 500 },
        });
      } catch (error) {
        lastError = error;
        const rateLimited = isRateLimitError(error);
        console.warn(
          `Overpass query failed (${endpoint}, round ${round}/${MAX_ATTEMPTS}):`,
          error instanceof Error ? error.message : error,
        );

        const isLastEndpoint = endpointIndex === endpoints.length - 1;
        if (isLastEndpoint) {
          break;
        }

        const waitMs = rateLimited ? RATE_LIMIT_BACKOFF_MS : ENDPOINT_DELAY_MS;
        if (rateLimited) {
          console.warn(
            `Rate limited by ${endpoint}, waiting ${Math.round(waitMs / 1000)}s before next mirror…`,
          );
        }
        await sleep(waitMs);
      }
    }

    if (round < MAX_ATTEMPTS) {
      console.warn(
        `All mirrors failed in round ${round}/${MAX_ATTEMPTS}, waiting ${Math.round(ROUND_BACKOFF_MS / 1000)}s…`,
      );
      await sleep(ROUND_BACKOFF_MS);
    }
  }

  const endpointList = endpoints.join(", ");
  throw new Error(
    `All Overpass endpoints failed (${endpointList}). ` +
      `Try again later, set OVERPASS_ENDPOINT to a working mirror, or use SKIP_OVERPASS=1 with committed pois.json. ` +
      `Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}
