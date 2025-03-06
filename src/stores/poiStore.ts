import { atom } from "nanostores";
import type { Pois } from "@/types";

export const poiStore = atom<Pois>({
  pois: null,
});
