import type { PointOfInterest } from "@/types";
import { nanoquery } from "@nanostores/query";

export const [createFetcherStore] = nanoquery({
  fetcher: (...keys) => fetch(keys.join("")).then((res) => res.json()),
});

export const $poiStore = createFetcherStore<PointOfInterest[]>([
  "",
  "/data/pois/shardana.json"
]);
