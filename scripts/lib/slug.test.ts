import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertUniqueSlugs,
  slugFromDisplayName,
  withSlugs,
} from "./slug.js";

describe("slugFromDisplayName", () => {
  it("normalizes display names", () => {
    assert.equal(
      slugFromDisplayName("Alps Divide ULTRA 2025"),
      "alps-divide-ultra-2025",
    );
  });

  it("strips diacritics and punctuation", () => {
    assert.equal(slugFromDisplayName("  Café — Stage 1!  "), "cafe-stage-1");
  });

  it("rejects empty slugs", () => {
    assert.throws(() => slugFromDisplayName("---"), /Cannot derive slug/);
  });
});

describe("assertUniqueSlugs", () => {
  it("detects slug collisions", () => {
    const routes = withSlugs([
      { displayName: "Route A!", folder: "route-a" },
      { displayName: "Route-A", folder: "route-b" },
    ]);

    assert.throws(() => assertUniqueSlugs(routes), /Duplicate slug/);
  });
});
