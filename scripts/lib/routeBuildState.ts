import fs from "node:fs/promises";
import path from "node:path";

export const ROUTE_OUTPUT_FILES = [
  "track.json",
  "pois.json",
  "manifest.json",
] as const;

export async function isRouteBuilt(
  routesOutputDir: string,
  slug: string,
): Promise<boolean> {
  const routeDir = path.join(routesOutputDir, slug);

  for (const fileName of ROUTE_OUTPUT_FILES) {
    try {
      await fs.access(path.join(routeDir, fileName));
    } catch {
      return false;
    }
  }

  return true;
}
