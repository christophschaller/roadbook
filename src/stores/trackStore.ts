import type { Track } from "@/types";
import { nanoquery } from "@nanostores/query";
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

    const trackRes = await fetch(routeDataUrl(slug, manifest.track));
    if (!trackRes.ok) {
      throw new Error(`Failed to load track for route ${slug}`);
    }
    return (await trackRes.json()) as Track;
  },
});

export const $trackStore = createFetcherStore<Track>(["route", $routeSlug]);
