import type { PointOfInterest } from "@/types";
import { nanoquery } from "@nanostores/query";
import { $selectedTrack } from "./trackStore";

export const [createFetcherStore] = nanoquery({
  fetcher: (...keys) => fetch(keys.join("")).then((res) => res.json()),
});

export const $poiStore = createFetcherStore<PointOfInterest[]>([
  "",
  "/data/pois/",
  $selectedTrack,
]);
