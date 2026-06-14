import fs from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  loadRoutesConfig,
  PROJECT_ROOT,
  ROUTES_ROOT,
} from "./lib/config.js";
import { assertUniqueSlugs, withSlugs } from "./lib/slug.js";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

async function loadSchema(fileName: string) {
  const schemaPath = path.join(PROJECT_ROOT, "schemas", fileName);
  const raw = await fs.readFile(schemaPath, "utf-8");
  return JSON.parse(raw);
}

async function main(): Promise<void> {
  const [configSchema, manualPoisSchema] = await Promise.all([
    loadSchema("routes-config.schema.json"),
    loadSchema("manual-pois.schema.json"),
  ]);

  const validateConfig = ajv.compile(configSchema);
  const validateManualPois = ajv.compile(manualPoisSchema);

  const config = await loadRoutesConfig();

  if (!validateConfig(config)) {
    console.error("Invalid routes/config.json:");
    console.error(validateConfig.errors);
    process.exit(1);
  }

  const routes = withSlugs(config.routes);

  try {
    assertUniqueSlugs(routes);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  for (const route of routes) {
    const routeDir = path.join(ROUTES_ROOT, route.folder);
    const gpxDir = path.join(routeDir, "gpx");
    const manualPoisPath = path.join(routeDir, "manual-pois.json");

    try {
      await fs.access(routeDir);
    } catch {
      console.error(`Missing route folder: routes/${route.folder}`);
      process.exit(1);
    }

    const gpxFiles = (await fs.readdir(gpxDir)).filter((name) =>
      name.toLowerCase().endsWith(".gpx"),
    );

    if (gpxFiles.length === 0) {
      console.error(`No GPX files in routes/${route.folder}/gpx/`);
      process.exit(1);
    }

    let manualPoisRaw: unknown;
    try {
      manualPoisRaw = JSON.parse(await fs.readFile(manualPoisPath, "utf-8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      console.error(`Invalid manual-pois.json for routes/${route.folder}`);
      process.exit(1);
    }

    if (!validateManualPois(manualPoisRaw)) {
      console.error(`Invalid manual-pois.json for routes/${route.folder}:`);
      console.error(validateManualPois.errors);
      process.exit(1);
    }
  }

  console.log(`Validated ${routes.length} route(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
