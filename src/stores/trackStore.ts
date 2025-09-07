import { persistentAtom } from "@nanostores/persistent";
import type { Track } from "@/types";
import { nanoquery } from "@nanostores/query";
import { parseGPX } from "@we-gold/gpxjs";
import * as turf from "@turf/turf";
import type { LineString } from "geojson";

export const [createFetcherStore] = nanoquery({
  fetcher: async (...keys) => {
    const url = keys.join("");
    if (url.toLowerCase().endsWith(".gpx")) {
      const res = await fetch(url);
      const text = await res.text();
      const [gpx, err] = parseGPX(text);
      if (err || !gpx) throw err || new Error("Failed to parse GPX");
      const geojson = gpx.toGeoJSON();
      const feature = geojson?.features?.[0];
      if (!feature || feature.geometry?.type !== "LineString") {
        throw new Error("Expected LineString geometry in GPX GeoJSON");
      }
      const linestring = feature.geometry as LineString;
      const distanceKm = turf.length(linestring as any, { units: "kilometers" });
      const track: Track = {
        name: geojson.properties?.name || url.split("/").pop() || "Track",
        distance: Math.round(distanceKm * 10) / 10,
        altitude: 0,
        linestring,
      };
      return track;
    }

    // If requesting the tracks base path, load and merge all sections into one track
    if (url.endsWith("/data/tracks/") || url.endsWith("/data/tracks")) {
      const sections = [
        "Alps Divide ULTRA 2025 Section 1.gpx",
        "Alps Divide ULTRA 2025 Section 2.gpx",
        "Alps Divide ULTRA 2025 Section 3.gpx",
        "Alps Divide ULTRA 2025 Section 4.gpx",
        "Alps Divide ULTRA 2025 Section 5.gpx",
      ];

      const features: LineString[] = [];
      for (const file of sections) {
        const res = await fetch(`${url.endsWith("/") ? url : url + "/"}${file}`);
        const text = await res.text();
        const [gpx, err] = parseGPX(text);
        if (err || !gpx) continue;
        const geojson = gpx.toGeoJSON();
        const feature = geojson?.features?.[0];
        if (feature && feature.geometry?.type === "LineString") {
          features.push(feature.geometry as LineString);
        }
      }

      const mergedCoordinates: [number, number][] = features.flatMap((ls) =>
        (ls.coordinates as [number, number][]),
      );
      const mergedLine: LineString = {
        type: "LineString",
        coordinates: mergedCoordinates,
      };
      const distanceKm = turf.length(mergedLine as any, { units: "kilometers" });
      const track: Track = {
        name: "All Sections",
        distance: Math.round(distanceKm * 10) / 10,
        altitude: 0,
        linestring: mergedLine,
      };
      return track;
    }
    const res = await fetch(url);
    return res.json();
  },
});

export const $selectedTrack = persistentAtom<string>(
  "selectedTrack",
  "Alps Divide ULTRA 2025 Section 1.gpx",
);

export const $trackStore = createFetcherStore<Track>(["", "/data/tracks/"]); 
