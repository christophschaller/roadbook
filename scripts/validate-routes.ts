import { access, readdir } from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import { readFile } from "node:fs/promises";
import {
  loadRoutesConfig,
  projectRoot,
  resolveRoutes,
} from "./lib/config.js";

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const ajv = new Ajv({ allErrors: true });
  const configSchema = JSON.parse(
    await readFile(path.join(projectRoot, "schemas/routes-config.schema.json"), "utf8"),
  );
  const manualSchema = JSON.parse(
    await readFile(path.join(projectRoot, "schemas/manual-pois.schema.json"), "utf8"),
  );

  const validateConfig = ajv.compile(configSchema);
  const validateManual = ajv.compile(manualSchema);

  const config = await loadRoutesConfig();
  if (!validateConfig(config)) {
    console.error("Invalid routes/config.json:", validateConfig.errors);
    process.exit(1);
  }

  const resolved = resolveRoutes(config);
  const slugs = new Set<string>();

  for (const route of resolved) {
    if (!route.slug) {
      console.error(`Empty slug for displayName "${route.displayName}"`);
      process.exit(1);
    }
    if (slugs.has(route.slug)) {
      console.error(`Duplicate slug "${route.slug}"`);
      process.exit(1);
    }
    slugs.add(route.slug);

    const routeDir = path.join(projectRoot, "routes", route.folder);
    if (!(await fileExists(routeDir))) {
      console.error(`Missing route folder: routes/${route.folder}`);
      process.exit(1);
    }

    const gpxDir = path.join(routeDir, "gpx");
    if (!(await fileExists(gpxDir))) {
      console.error(`Missing gpx folder: routes/${route.folder}/gpx`);
      process.exit(1);
    }

    const gpxEntries = await readdir(gpxDir, { withFileTypes: true });
    const gpxCount = gpxEntries.filter(
      (e) => e.isFile() && e.name.toLowerCase().endsWith(".gpx"),
    ).length;
    if (gpxCount === 0) {
      console.error(`No GPX files in routes/${route.folder}/gpx`);
      process.exit(1);
    }

    const manualPath = path.join(routeDir, "manual-pois.json");
    if (!(await fileExists(manualPath))) {
      console.error(`Missing manual-pois.json in routes/${route.folder}`);
      process.exit(1);
    }

    const manual = JSON.parse(await readFile(manualPath, "utf8"));
    if (!validateManual(manual)) {
      console.error(
        `Invalid manual-pois.json for routes/${route.folder}:`,
        validateManual.errors,
      );
      process.exit(1);
    }
  }

  console.log(`Validated ${resolved.length} route(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
