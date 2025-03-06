import { atom } from "nanostores";
import type { Area } from "@/types";
import { poiTypes } from "@/lib/data";

// const activeCategories = poiTypes[0].categories
//     .filter(category => category.active)
//     .map(category => category.id);

const poiTypeObject = Object.fromEntries(
  poiTypes.map((type) => [type.id, type]),
);

export const areaStore = atom<Area>({
  // distance: 500,
  // activeTags: activeCategories,
  poiTypeMap: poiTypeObject,
});
