import { useRef, useEffect, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import {
  Map,
  AttributionControl,
} from "react-map-gl/dist/es5/exports-maplibre.js";
import DeckGL from "@deck.gl/react";
import { type PickingInfo } from "@deck.gl/core";
import { PathLayer, PolygonLayer, IconLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import {
  $trackStore,
  resourceViewStore,
  $poiStore,
  riderStore,
  favoritesStore,
} from "@/stores";
import { useStore } from "@nanostores/react";
import { type LineString, type Polygon } from "geojson";
import type { PointOfInterest } from "@/types";
import type { ResourceArea } from "@/types/area.types";
import { MainControls } from "./MainControlsBar/MainControls";
import { PoiTooltip } from "@/components/react/PoiTooltip";
import ClusterIconLayer from "./IconClusterLayer";
import type { MapViewState } from "@deck.gl/core";

const getLucideSvgUrl = (componentName: string) => {
  const kebabCaseName = componentName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
  return `https://unpkg.com/lucide-static@0.469.0/icons/${kebabCaseName}.svg`;
};

const MapView = () => {
  const mapRef = useRef(null);
  const { data: track, loading: trackLoading } = useStore($trackStore);
  const resourceView = useStore(resourceViewStore);
  const { data: pois, loading: poisLoading } = useStore($poiStore);
  const favorites = useStore(favoritesStore);
  const riders = useStore(riderStore);
  // console.log(riders);

  const [poiInfo, setPoiInfo] = useState<PickingInfo<PointOfInterest> | null>();

  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -0.09,
    latitude: 51.505,
    zoom: 13,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  });
  const [simpleTrackData, setSimpleTrackData] = useState<LineString | null>(
    null,
  );
  const [resourceAreas, setResourceAreas] = useState<ResourceArea[] | null>(
    null,
  );

  useEffect(() => {
    if (!trackLoading && track?.linestring) {
      const simpleLineString = turf.simplify(track.linestring, {
        tolerance: 0.003,
        highQuality: false,
      });
      setSimpleTrackData(simpleLineString);

      // Set initial view to fit the track
      if (track.linestring.coordinates?.length > 0) {
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(track.linestring);
        setViewState((prev: MapViewState) => ({
          ...prev,
          longitude: (minLng + maxLng) / 2,
          latitude: (minLat + maxLat) / 2,
          zoom: 12,
        }));
      }
    }
  }, [track?.linestring]);

  useEffect(() => {
    if (simpleTrackData) {
      const buffers: ResourceArea[] = [];
      Object.entries(resourceView).forEach(([id, resource]) => {
        const buffered = turf.buffer(simpleTrackData, resource.distance, {
          units: "meters",
        });
        if (buffered) {
          buffers.push({
            resourceId: id,
            area: buffered,
          });
        }
      });
      setResourceAreas(buffers);
    }
  }, [simpleTrackData, resourceView]);

  const layers = useMemo(
    () => [
      (!trackLoading && track) &&
        new PathLayer({
          id: "track",
          data: track ? [{ path: track.linestring.coordinates }] : [],
          getColor: [0, 0, 0],
          getWidth: 3,
          widthMinPixels: 2,
        }),
      resourceAreas &&
        new PolygonLayer({
          id: "resourceAreas",
          data: resourceAreas ? resourceAreas : [],
          getPolygon: (d: ResourceArea) => d.area.geometry.coordinates,
          getLineColor: (d: ResourceArea) => [
            ...resourceView[d.resourceId].color,
            150,
          ],
          getFillColor: (d: ResourceArea) => [
            ...resourceView[d.resourceId].color,
            resourceView[d.resourceId].active ? 30 : 0,
          ],
          getLineWidth: 4,
          lineWidthMinPixels: 2,
          pickable: true,
        }),
      (!poisLoading && pois) &&
        new ClusterIconLayer({
          id: "pois",
          data: pois.filter((d: PointOfInterest) => {
            if (favorites.some((f) => f.toString() === d.id.toString()))
              return true;
            const resource = resourceView[d.resourceId || ""];
            if (!resource || !resource.active) return false;
            const resourceCategory =
              resource.categories[d.resourceCategoryId || ""];
            return (
              (resourceCategory?.active &&
                typeof d.trackDistance === "number" &&
                d.trackDistance <= resource.distance) ??
              false
            );
          }),
          getPosition: (d: PointOfInterest) => [d.lon, d.lat],
          getIcon: (d: PointOfInterest) => ({
            url: getLucideSvgUrl(
              resourceView[d.resourceId || ""].categories[
                d.resourceCategoryId || ""
                // @ts-ignore render error from lucide-react
              ].icon.render.name,
            ),
            width: 256,
            height: 256,
            mask: true,
          }),
          getSize: 24,
          getColor: (d: PointOfInterest) =>
            favorites.some((f) => f.toString() === d.id.toString())
              ? [255, 255, 255]
              : d.color,
          getBackgroundRadius: (d: PointOfInterest) =>
            favorites.some((f) => f.toString() === d.id.toString()) ? 20 : 16,
          getBackgroundColor: (d: PointOfInterest) =>
            favorites.some((f) => f.toString() === d.id.toString())
              ? d.color
              : [255, 255, 255],
          getLineColor: [255, 255, 255],
          getLineWidth: (d: PointOfInterest) =>
            favorites.some((f) => f.toString() === d.id.toString()) ? 4 : 0,
          pickable: true,
          clusterRadius: 40,
          minZoom: 0,
          maxZoom: 16,
        }),
    ],
    [track, simpleTrackData, resourceAreas, pois, resourceView, favorites],
  );

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100vh" }}
      className="relative"
    >
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={() => setPoiInfo(null)}
        onClick={(info) => {
          if (info && info.object) {
            if ("type" in info.object && info.object["type"] == "node") {
              setPoiInfo(info);
              return;
            }
            if (
              "properties" in info.object &&
              "cluster" in info.object["properties"] &&
              info.object["properties"]["cluster"]
            ) {
              const clusterId = info.object.properties.cluster_id;
            }
          }
          setPoiInfo(null);
        }}
      >
        <Map
          mapStyle="https://tiles.stadiamaps.com/styles/outdoors.json"
          mapLib={maplibregl}
          attributionControl={false}
        >
          <AttributionControl
            position="bottom-right"
            compact={true}
          />
        </Map>
        {poiInfo?.object && (
          <PoiTooltip
            poi={poiInfo.object as PointOfInterest}
            viewport={poiInfo.viewport}
            onClose={() => setPoiInfo(null)}
          />
        )}
      </DeckGL>
      <MainControls />
    </div>
  );
};

export default MapView;
