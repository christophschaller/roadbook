import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugFromDisplayName } from "./slug.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, "../..");

export interface RouteConfigEntry {
  displayName: string;
  folder: string;
}

export interface RoutesConfig {
  routes: RouteConfigEntry[];
}

export interface ResolvedRoute extends RouteConfigEntry {
  slug: string;
}

export async function loadRoutesConfig(): Promise<RoutesConfig> {
  const configPath = path.join(projectRoot, "routes/config.json");
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as RoutesConfig;
}

export function resolveRoutes(config: RoutesConfig): ResolvedRoute[] {
  return config.routes.map((route) => ({
    ...route,
    slug: slugFromDisplayName(route.displayName),
  }));
}
