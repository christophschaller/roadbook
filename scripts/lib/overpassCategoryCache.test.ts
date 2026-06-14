import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { after, describe, it } from "node:test";
import {
  categoryCacheDir,
  isCacheComplete,
  listCachedCategories,
  writeCategoryCache,
} from "./overpassCategoryCache.js";

const slug = "test-resume-route";
const bufferMeters = 2500;

describe("overpassCategoryCache", () => {
  after(async () => {
    await fs.rm(categoryCacheDir(slug, bufferMeters), {
      recursive: true,
      force: true,
    });
  });

  it("treats partial category cache as incomplete", async () => {
    await writeCategoryCache(slug, bufferMeters, "water", "potable", []);

    const cached = await listCachedCategories(slug, bufferMeters);
    assert.equal(cached.has("water-potable"), true);
    assert.equal(await isCacheComplete(slug, bufferMeters), false);
  });
});
