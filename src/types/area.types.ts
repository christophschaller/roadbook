import { type PoiType } from "@/types/poi.types";

export interface Area {
  //distance: number;
  //activeTags: string[];
  poiTypeMap: { [key: string]: PoiType };
}
