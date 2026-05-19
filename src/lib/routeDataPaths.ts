export function routeDataUrl(slug: string, file: string): string {
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}data/routes/${slug}/${file}`;
}

export function routeManifestUrl(slug: string): string {
  return routeDataUrl(slug, "manifest.json");
}
