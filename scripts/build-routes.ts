import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  loadRoutesConfig,
  projectRoot,
  resolveRoutes,
} from "./lib/config.js";
import { mergeGpxDirectory } from "./lib/gpx.js";
import {
  buildRoutePois,
  type ManualPoiInput,
} from "./lib/buildPois.js";

async function main() {
  const config = await loadRoutesConfig();
  const routes = resolveRoutes(config);
  const activeSlugs = new Set(routes.map((r) => r.slug));

  const routesDataDir = path.join(projectRoot, "public/data/routes");
  await mkdir(routesDataDir, { recursive: true });

  try {
    const existing = await readdir(routesDataDir, { withFileTypes: true });
    for (const entry of existing) {
      if (entry.isDirectory() && !activeSlugs.has(entry.name)) {
        await rm(path.join(routesDataDir, entry.name), {
          recursive: true,
          force: true,
        });
        console.log(`Removed stale output: ${entry.name}`);
      }
    }
  } catch {
    // directory may not exist yet
  }

  for (const route of routes) {
    console.log(`Building route: ${route.displayName} (${route.slug})`);

    const gpxDir = path.join(projectRoot, "routes", route.folder, "gpx");
    const { linestring, distanceKm } = await mergeGpxDirectory(gpxDir);

    const track = {
      name: route.displayName,
      distance: Math.round(distanceKm * 10) / 10,
      altitude: 0,
      linestring,
    };

    const manualPath = path.join(
      projectRoot,
      "routes",
      route.folder,
      "manual-pois.json",
    );
    const manualInputs = JSON.parse(
      await readFile(manualPath, "utf8"),
    ) as ManualPoiInput[];

    const pois = await buildRoutePois(linestring, manualInputs);

    const outDir = path.join(routesDataDir, route.slug);
    await mkdir(outDir, { recursive: true });

    const manifest = {
      slug: route.slug,
      displayName: route.displayName,
      track: "track.json",
      pois: "pois.json",
    };

    await writeFile(
      path.join(outDir, "track.json"),
      JSON.stringify(track, null, 2) + "\n",
    );
    await writeFile(
      path.join(outDir, "pois.json"),
      JSON.stringify(pois, null, 2) + "\n",
    );
    await writeFile(
      path.join(outDir, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );

    console.log(
      `  Wrote track (${track.distance} km) and ${pois.length} POIs to public/data/routes/${route.slug}/`,
    );
  }

  const index = {
    routes: routes.map((r) => ({
      slug: r.slug,
      displayName: r.displayName,
    })),
  };

  await mkdir(path.join(projectRoot, "public/data"), { recursive: true });
  await writeFile(
    path.join(projectRoot, "public/data/routes-index.json"),
    JSON.stringify(index, null, 2) + "\n",
  );

  console.log(`Wrote routes-index.json (${routes.length} route(s)).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
