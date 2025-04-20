import { atom } from "nanostores";
import type { Area } from "@/types";
import { Resources } from "@/lib/data";

const ResourcesMapObject = Object.fromEntries(
  Resources.map((resource) => [resource.id, resource]),
);

export const areaStore = atom<Area>({
  ResourceMap: ResourcesMapObject,
});
