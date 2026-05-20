import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RouteConfigEntry } from "./slug.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, "../..");
export const ROUTES_ROOT = path.join(PROJECT_ROOT, "routes");
export const CONFIG_PATH = path.join(ROUTES_ROOT, "config.json");

export interface RoutesConfig {
  routes: RouteConfigEntry[];
}

export async function loadRoutesConfig(): Promise<RoutesConfig> {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as RoutesConfig;
}
