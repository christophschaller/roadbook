import type { PointOfInterest } from "@/types";
import { nanoquery } from "@nanostores/query";
import { resolveIconName } from "@/lib/iconMap";
import { routeDataUrl } from "@/lib/routeDataPaths";
import { $routeSlug } from "./routeStore";

interface RouteManifest {
  slug: string;
  displayName: string;
  track: string;
  pois: string;
}

export const [createFetcherStore] = nanoquery({
  fetcher: async (...keys) => {
    const slug = keys[1] as string;
    if (!slug) {
      throw new Error("No route slug provided");
    }

    const manifestRes = await fetch(routeDataUrl(slug, "manifest.json"));
    if (!manifestRes.ok) {
      throw new Error(`Failed to load manifest for route ${slug}`);
    }
    const manifest = (await manifestRes.json()) as RouteManifest;

    const poisRes = await fetch(routeDataUrl(slug, manifest.pois));
    if (!poisRes.ok) {
      throw new Error(`Failed to load POIs for route ${slug}`);
    }
    const data = (await poisRes.json()) as PointOfInterest[];

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((poi) => ({
      ...poi,
      icon: resolveIconName(poi.resourceId, poi.resourceCategoryId),
    }));
  },
});

export const $poiStore = createFetcherStore<PointOfInterest[]>(["route", $routeSlug]);
