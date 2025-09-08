import { persistentAtom } from "@nanostores/persistent";
import type { Track } from "@/types";
import { nanoquery } from "@nanostores/query";
import * as turf from "@turf/turf";
import type { LineString } from "geojson";

export const [createFetcherStore] = nanoquery({
  fetcher: async (...keys) => {
    const url = keys.join("");
    // If requesting a single JSON track file, passthrough to JSON
    if (url.toLowerCase().endsWith(".json")) {
      const res = await fetch(url);
      return res.json();
    }

    // If requesting the tracks base path, load and merge all sections into one track
    if (url.endsWith("/data/tracks/") || url.endsWith("/data/tracks")) {
      const sections = [
        "Alps Divide ULTRA 2025 Section 1.json",
        "Alps Divide ULTRA 2025 Section 2.json",
        "Alps Divide ULTRA 2025 Section 3.json",
        "Alps Divide ULTRA 2025 Section 4.json",
        "Alps Divide ULTRA 2025 Section 5.json",
      ];

      const features: LineString[] = [];
      for (const file of sections) {
        const res = await fetch(`${url.endsWith("/") ? url : url + "/"}${file}`);
        const trackJson: Track = await res.json();
        if (trackJson?.linestring?.type === "LineString") {
          features.push(trackJson.linestring as LineString);
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
  "Alps Divide ULTRA 2025 Section 1.json",
);

export const $trackStore = createFetcherStore<Track>(["", "/data/tracks/"]); 
