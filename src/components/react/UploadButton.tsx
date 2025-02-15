'use client'

import { Upload } from 'lucide-react'
import queryOverpass from '@derhuerst/query-overpass';
import { parseGPX, type GeoJSON } from "@we-gold/gpxjs";
import { Button } from '@/components/ui/button'
import { createBoundingBox, constructOverpassQuery } from '@/lib/overpass_helpers';
import { trackStore } from '@/stores/trackStore';
import { poiStore } from '@/stores/poiStore';
import type { PointOfInterest } from '@/types';
import { type LineString } from 'geojson'
import * as turf from '@turf/turf'
import { poiTypes } from '@/lib/data';


export default function UploadButton() {

    const fetchPOIsAlongRoute = (lineString: LineString, bufferMeters: number) => {

        const selectors = Object.values(poiTypes[0].categories)
            .flatMap(category => category.tags)
            .map(selector => [selector[0], selector[1]]);

        const bbox = createBoundingBox(lineString, bufferMeters);
        const query = constructOverpassQuery(bbox, selectors);

        const linestring2d = turf.lineString(lineString.coordinates.map((coord: number[]) => [coord[0], coord[1]]))

        queryOverpass(query)
            .then((pois: PointOfInterest[]) => {
                pois.forEach(poi => {
                    poi.trackDistance = turf.pointToLineDistance(turf.point([poi.lon, poi.lat]), linestring2d, { units: "meters" })

                    const category = poiTypes[0].categories.find(category =>
                        category.tags.some(([key, value]) =>
                            poi.tags[key] === value
                        ))
                    poi.category = category?.id || 'unknown'
                    poi.icon = category?.icon
                    poi.color = poiTypes[0].color

                });
                poiStore.set({ pois: pois })
            })
            .catch(console.error)
    }

    const handleFileUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            if (content.includes('<gpx')) {
                const [gpx, err] = parseGPX(content)
                const geojson = gpx?.toGeoJSON()

                if (geojson) {
                    trackStore.set({
                        name: geojson.properties.name || file.name,
                        data: geojson, // Store raw GPX or process into a desired format (e.g., GeoJSON)
                    });
                    fetchPOIsAlongRoute(geojson.features[0].geometry as LineString, 2500)
                } else {
                    console.error("Invalid GPX file. Please ensure it's a valid GPX format.")
                }
            } else {
                console.error("Invalid GPX file. Please ensure it's a valid GPX format.")
            }
        }
        reader.readAsText(file)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    return (
        <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <Upload className="mr-2 h-4 w-4" />
            Upload GPX Track
            <input
                id="file-upload"
                type="file"
                accept=".gpx"
                className="hidden"
                onChange={handleFileChange}
            />
        </Button>
    )
}
