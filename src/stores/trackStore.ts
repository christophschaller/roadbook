import { persistentAtom } from "@nanostores/persistent";
import type { Track } from "@/types";
import { nanoquery } from "@nanostores/query";

export const [createFetcherStore] = nanoquery({
  fetcher: (...keys) => fetch(keys.join("")).then((res) => res.json()),
});

export const $selectedTrack = persistentAtom<string>(
  "selectedTrack",
  "shardana_full.json",
);

export const $trackStore = createFetcherStore<Track>([
  "",
  "/data/tracks/",
  $selectedTrack,
]);
