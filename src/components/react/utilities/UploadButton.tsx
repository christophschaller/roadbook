"use client";

import { Plus, RefreshCw } from "lucide-react";
import queryOverpass from "@derhuerst/query-overpass";
import { parseGPX, type GeoJSON } from "@we-gold/gpxjs";
import { Button } from "@/components/ui/button";
import {
  createBoundingBox,
  constructOverpassQuery,
} from "@/lib/overpass_helpers";
import { trackStore } from "@/stores/trackStore";
import { poiStore } from "@/stores/poiStore";
import type { PointOfInterest } from "@/types";
import { type LineString } from "geojson";
import * as turf from "@turf/turf";
import { poiTypes } from "@/lib/data";
import { useStore } from "@nanostores/react";

export default function UploadButton({
  className = "",
}: {
  className?: string;
}) {
  const track = useStore(trackStore);

  const fetchPOIsAlongRoute = (
    lineString: LineString,
    bufferMeters: number,
  ) => {
    const selectors = Object.values(poiTypes)
      .flatMap((poiType) => Object.values(poiType.categories))
      .flatMap((category) => category.tags)
      .map((selector) => [selector[0], selector[1]]);

    const bbox = createBoundingBox(lineString, bufferMeters);
    const query = constructOverpassQuery(bbox, selectors);

    const linestring2d = turf.lineString(
      lineString.coordinates.map((coord: number[]) => [coord[0], coord[1]]),
    );

    queryOverpass(query)
      .then((pois: PointOfInterest[]) => {
        pois.forEach((poi) => {
          poi.trackDistance = turf.pointToLineDistance(
            turf.point([poi.lon, poi.lat]),
            linestring2d,
            { units: "meters" },
          );

          const category = Object.values(poiTypes).reduce((found, poiType) => {
            if (found) return found;
            return Object.values(poiType.categories).find((category) =>
              category.tags.some(([key, value]) => poi.tags[key] === value),
            );
          }, null);
          poi.category = category?.id || "unknown";
          poi.icon = category?.icon;
          poi.color = poiTypes[0].color;
        });
        poiStore.set({ pois: pois });
      })
      .catch(console.error);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content.includes("<gpx")) {
        const [gpx, err] = parseGPX(content);
        const geojson = gpx?.toGeoJSON();

        if (geojson) {
          trackStore.set({
            name: geojson.properties.name || file.name,
            data: geojson, // Store raw GPX or process into a desired format (e.g., GeoJSON)
          });
          fetchPOIsAlongRoute(geojson.features[0].geometry as LineString, 2500);
        } else {
          console.error(
            "Invalid GPX file. Please ensure it's a valid GPX format.",
          );
        }
      } else {
        console.error(
          "Invalid GPX file. Please ensure it's a valid GPX format.",
        );
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Button
      variant={track.data ? "outline" : "default"}
      className={`${className} md:w-full`}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      {track.data ? (
        <RefreshCw className="h-4 w-4 md:mr-2" />
      ) : (
        <Plus className="h-4 w-4 md:mr-2" />
      )}
      <span className="hidden md:inline">
        {track.data ? "Upload New Track" : "Upload GPX Track"}
      </span>
      <input
        id="file-upload"
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={handleFileChange}
      />
    </Button>
  );
}
