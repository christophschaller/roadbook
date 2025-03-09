import { type PoiType } from "@/types/poi.types";
import { type Feature, type Polygon, type MultiPolygon } from "geojson";

export interface Area {
  //distance: number;
  //activeTags: string[];
  poiTypeMap: { [key: string]: PoiType };
}

export type TypeArea = {
  typeId: string;
  area: Feature<Polygon | MultiPolygon>;
};
