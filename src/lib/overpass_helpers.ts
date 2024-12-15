import { bbox, buffer, simplify } from '@turf/turf';
import { type BBox, type LineString } from 'geojson';

export function createBoundingBox(lineString: LineString, bufferMeters: number): BBox {
    const simpleLineString = simplify(lineString, { tolerance: 0.001, highQuality: false })
    const buffered = buffer(simpleLineString, bufferMeters, { units: 'meters' })
    return bbox(buffered);
}

// TODO: rework query building
// 1. instead of searching for node, way, relation its possible to use nwr
// nwr: Searches for nodes, ways, and relations
// nw: Searches for nodes and ways
// nr: Searches for nodes and relations
// wr: Searches for ways and relations
//
// 2. when exactly are ways and relations important for us?
// how do we filter them out or process them if we want to display points?


export function constructOverpassQuery(bbox: BBox, selectors: string[][]): string {
    const [west, south, east, north] = bbox;

    // Convert selectors array into a query string for Overpass
    const selectorQueries = selectors
        .map(selector => {
            const [key, value] = selector;
            return `node["${key}"="${value}"](${south},${west},${north},${east});`;
            // return `node["${key}"="${value}"](${south},${west},${north},${east});\n  way["${key}"="${value}"](${south},${west},${north},${east});\n  relation["${key}"="${value}"](${south},${west},${north},${east});`;
        })
        .join('\n');

    // Wrap the selectors in an Overpass query
    return `
[out:json][timeout:25];
(
${selectorQueries}
);
out body;
>;
out skel qt;
`.trim();
}
