import { readFile } from "node:fs/promises";
import path from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import * as turf from "@turf/turf";
import type { LineString } from "geojson";

export function parseGpxCoordinates(absInputPath: string, xml: string): LineString {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const trkptEls = doc.getElementsByTagName("trkpt");
  const coordinates: [number, number][] = [];

  for (let i = 0; i < trkptEls.length; i++) {
    const el = trkptEls[i];
    const lat = parseFloat(el.getAttribute("lat") ?? "");
    const lon = parseFloat(el.getAttribute("lon") ?? "");
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      coordinates.push([lon, lat]);
    }
  }

  if (coordinates.length < 2) {
    throw new Error(`No valid track points found in GPX: ${absInputPath}`);
  }

  return { type: "LineString", coordinates };
}

export async function readGpxLineString(absInputPath: string): Promise<LineString> {
  const xml = await readFile(absInputPath, "utf8");
  return parseGpxCoordinates(absInputPath, xml);
}

export async function mergeGpxDirectory(gpxDir: string): Promise<{
  linestring: LineString;
  distanceKm: number;
}> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(gpxDir, { withFileTypes: true });
  const gpxFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".gpx"))
    .map((e) => e.name)
    .sort();

  if (gpxFiles.length === 0) {
    throw new Error(`No GPX files in ${gpxDir}`);
  }

  const coordinates: [number, number][] = [];
  for (const name of gpxFiles) {
    const line = await readGpxLineString(path.join(gpxDir, name));
    coordinates.push(...(line.coordinates as [number, number][]));
  }

  const linestring: LineString = { type: "LineString", coordinates };
  const distanceKm = turf.length(linestring, { units: "kilometers" });

  return { linestring, distanceKm };
}
