import fs from "node:fs/promises";
import path from "node:path";
import { Resources } from "../../src/lib/data.js";
import type { PointOfInterest } from "../../src/types/index.js";
import { PROJECT_ROOT } from "./config.js";

export interface CategoryCacheKey {
  resourceId: string;
  categoryId: string;
}

/** Expected categories derived from Resources; invalidate with BUILD_ROUTES_FORCE=1 when OSM tags change. */
export const EXPECTED_CATEGORY_CACHE_KEYS: CategoryCacheKey[] = Resources.flatMap(
  (resource) =>
    Object.keys(resource.categories).map((categoryId) => ({
      resourceId: resource.id,
      categoryId,
    })),
);

const CACHE_ROOT = path.join(PROJECT_ROOT, "routes", ".overpass-cache");

export function categoryCacheDir(slug: string, bufferMeters: number): string {
  return path.join(CACHE_ROOT, `${slug}-${bufferMeters}m`);
}

function categoryCacheFileName(resourceId: string, categoryId: string): string {
  return `${resourceId}-${categoryId}.json`;
}

function categoryCachePath(
  slug: string,
  bufferMeters: number,
  resourceId: string,
  categoryId: string,
): string {
  return path.join(
    categoryCacheDir(slug, bufferMeters),
    categoryCacheFileName(resourceId, categoryId),
  );
}

function legacyMonolithicCachePath(
  slug: string,
  bufferMeters: number,
): string {
  return path.join(CACHE_ROOT, `${slug}-${bufferMeters}m.json`);
}

export async function readCategoryCache(
  slug: string,
  bufferMeters: number,
  resourceId: string,
  categoryId: string,
): Promise<PointOfInterest[] | null> {
  try {
    const raw = await fs.readFile(
      categoryCachePath(slug, bufferMeters, resourceId, categoryId),
      "utf-8",
    );
    return JSON.parse(raw) as PointOfInterest[];
  } catch {
    return null;
  }
}

export async function writeCategoryCache(
  slug: string,
  bufferMeters: number,
  resourceId: string,
  categoryId: string,
  pois: PointOfInterest[],
): Promise<void> {
  const dir = categoryCacheDir(slug, bufferMeters);
  await fs.mkdir(dir, { recursive: true });

  const filePath = categoryCachePath(
    slug,
    bufferMeters,
    resourceId,
    categoryId,
  );
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(pois));
  await fs.rename(tempPath, filePath);
}

export async function listCachedCategories(
  slug: string,
  bufferMeters: number,
): Promise<Set<string>> {
  const cached = new Set<string>();

  try {
    const entries = await fs.readdir(categoryCacheDir(slug, bufferMeters));
    for (const entry of entries) {
      if (entry.endsWith(".json") && !entry.startsWith("_")) {
        cached.add(entry.slice(0, -".json".length));
      }
    }
  } catch {
    // cache dir does not exist yet
  }

  return cached;
}

function categoryFileKey(resourceId: string, categoryId: string): string {
  return categoryCacheFileName(resourceId, categoryId).slice(0, -".json".length);
}

export async function isCacheComplete(
  slug: string,
  bufferMeters: number,
): Promise<boolean> {
  const cached = await listCachedCategories(slug, bufferMeters);
  const allPresent = EXPECTED_CATEGORY_CACHE_KEYS.every(({ resourceId, categoryId }) =>
    cached.has(categoryFileKey(resourceId, categoryId)),
  );
  if (allPresent) {
    return true;
  }

  // Backward compat: old monolithic cache file before per-category layout existed.
  if (cached.size === 0) {
    try {
      await fs.access(legacyMonolithicCachePath(slug, bufferMeters));
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function readAllCategoryCaches(
  slug: string,
  bufferMeters: number,
): Promise<PointOfInterest[]> {
  const perCategoryComplete = await listCachedCategories(slug, bufferMeters);

  const allPois: PointOfInterest[] = [];
  for (const { resourceId, categoryId } of EXPECTED_CATEGORY_CACHE_KEYS) {
    const key = categoryFileKey(resourceId, categoryId);
    if (!perCategoryComplete.has(key)) {
      throw new Error(
        `Incomplete category cache for ${slug}: missing ${resourceId}/${categoryId}`,
      );
    }
    const pois = await readCategoryCache(
      slug,
      bufferMeters,
      resourceId,
      categoryId,
    );
    if (pois) {
      allPois.push(...pois);
    }
  }
  return allPois;
}

export async function clearCategoryCache(
  slug: string,
  bufferMeters: number,
): Promise<void> {
  await fs.rm(categoryCacheDir(slug, bufferMeters), {
    recursive: true,
    force: true,
  });

  try {
    await fs.unlink(legacyMonolithicCachePath(slug, bufferMeters));
  } catch {
    // legacy file may not exist
  }
}

export async function writeCompleteMarker(
  slug: string,
  bufferMeters: number,
): Promise<void> {
  const dir = categoryCacheDir(slug, bufferMeters);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, "_complete.json"),
    JSON.stringify({
      completedAt: new Date().toISOString(),
      categories: EXPECTED_CATEGORY_CACHE_KEYS.map(
        ({ resourceId, categoryId }) => `${resourceId}-${categoryId}`,
      ),
    }),
  );
}
