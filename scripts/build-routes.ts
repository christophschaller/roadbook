import fs from "node:fs/promises";
import path from "node:path";
import {
  loadRoutesConfig,
  PROJECT_ROOT,
  ROUTES_ROOT,
} from "./lib/config.js";
import { withSlugs } from "./lib/slug.js";
import { mergeGpxDirectory } from "./lib/gpx.js";
import {
  buildPoisForRoute,
  type ManualPoiInput,
} from "./lib/buildPois.js";

const PUBLIC_DATA = path.join(PROJECT_ROOT, "public", "data");
const ROUTES_OUTPUT = path.join(PUBLIC_DATA, "routes");

async function removeStaleRouteOutputs(activeSlugs: Set<string>): Promise<void> {
  try {
    const entries = await fs.readdir(ROUTES_OUTPUT);
    await Promise.all(
      entries.map(async (entry) => {
        if (!activeSlugs.has(entry)) {
          await fs.rm(path.join(ROUTES_OUTPUT, entry), {
            recursive: true,
            force: true,
          });
        }
      }),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const config = await loadRoutesConfig();
  const routes = withSlugs(config.routes);
  const skipOverpass = process.env.SKIP_OVERPASS === "1";

  await fs.mkdir(ROUTES_OUTPUT, { recursive: true });
  await removeStaleRouteOutputs(new Set(routes.map((route) => route.slug)));

  for (const route of routes) {
    const routeInputDir = path.join(ROUTES_ROOT, route.folder);
    const gpxDir = path.join(routeInputDir, "gpx");
    const manualPoisPath = path.join(routeInputDir, "manual-pois.json");
    const outDir = path.join(ROUTES_OUTPUT, route.slug);

    const merged = await mergeGpxDirectory(gpxDir, route.displayName);
    const manualPois = JSON.parse(
      await fs.readFile(manualPoisPath, "utf-8"),
    ) as ManualPoiInput[];

    let existingPois: Awaited<ReturnType<typeof buildPoisForRoute>> | undefined;
    const existingPoisPath = path.join(outDir, "pois.json");
    if (skipOverpass) {
      try {
        existingPois = JSON.parse(await fs.readFile(existingPoisPath, "utf-8"));
      } catch {
        existingPois = undefined;
      }
    }

    const pois =
      skipOverpass && existingPois
        ? existingPois
        : await buildPoisForRoute({
            slug: route.slug,
            lineString: merged.lineString,
            manualPois,
            skipOverpass,
          });

    await fs.mkdir(outDir, { recursive: true });

    await fs.writeFile(
      path.join(outDir, "track.json"),
      JSON.stringify(
        {
          name: route.displayName,
          distance: merged.distance,
          data: merged.geojson,
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      path.join(outDir, "pois.json"),
      JSON.stringify(pois, null, 2),
    );

    await fs.writeFile(
      path.join(outDir, "manifest.json"),
      JSON.stringify(
        {
          slug: route.slug,
          displayName: route.displayName,
          track: "track.json",
          pois: "pois.json",
        },
        null,
        2,
      ),
    );

    console.log(`Built route: ${route.slug}`);
  }

  await fs.writeFile(
    path.join(PUBLIC_DATA, "routes-index.json"),
    JSON.stringify(
      {
        routes: routes.map(({ slug, displayName }) => ({ slug, displayName })),
      },
      null,
      2,
    ),
  );

  console.log(`Wrote ${routes.length} route(s) to public/data/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
