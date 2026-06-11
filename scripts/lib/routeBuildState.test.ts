import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { isRouteBuilt, ROUTE_OUTPUT_FILES } from "./routeBuildState.js";

async function withTempDir(
  fn: (dir: string) => Promise<void>,
): Promise<void> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "route-build-state-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

describe("isRouteBuilt", () => {
  it("returns true when all required files exist", async () => {
    await withTempDir(async (routesOutputDir) => {
      const slug = "test-route";
      const routeDir = path.join(routesOutputDir, slug);
      await fs.mkdir(routeDir, { recursive: true });

      for (const fileName of ROUTE_OUTPUT_FILES) {
        await fs.writeFile(path.join(routeDir, fileName), "{}");
      }

      assert.equal(await isRouteBuilt(routesOutputDir, slug), true);
    });
  });

  it("returns false when a required file is missing", async () => {
    await withTempDir(async (routesOutputDir) => {
      const slug = "partial-route";
      const routeDir = path.join(routesOutputDir, slug);
      await fs.mkdir(routeDir, { recursive: true });
      await fs.writeFile(path.join(routeDir, "track.json"), "{}");

      assert.equal(await isRouteBuilt(routesOutputDir, slug), false);
    });
  });

  it("returns false when the route directory does not exist", async () => {
    await withTempDir(async (routesOutputDir) => {
      assert.equal(await isRouteBuilt(routesOutputDir, "missing-route"), false);
    });
  });
});
