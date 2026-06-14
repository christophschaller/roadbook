import fs from "node:fs/promises";
import path from "node:path";
import type { LineString } from "geojson";
import {
  loadRoutesConfig,
  PROJECT_ROOT,
  resolveRouteBufferMeters,
  ROUTES_ROOT,
} from "./lib/config.js";
import { withSlugs } from "./lib/slug.js";
import { mergeGpxDirectory } from "./lib/gpx.js";
import { buildPoisForRoute, loadManualPois } from "./lib/buildPois.js";
import { isRouteBuilt } from "./lib/routeBuildState.js";

const PUBLIC_DATA = path.join(PROJECT_ROOT, "public", "data");
const ROUTES_OUTPUT = path.join(PUBLIC_DATA, "routes");

interface BuildOptions {
  slugFilter?: string;
  poisOnly: boolean;
  skipOverpass: boolean;
  onlyMissing: boolean;
  force: boolean;
}

function parseBuildOptions(): BuildOptions {
  const args = process.argv.slice(2);
  let slugFilter = process.env.BUILD_ROUTE_SLUG?.trim() || undefined;
  let poisOnly = process.env.BUILD_POIS_ONLY === "1";
  let force = process.env.BUILD_ROUTES_FORCE === "1";

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--pois-only") {
      poisOnly = true;
      continue;
    }
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg === "--slug" || arg === "-s") {
      slugFilter = args[++index]?.trim();
      if (!slugFilter) {
        throw new Error("Missing value for --slug");
      }
      continue;
    }
    if (arg.startsWith("--slug=")) {
      slugFilter = arg.slice("--slug=".length).trim();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    slugFilter,
    poisOnly,
    skipOverpass: process.env.SKIP_OVERPASS === "1",
    onlyMissing: process.env.BUILD_ROUTES_ONLY_MISSING === "1",
    force,
  };
}

async function readLineStringFromTrack(
  trackPath: string,
): Promise<LineString> {
  const trackJson = JSON.parse(await fs.readFile(trackPath, "utf-8")) as {
    data: { features: Array<{ geometry: LineString }> };
  };
  const lineString = trackJson.data?.features?.[0]?.geometry;
  if (!lineString || lineString.type !== "LineString") {
    throw new Error(`Invalid track geometry in ${trackPath}`);
  }
  return lineString;
}

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
  const options = parseBuildOptions();
  const config = await loadRoutesConfig();
  let routes = withSlugs(config.routes);

  if (options.slugFilter) {
    routes = routes.filter((route) => route.slug === options.slugFilter);
    if (routes.length === 0) {
      const available = withSlugs(config.routes)
        .map((route) => route.slug)
        .join(", ");
      throw new Error(
        `Unknown route slug "${options.slugFilter}". Available: ${available}`,
      );
    }
  }

  const incremental = options.onlyMissing && !options.force;
  const singleRoute = Boolean(options.slugFilter);

  await fs.mkdir(ROUTES_OUTPUT, { recursive: true });
  if (!singleRoute) {
    await removeStaleRouteOutputs(new Set(routes.map((route) => route.slug)));
  }

  let built = 0;
  let skipped = 0;

  for (const route of routes) {
    if (
      incremental &&
      !options.poisOnly &&
      (await isRouteBuilt(ROUTES_OUTPUT, route.slug))
    ) {
      console.log(`Skip (already built): ${route.slug}`);
      skipped++;
      continue;
    }

    const routeInputDir = path.join(ROUTES_ROOT, route.folder);
    const gpxDir = path.join(routeInputDir, "gpx");
    const manualPoisPath = path.join(routeInputDir, "manual-pois.json");
    const outDir = path.join(ROUTES_OUTPUT, route.slug);
    const trackPath = path.join(outDir, "track.json");
    const existingPoisPath = path.join(outDir, "pois.json");

    const manualPois = await loadManualPois(manualPoisPath);

    let lineString: LineString;
    let mergedTrack:
      | Awaited<ReturnType<typeof mergeGpxDirectory>>
      | undefined;

    if (options.poisOnly) {
      try {
        lineString = await readLineStringFromTrack(trackPath);
      } catch {
        throw new Error(
          `Cannot rebuild POIs only for "${route.slug}": missing ${trackPath}. Run a full route build first.`,
        );
      }
      console.log(`Rebuilding POIs only: ${route.slug}`);
    } else {
      mergedTrack = await mergeGpxDirectory(gpxDir, route.displayName);
      lineString = mergedTrack.lineString;
    }

    let existingPois: Awaited<ReturnType<typeof buildPoisForRoute>> | undefined;
    if (options.skipOverpass) {
      try {
        existingPois = JSON.parse(await fs.readFile(existingPoisPath, "utf-8"));
      } catch {
        existingPois = undefined;
      }
    }

    const pois =
      options.skipOverpass && existingPois
        ? existingPois
        : await buildPoisForRoute({
            slug: route.slug,
            lineString,
            manualPois,
            bufferMeters: resolveRouteBufferMeters(route),
            skipOverpass: options.skipOverpass,
            forceRefresh: options.force,
          });

    await fs.mkdir(outDir, { recursive: true });

    if (!options.poisOnly && mergedTrack) {
      await fs.writeFile(
        trackPath,
        JSON.stringify(
          {
            name: route.displayName,
            distance: mergedTrack.distance,
            data: mergedTrack.geojson,
          },
          null,
          2,
        ),
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
    }

    await fs.writeFile(existingPoisPath, JSON.stringify(pois, null, 2));

    console.log(
      `Built ${options.poisOnly ? "POIs" : "route"}: ${route.slug} (${pois.length} POIs)`,
    );
    built++;
  }

  if (!singleRoute) {
    await fs.writeFile(
      path.join(PUBLIC_DATA, "routes-index.json"),
      JSON.stringify(
        {
          routes: withSlugs(config.routes).map(({ slug, displayName }) => ({
            slug,
            displayName,
          })),
        },
        null,
        2,
      ),
    );
  }

  console.log(
    `Done: ${built} built, ${skipped} skipped, ${routes.length} selected — public/data/`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
