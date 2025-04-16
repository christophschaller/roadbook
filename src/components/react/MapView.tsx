import { useRef, useEffect, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl/dist/es5/exports-maplibre.js";
import DeckGL from "@deck.gl/react";
import { PathLayer, PolygonLayer, IconLayer } from "@deck.gl/layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { trackStore } from "@/stores/trackStore";
import { areaStore } from "@/stores/areaStore";
import { poiStore } from "@/stores/poiStore";
import { useStore } from "@nanostores/react";
import { type LineString, type Polygon } from "geojson";
import type { PointOfInterest } from "@/types";
import type { TypeArea } from "@/types/area.types";
import { MainControlsBar } from "./MainControlsBar/MainControlsBar";

const MapView = () => {
  const mapRef = useRef(null);
  const track = useStore(trackStore);
  const area = useStore(areaStore);
  const pois = useStore(poiStore);

  const [viewState, setViewState] = useState({
    longitude: -0.09,
    latitude: 51.505,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  });
  const [trackData, setTrackData] = useState<LineString | null>(null);
  const [simpleTrackData, setSimpleTrackData] = useState<LineString | null>(null);
  const [typeAreas, setTypeAreas] = useState<TypeArea[] | null>(null);

  useEffect(() => {
    if (track.data) {
      const lineString = track.data.features[0].geometry as LineString;
      setTrackData(lineString);

      const simpleLineString = turf.simplify(lineString, {
        tolerance: 0.005,
        highQuality: false,
      });
      setSimpleTrackData(simpleLineString);

      // Set initial view to fit the track
      if (lineString.coordinates.length > 0) {
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(lineString);
        setViewState((prev) => ({
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
      const buffers: TypeArea[] = [];
      Object.entries(area.poiTypeMap).forEach(([id, poiType]) => {
        const buffered = turf.buffer(simpleTrackData, poiType.distance, {
          units: "meters",
        });
        if (buffered) {
          buffers.push({
            typeId: id,
            area: buffered,
          });
        }
      });
      setTypeAreas(buffers);
    }
  }, [simpleTrackData, area]);

  useEffect(() => {
    if (pois) {
      console.log("POI Data updated:", {
        totalPOIs: pois?.pois?.length,
        poiDetails: pois?.pois?.map((poi) => ({
          id: poi.id,
          category: poi.category,
          position: [poi.lon, poi.lat],
          trackDistance: poi.trackDistance,
        })),
      });
    }
  }, [pois]);

  console.log("area:", area)
  console.log("typeAreas:", typeAreas);

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
      simpleTrackData &&
      new PathLayer({
        id: "simpleTrack",
        data: simpleTrackData ? [{ path: simpleTrackData.coordinates }] : [],
        getPath: (d: any) =>
          d.path.map((coord: number[]) => [coord[0], coord[1]]), // Only use longitude and latitude
        getColor: [0, 255, 0],
        getWidth: 3,
        widthMinPixels: 2,
      }),
      typeAreas &&
      new PolygonLayer({
        id: "typeAreas",
        data: typeAreas ? typeAreas : [],
        getPolygon: (d: TypeArea) => d.area.geometry.coordinates,
        getLineColor: (d: TypeArea) => [
          ...area.poiTypeMap[d.typeId].color,
          150,
        ],
        getFillColor: (d: TypeArea) => [
          ...area.poiTypeMap[d.typeId].color,
          area.poiTypeMap[d.typeId].active ? 30 : 0,
        ],
        getLineWidth: 4,
        lineWidthMinPixels: 2,
        pickable: true,
      }),
      pois.pois &&
      new IconLayer({
        id: "pois",
        data: pois.pois.filter((d: PointOfInterest) => {
          console.log("poid d:", d);
          // Find the POI type and category for this POI
          const poiType = Object.values(area.poiTypeMap).find((type) =>
            Object.values(type.categories).some(
              (cat) => cat.id === d.category,
            ),
          );
          // Only show POIs for active types

          return poiType?.active ?? false;
        }),
        getPosition: (d: PointOfInterest) => [d.lon, d.lat],
        getIcon: (d: PointOfInterest) => ({
          url: "https://unpkg.com/lucide-static@0.469.0/icons/map-pin.svg",
          width: 256,
          height: 256,
          mask: true,
        }),
        getSize: 24,
        getColor: (d: PointOfInterest) => d.color || [255, 255, 255],
        pickable: true,
        onClick: (info: any) => {
          if (info.object) {
            console.log(`Clicked POI: ${info.object.id}`);
            console.log("trackDistance:", info.object.trackDistance);
            console.log("category:", info.object.category);
            console.log("poi object:", info.object);
          }
        },
        // props added by DataFilterExtension
        getFilterValue: (d: PointOfInterest) => d.trackDistance,
        filterRange: [
          0,
          Math.max(...Object.values(area.poiTypeMap).map((t) => t.distance)),
        ],
        // Define extensions
        extensions: [new DataFilterExtension({ filterSize: 1 })],
      }),
    ],
    [trackData, simpleTrackData, pois, area],
  );

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100vh" }}
      className="relative"
    >
      <DeckGL initialViewState={viewState} controller={true} layers={layers}>
        <Map
          mapStyle="https://tiles.stadiamaps.com/styles/outdoors.json"
          mapLib={maplibregl}
        />
      </DeckGL>
      <MainControlsBar />
    </div>
  );
};

export default MapView;
