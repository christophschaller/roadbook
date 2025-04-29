import { type LineString } from "geojson";

export interface Track {
  name: string;
  distance: number;
  altitude: number;
  linestring: LineString;
}
