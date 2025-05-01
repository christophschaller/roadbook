import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import { Map, AttributionControl, ScaleControl } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { type PickingInfo } from "@deck.gl/core";
import { PathLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import {
  $trackStore,
  resourceViewStore,
  $poiStore,
  $displayRiders,
  $riderStore,
  $focusRider,
  favoritesStore,
  $isTracking,
  $location,
} from "@/stores";
import { useStore } from "@nanostores/react";
import { type LineString } from "geojson";
import type { PointOfInterest, Rider } from "@/types";
import type { ResourceArea } from "@/types/area.types";
import { MainControls } from "@/components/react/MainControlsBar/MainControls";
import { PoiTooltip } from "@/components/react/MapView/PoiTooltip";
import ClusterIconLayer from "@/components/react/MapView/layers/IconClusterLayer";
import type { MapViewState } from "@deck.gl/core";
import { WebMercatorViewport, FlyToInterpolator } from "@deck.gl/core";
import TextWithBackgroundLayer from "@/components/react/MapView/layers/TextWithBackgroundLayer";
import { RiderTooltip } from "./RiderTooltip";
import { getRiderColor } from "@/lib/utils";
import GeoLocateButton from "./GeoLocateButton";

const MapView = () => {
  const mapRef = React.useRef(null);
  const isMobile = useIsMobile();
  const { data: track, loading: trackLoading } = useStore($trackStore);
  const resourceView = useStore(resourceViewStore);
  const { data: pois, loading: poisLoading } = useStore($poiStore);
  const { data: riders, loading: ridersLoading } = useStore($riderStore);
  const displayRiders = useStore($displayRiders);
  const focusRider = useStore($focusRider);
  const favorites = useStore(favoritesStore);
  const isTracking = useStore($isTracking);
  const location = useStore($location);
  const isNewTracking = React.useRef(true);

  const [poiInfo, setPoiInfo] = useState<PickingInfo<PointOfInterest> | null>();

  const viewport = new WebMercatorViewport({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 9.501,
    latitude: 40.92,
    zoom: 13,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    setPoiInfo(null);
  }, [viewState]);

  useEffect(() => {
    if (
      isTracking &&
      location &&
      location.latitude &&
      location.longitude &&
      isNewTracking.current
    ) {
      isNewTracking.current = false;
      setViewState((prev: MapViewState) => ({
        longitude: location.longitude,
        latitude: location.latitude,
        zoom: 15, // Adjust this value as needed for your specific use case
        transitionDuration: 1000, // Optional: animate the transition
        transitionInterpolator: new FlyToInterpolator(),
      }));
    }
  }, [isTracking, location]);

  useEffect(() => {
    if (!isTracking) {
      isNewTracking.current = true;
    }
  }, [isTracking]);

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
        const { longitude, latitude, zoom } = viewport.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 50 }, // Optional: add padding around the bounds
        );
        setViewState((prev: MapViewState) => ({
          longitude,
          latitude,
          zoom,
          transitionDuration: 1000, // Optional: animate the transition
          transitionInterpolator: new FlyToInterpolator(),
        }));
      }
    }
  }, [track?.linestring]);

  useEffect(() => {
    focusRider &&
      setViewState((prev: MapViewState) => ({
        longitude: focusRider?.lon,
        latitude: focusRider?.lat,
        zoom: 15, // Adjust this value as needed for your specific use case
        transitionDuration: 1000, // Optional: animate the transition
        transitionInterpolator: new FlyToInterpolator(),
      }));
  }, [focusRider]);

  useEffect(() => {
    if (simpleTrackData) {
      const buffers: ResourceArea[] = [];
      Object.entries(resourceView).forEach(([id, resource]) => {
        if (id != "shardana") {
          const buffered = turf.buffer(simpleTrackData, resource.distance, {
            units: "meters",
          });
          if (buffered) {
            buffers.push({
              resourceId: id,
              area: buffered,
            });
          }
        }
      });
      setResourceAreas(buffers);
    }
  }, [simpleTrackData, resourceView]);

  const layers = useMemo(
    () => [
      isTracking &&
        location &&
        new ScatterplotLayer({
          id: "user-accuracy",
          data: [location],
          getPosition: (d) => [d.longitude, d.latitude],
          getRadius: (d) => d.accuracy,
          radiusUnits: "meters",
          filled: true,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 1,
          getFillColor: [0, 166, 244, 20],
          getLineColor: [0, 166, 244],
          pickable: false,
        }),
      !trackLoading &&
        track &&
        new PathLayer({
          id: "track",
          data: track ? [{ path: track.linestring.coordinates }] : [],
          getColor: [82, 38, 98],
          getWidth: 5,
          widthUnits: "meters",
          widthMinPixels: 2,
          capRounded: true,
          jointRounded: true,
        }),
      resourceAreas &&
        new PolygonLayer({
          id: "resourceAreas",
          data: resourceAreas ? resourceAreas : [],
          getPolygon: (d: ResourceArea) => d.area.geometry.coordinates,
          getLineColor: (d: ResourceArea) => [
            ...resourceView[d.resourceId].color,
            resourceView[d.resourceId].active ? 150 : 0,
          ],
          getFillColor: (d: ResourceArea) => [
            ...resourceView[d.resourceId].color,
            resourceView[d.resourceId].active ? 30 : 0,
          ],
          getLineWidth: 4,
          lineWidthMinPixels: 2,
          pickable: true,
        }),
      !poisLoading &&
        pois &&
        new ClusterIconLayer({
          id: "pois",
          data: pois.filter((d: PointOfInterest) => {
            if (favorites.some((f) => f.toString() === d.id.toString()))
              return true;
            const resource = resourceView[d.resourceId || ""];
            if (!resource || !resource.active) return false;
            if (resource.id === "shardana") {
              return (
                (Array.isArray(d.resourceCategoryIdList) &&
                  d.resourceCategoryIdList.some(
                    (id) => resource.categories[id]?.active,
                  )) ??
                false
              );
            }
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
            url: `/icons/${d.icon}.svg`,
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
      displayRiders &&
        riders &&
        new TextWithBackgroundLayer({
          id: "riders",
          data: riders,
          getPosition: (d: Rider) => [d.lon, d.lat],
          getText: (d: Rider) =>
            d.cap_number !== "-" ? d.cap_number : d.display_name.charAt(0),
          getBackgroundRadius: 16,
          getSize: (d: Rider) => (d.cap_number !== "-" ? 15 :20),
          getBackgroundColor: (d: Rider) => getRiderColor(d.username || ""),
          sizeUnits: "pixels",
          getTextAnchor: "middle",
          getAlignmentBaseline: "center",
          getPixelOffset: [0,1],
        }),
      isTracking &&
        location &&
        new ScatterplotLayer({
          id: "user-location",
          data: [location],
          getPosition: (d) => [d.longitude, d.latitude],
          getRadius: 5,
          radiusUnits: "pixels",
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 2,
          getFillColor: [0, 166, 244],
          getLineColor: [255, 255, 255],
          pickable: false,
        }),
    ],
    [
      track,
      simpleTrackData,
      resourceAreas,
      pois,
      resourceView,
      favorites,
      riders,
      displayRiders,
      isTracking,
      location,
    ],
  );

  return (
    <div style={{ width: "100%", height: "100vh" }} className="relative">
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onClick={(info) => {
          if (info && info.object) {
            if (
              "type" in info.object &&
              (info.object["type"] === "node" ||
                info.object["type"] === "rider")
            ) {
              setPoiInfo(info);
              return;
            }

            if (
              "properties" in info.object &&
              "cluster" in info.object["properties"] &&
              info.object["properties"]["cluster"]
            ) {
              const { longitude, latitude, zoom } = viewport.fitBounds(
                info.object.properties.bbox,
                { padding: 100 },
              );
              setViewState((prev: MapViewState) => ({
                longitude,
                latitude,
                zoom,
                transitionDuration: 1000, // Optional: animate the transition
                transitionInterpolator: new FlyToInterpolator(),
              }));
            }
          }
          setPoiInfo(null);
        }}
      >
        <Map
          ref={mapRef}
          mapStyle="https://tiles.stadiamaps.com/styles/outdoors.json"
          mapLib={maplibregl}
          attributionControl={false}
        >
          <AttributionControl
            position={isMobile ? "top-right" : "bottom-right"}
            compact={true}
          />
          {!isMobile && <ScaleControl />}
        </Map>
        {poiInfo?.object && poiInfo.object["type"] === "node" && (
          <PoiTooltip
            poi={poiInfo.object as PointOfInterest}
            viewport={poiInfo.viewport}
            onClose={() => setPoiInfo(null)}
          />
        )}
        {poiInfo?.object && poiInfo.object["type"] === "rider" && (
          <RiderTooltip
            rider={poiInfo.object as Rider}
            viewport={poiInfo.viewport}
            onClose={() => setPoiInfo(null)}
          />
        )}
      </DeckGL>
      <MainControls />
      <GeoLocateButton />
    </div>
  );
};

export default MapView;
