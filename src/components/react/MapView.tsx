import { useRef, useEffect, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl/dist/es5/exports-maplibre.js";
import DeckGL from "@deck.gl/react";
import { type PickingInfo } from "@deck.gl/core";
import { PathLayer, PolygonLayer, IconLayer } from "@deck.gl/layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { trackStore, resourceViewStore, poiStore, riderStore, favoritesStore } from "@/stores";
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
  const track = useStore(trackStore);
  const resourceView = useStore(resourceViewStore);
  const pois = useStore(poiStore);
  const favorites = useStore(favoritesStore);
  const riders = useStore(riderStore);
  console.log(riders);

  const [poiInfo, setPoiInfo] =
    useState<PickingInfo<PointOfInterest> | null>();

  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -0.09,
    latitude: 51.505,
    zoom: 13,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  });
  const [trackData, setTrackData] = useState<LineString | null>(null);
  const [simpleTrackData, setSimpleTrackData] = useState<LineString | null>(
    null,
  );
  const [resourceAreas, setResourceAreas] = useState<ResourceArea[] | null>(
    null,
  );

  useEffect(() => {
    if (track.data) {
      const lineString = track.data.features[0].geometry as LineString;
      setTrackData(lineString);

      const simpleLineString = turf.simplify(lineString, {
        tolerance: 0.003,
        highQuality: false,
      });
      setSimpleTrackData(simpleLineString);

      // Set initial view to fit the track
      if (lineString.coordinates.length > 0) {
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(lineString);
        setViewState((prev: MapViewState) => ({
          ...prev,
          longitude: (minLng + maxLng) / 2,
          latitude: (minLat + maxLat) / 2,
          zoom: 12,
        }));
      }
    }
  }, [track]);

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
      trackData &&
        new PathLayer({
          id: "track",
          data: trackData ? [{ path: trackData.coordinates }] : [],
          getPath: (d: any) =>
            d.path.map((coord: number[]) => [coord[0], coord[1]]), // Only use longitude and latitude
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
      pois &&
        new ClusterIconLayer({
          id: "pois",
          data: pois.filter((d: PointOfInterest) => {
            if (favorites.some((f) => f.toString() === d.id.toString())) return true;
            const resource = resourceView[d.resourceId || ""];
            if (!resource || !resource.active) return false;
            const resourceCategory =
              resource.categories[d.resourceCategoryId || ""];
            return (
              (resourceCategory?.active && typeof d.trackDistance === "number" && d.trackDistance <= resource.distance) ??
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
                favorites.some((f) => f.toString() === d.id.toString()) ? [255, 255, 255] : d.color,
              getBackgroundRadius: (d: PointOfInterest) =>
              favorites.some((f) => f.toString() === d.id.toString()) ? 20 : 16,
              getBackgroundColor: (d: PointOfInterest) =>
                favorites.some((f) => f.toString() === d.id.toString()) ? d.color : [255, 255, 255],
              getLineColor: [255, 255, 255],
              getLineWidth: (d: PointOfInterest) =>
                favorites.some((f) => f.toString() === d.id.toString()) ? 4 : 0,
              pickable: true,
          clusterRadius: 40,
          minZoom: 0,
          maxZoom: 16,
        }),
    ],
    [trackData, simpleTrackData, resourceAreas, pois, resourceView, favorites],
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
        />
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
