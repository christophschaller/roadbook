import fs from "node:fs/promises";
import path from "node:path";
import * as turf from "@turf/turf";
import type { FeatureCollection, LineString } from "geojson";

const TRKPT_REGEX = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"/g;

export interface MergedTrack {
  lineString: LineString;
  geojson: FeatureCollection;
  distance: number;
}

function parseGpxLineString(content: string): LineString {
  const coordinates: number[][] = [];

  for (const match of content.matchAll(TRKPT_REGEX)) {
    const lat = Number.parseFloat(match[1]);
    const lon = Number.parseFloat(match[2]);
    coordinates.push([lon, lat]);
  }

  if (coordinates.length === 0) {
    throw new Error("No track points found in GPX file");
  }

  return {
    type: "LineString",
    coordinates,
  };
}

export async function mergeGpxDirectory(
  gpxDir: string,
  displayName: string,
): Promise<MergedTrack> {
  const entries = await fs.readdir(gpxDir);
  const gpxFiles = entries.filter((name) => name.toLowerCase().endsWith(".gpx")).sort();

  if (gpxFiles.length === 0) {
    throw new Error(`No GPX files found in ${gpxDir}`);
  }

  const coordinates: number[][] = [];

  for (const fileName of gpxFiles) {
    const content = await fs.readFile(path.join(gpxDir, fileName), "utf-8");
    const segment = parseGpxLineString(content);
    coordinates.push(...segment.coordinates);
  }

  const lineString: LineString = {
    type: "LineString",
    coordinates,
  };

  const geojson: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: lineString,
        properties: { name: displayName },
      },
    ],
  };

  const distance = turf.length(geojson.features[0], { units: "kilometers" });

  return {
    lineString,
    geojson,
    distance: Math.round(distance * 10) / 10,
  };
}
