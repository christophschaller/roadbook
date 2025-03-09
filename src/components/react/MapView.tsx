import React, { useRef, useEffect, useState, useMemo } from "react";
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
import { type Feature, type LineString, type Polygon } from "geojson";
import type { PointOfInterest } from "@/types";
import type { TypeArea } from "@/types/area.types";
import { MapSidebar } from "./MapSidebar";

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
  const [simpleTrackData, setSimpleTrackData] = useState<LineString | null>(
    null,
  );
  const [areaData, setAreaData] = useState<[string, Polygon][] | null>(null);
  const [poiData, setPoiData] = useState<PointOfInterest[] | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [typeAreas, setTypeAreas] = useState<TypeArea[] | null>(null);

  useEffect(() => {
    if (track.data) {
      const lineString = track.data.features[0].geometry as LineString;
      setTrackData(lineString);

      const simpleLineString = turf.simplify(lineString, {
        tolerance: 0.001,
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
        buffers.push({
          typeId: id,
          area: buffered,
        });
      });
      setTypeAreas(buffers);
    }
  }, [simpleTrackData, area]);

  useEffect(() => {
    if (pois.pois) {
      setPoiData(pois.pois);
    }
  }, [pois]);

  //console.log(area)
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
      // simpleTrackData && new PathLayer({
      //     id: 'simpleTrack',
      //     data: simpleTrackData ? [{ path: simpleTrackData.coordinates }] : [],
      //     getPath: (d: any) => d.path.map((coord: number[]) => [coord[0], coord[1]]), // Only use longitude and latitude
      //     getColor: [0, 255, 0],
      //     getWidth: 3,
      //     widthMinPixels: 2,
      // }),
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
      // poiData && new IconLayer({
      //     id: 'pois',
      //     data: poiData.filter((d: PointOfInterest) => area.activeTags.includes(d.category)),
      //     getPosition: (d: any) => [d.lon, d.lat],
      //     getIcon: (d: PointOfInterest) => ({
      //         url: d.icon, //"https://unpkg.com/lucide-static@0.469.0/icons/map-pin.svg",
      //         width: 256,
      //         height: 256,
      //         mask: true,
      //     }),
      //     getSize: 24,
      //     getColor: (d: PointOfInterest) => d.color, // White background circle
      //     pickable: true,
      //     onClick: (info: any) => {
      //         if (info.object) {
      //             console.log(`Clicked POI: ${info.object.id}`)
      //             console.log("trackDistance:", info.object.trackDistance)
      //             console.log("category:", info.object.category)
      //             console.log("poi object:", info.object)
      //         }
      //     },
      //     // props added by DataFilterExtension
      //     getFilterValue: (d: PointOfInterest) => d.trackDistance,
      //     filterRange: [0, area.distance,], // TODO: maybe filterSoftRange would look nice? if the pois fade after hitting the max distance

      //     // Define extensions
      //     extensions: [new DataFilterExtension({ filterSize: 1 })]
      // })
    ],
    [trackData, simpleTrackData, areaData, poiData, area],
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
      <MapSidebar trackData={trackData} typeAreas={typeAreas} area={area} />
    </div>
  );
};

export default MapView;
