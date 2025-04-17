import { type Resource } from "@/types/poi.types";
import { type Feature, type Polygon, type MultiPolygon } from "geojson";

export interface Area {
  ResourceMap: { [key: string]: Resource };
}

export type ResourceArea = {
  resourceId: string;
  area: Feature<Polygon | MultiPolygon>;
};
