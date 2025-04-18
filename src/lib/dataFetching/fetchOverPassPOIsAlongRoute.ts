import queryOverpass from "@derhuerst/query-overpass";
import {
  createBoundingBox,
  constructOverpassQuery,
} from "@/lib/overpass_helpers";
import { poiStore } from "@/stores/poiStore";
import type { PointOfInterest, Resource } from "@/types";
import { type LineString } from "geojson";
import * as turf from "@turf/turf";

export   function fetchPOIsAlongRoute({
  resources,
  lineString,
  bufferMeters,
}: {
  resources: Record<string, Resource>;
  lineString: LineString;
  bufferMeters: number;
}) {
  const selectors = Object.values(resources)
    .flatMap((resource) => Object.values(resource.categories))
    .flatMap((category) => category.osmTags)
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

        const resourceIdAndCategory = Object.entries(resources)
          .flatMap(([resourceId, resource]) =>
            Object.values(resource.categories).map((category) => ({
              resourceId,
              category,
            })),
          )
          .find(({ category }) =>
            category.osmTags.some(([key, value]) => poi.tags[key] === value),
          );
        poi.resourceId = resourceIdAndCategory?.resourceId;
        poi.resourceCategoryId =
          resourceIdAndCategory?.category?.id || "unknown";
        poi.icon = resourceIdAndCategory?.category?.icon;
        poi.color = resourceIdAndCategory
          ? resources[resourceIdAndCategory.resourceId].color
          : [0, 0, 0];
      });
      poiStore.set(pois);
    })
    .catch(console.error);
}