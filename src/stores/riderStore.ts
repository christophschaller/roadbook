import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { nanoquery } from "@nanostores/query";
import type { Rider } from "@/types";

export const [createFetcherStore] = nanoquery({
  fetcher: (...keys) => fetch(keys.join("")).then((r) => r.json()),
});

export const $riderStore = createFetcherStore<Rider[]>("/api/owntracks", {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateInterval: 60000,
});

export const $displayRiders = persistentAtom<boolean>("displayRiders", true, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $focusRider = atom<Rider | null>(null);
