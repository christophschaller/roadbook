import { type GeoJSON } from "@we-gold/gpxjs";

export interface Track {
  name: string;
  data: GeoJSON | null;
}
