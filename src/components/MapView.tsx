import React, { useRef, useEffect, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl/dist/es5/exports-maplibre.js';
import DeckGL from '@deck.gl/react';
import { PathLayer, PolygonLayer, IconLayer } from '@deck.gl/layers'
import { DataFilterExtension } from '@deck.gl/extensions';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf'
import { trackStore } from '../stores/trackStore';
import { areaStore } from '../stores/areaStore';
import { poiStore, type Poi } from '../stores/poiStore';
import { useStore } from '@nanostores/react';
import { type LineString, type Polygon } from 'geojson';

const MapView = () => {
    const mapRef = useRef(null);
    const track = useStore(trackStore);
    const area = useStore(areaStore);
    const pois = useStore(poiStore);

    const basePath = import.meta.env.GITHUB_BASE_PATH || import.meta.env.PUBLIC_BASE_PATH || '/';

    const [viewState, setViewState] = useState({
        longitude: -0.09,
        latitude: 51.505,
        zoom: 13,
        pitch: 0,
        bearing: 0
    })
    const [trackData, setTrackData] = useState<LineString | null>(null)
    const [simpleTrackData, setSimpleTrackData] = useState<LineString | null>(null)
    const [areaSize, setAreaSize] = useState<number>(500)
    const [areaTags, setAreaTags] = useState<string[]>([])
    const [areaData, setAreaData] = useState<Polygon | null>(null)
    const [poiData, setPoiData] = useState<Poi[] | null>(null)


    useEffect(() => {
        if (track.data) {
            const lineString = track.data.features[0].geometry as LineString
            setTrackData(lineString)

            const simpleLineString = turf.simplify(lineString, { tolerance: 0.001, highQuality: false })
            setSimpleTrackData(simpleLineString)

            // Set initial view to fit the track
            if (lineString.coordinates.length > 0) {
                const [minLng, minLat, maxLng, maxLat] = turf.bbox(lineString)
                setViewState(prev => ({
                    ...prev,
                    longitude: (minLng + maxLng) / 2,
                    latitude: (minLat + maxLat) / 2,
                    zoom: 12
                }))
            }
        }
    }, [track])

    useEffect(() => {
        setAreaSize(area.distance)
        setAreaTags(area.activeTags)
    }, [area])

    useEffect(() => {
        if (simpleTrackData) {
            const buffered = turf.buffer(simpleTrackData, area.distance, { units: "meters" });
            setAreaData(buffered)
        }
    }, [simpleTrackData, area])

    useEffect(() => {
        if (pois.pois) {
            setPoiData(pois.pois)
        }
    }, [pois])

    console.log(poiData)
    console.log(areaSize)
    console.log(areaTags)

    const layers = useMemo(() => [
        trackData && new PathLayer({
            id: 'track',
            data: trackData ? [{ path: trackData.coordinates }] : [],
            getPath: (d: any) => d.path.map((coord: number[]) => [coord[0], coord[1]]), // Only use longitude and latitude
            getColor: [0, 0, 0],
            getWidth: 3,
            widthMinPixels: 2,
        }),
        simpleTrackData && new PathLayer({
            id: 'simpleTrack',
            data: simpleTrackData ? [{ path: simpleTrackData.coordinates }] : [],
            getPath: (d: any) => d.path.map((coord: number[]) => [coord[0], coord[1]]), // Only use longitude and latitude
            getColor: [0, 255, 0],
            getWidth: 3,
            widthMinPixels: 2,
        }),
        areaData && new PolygonLayer({
            id: 'buffer',
            data: areaData ? [areaData] : [],
            getPolygon: (d: any) => d.geometry.coordinates,
            getFillColor: [0, 0, 255, 50],
            getLineColor: [0, 0, 255, 255],
            getLineWidth: 2,
            lineWidthMinPixels: 1,
            pickable: true,
        }),
        poiData && new IconLayer({
            id: 'pois',
            data: poiData,
            getPosition: (d: any) => [d.lon, d.lat],
            getIcon: (d: any) => ({
                url: "https://unpkg.com/lucide-static@0.469.0/icons/map-pin.svg",
                width: 128,
                height: 128,
                anchorY: 128,
            }),
            getSize: 24,
            getColor: [0, 0, 255], // TODO: no effect?
            pickable: true,
            onClick: (info: any) => {
                if (info.object) {
                    console.log(`Clicked POI: ${info.object.id}`)
                    console.log("trackDistance:", info.object.trackDistance)
                    console.log("categories:", info.object.categories)
                }
            },
            // props added by DataFilterExtension
            getFilterValue: (d: Poi) => d.trackDistance,
            filterRange: [0, areaSize,], // TODO: maybe filterSoftRange would look nice? if the pois fade after hitting the max distance

            getFilterCategory: (d: Poi) => d.categories,
            filterCategories: areaTags,
            // Define extensions
            extensions: [new DataFilterExtension({ filterSize: 1, categorySize: 1 })]
        })
    ], [trackData, simpleTrackData, areaData, poiData, areaSize, areaTags])

    return (
        <div ref={mapRef} style={{ width: '100%', height: '400px' }}>
            <DeckGL
                initialViewState={viewState}
                controller={true}
                layers={layers}
            >
                <Map
                    mapStyle="https://tiles.stadiamaps.com/styles/outdoors.json"
                    mapLib={maplibregl}
                />
            </DeckGL>
        </div>
    );
};

export default MapView;
