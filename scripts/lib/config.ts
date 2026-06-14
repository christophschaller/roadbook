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

export const DEFAULT_ROUTE_BUFFER_METERS = 2500;

export function resolveRouteBufferMeters(route: RouteConfigEntry): number {
  return route.bufferMeters ?? DEFAULT_ROUTE_BUFFER_METERS;
}

/** Strip // and block comments; string contents are preserved. */
function stripJsonComments(raw: string): string {
  let out = "";
  let i = 0;
  let inString = false;
  let escape = false;

  while (i < raw.length) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inString) {
      out += ch;
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      i++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      i += 2;
      while (i < raw.length && raw[i] !== "\n") i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

export async function loadRoutesConfig(): Promise<RoutesConfig> {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(stripJsonComments(raw)) as RoutesConfig;
}
