export interface RouteConfigEntry {
  displayName: string;
  folder: string;
  /** Overpass POI search buffer around the route in meters. Default: 2500. */
  bufferMeters?: number;
}

export interface RouteWithSlug extends RouteConfigEntry {
  slug: string;
}

export function slugFromDisplayName(displayName: string): string {
  const slug = displayName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    throw new Error(`Cannot derive slug from displayName: "${displayName}"`);
  }

  return slug;
}

export function assertUniqueSlugs(routes: RouteWithSlug[]): void {
  const seen = new Map<string, string>();

  for (const route of routes) {
    const existing = seen.get(route.slug);
    if (existing) {
      throw new Error(
        `Duplicate slug "${route.slug}" for "${route.displayName}" and "${existing}"`,
      );
    }
    seen.set(route.slug, route.displayName);
  }
}

export function withSlugs(routes: RouteConfigEntry[]): RouteWithSlug[] {
  return routes.map((route) => ({
    ...route,
    slug: slugFromDisplayName(route.displayName),
  }));
}
