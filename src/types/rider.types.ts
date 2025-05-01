import type { PointOfInterest } from "./poi.types";

export interface Rider extends PointOfInterest {
  _type?: string;
  _id?: string;
  acc: number; // accuracy in meters
  alt: number; // altitude above sea level
  // cog: number; // course over ground
  created_at: number;
  // lat: 48.6761807, // defined in OverpassNode -> used
  // lon: 9.2139167, // defined in OverpassNode -> used
  tid: string; // tracker id -> used
  tst: number; // unix timestamp in seconds at time of location fix
  vac: number; // vertical accuracy
  vel: number; // velocity
  topic: string; // publish topic of the message
  username: string; // -> used
  // device: string;
  ghash: string;
  isotst: string; // -> used
  disptst: string;
  tzname: string;
  // --- custom fields we add in the backend ---
  display_name: string; // -> used
  cap_number: string; // -> used
  // --- the following are only available when reverse geo lookup is available ---
  // isolocal?: string;
  // cc?: string; // geocoded country code
  // addr?: string; // geocoded address
}
