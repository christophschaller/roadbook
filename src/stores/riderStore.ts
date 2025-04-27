import { nanoquery } from "@nanostores/query";
import type { Rider } from "@/types";

export const [createFetcherStore] = nanoquery({
  fetcher: (...keys) => fetch(keys.join("")).then((r) => r.json()),
});

export const riderStore = createFetcherStore<Rider>("/api/owntracks", {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateInterval: 30,
});
