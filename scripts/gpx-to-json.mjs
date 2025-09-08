#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';
import * as turf from '@turf/turf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readTextFile(absPath) {
  const buf = await fs.readFile(absPath);
  return buf.toString('utf8');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function convertGpxFile(absInputPath, absOutputPath) {
  const xml = await readTextFile(absInputPath);
  const parser = new XmldomParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  // Try to get track name from <gpx><trk><name>
  let name = path.basename(absInputPath);
  const trkEls = doc.getElementsByTagName('trk');
  if (trkEls && trkEls.length > 0) {
    const nameEls = trkEls[0].getElementsByTagName('name');
    if (nameEls && nameEls.length > 0 && nameEls[0].textContent) {
      name = nameEls[0].textContent.trim();
    }
  } else {
    const anyName = doc.getElementsByTagName('name');
    if (anyName && anyName.length > 0 && anyName[0].textContent) {
      name = anyName[0].textContent.trim();
    }
  }

  // Collect coordinates from all <trkpt lat="" lon=""> in document order
  const trkptEls = doc.getElementsByTagName('trkpt');
  const coordinates = [];
  for (let i = 0; i < trkptEls.length; i++) {
    const el = trkptEls[i];
    const lat = parseFloat(el.getAttribute('lat'));
    const lon = parseFloat(el.getAttribute('lon'));
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      coordinates.push([lon, lat]);
    }
  }

  if (coordinates.length < 2) {
    throw new Error(`No valid track points found in GPX: ${absInputPath}`);
  }

  const linestring = {
    type: 'LineString',
    coordinates,
  };

  const distanceKm = turf.length(linestring, { units: 'kilometers' });

  const track = {
    name,
    distance: Math.round(distanceKm * 10) / 10,
    altitude: 0,
    linestring,
  };

  await fs.writeFile(absOutputPath, JSON.stringify(track, null, 2) + '\n', 'utf8');
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const tracksDir = path.resolve(projectRoot, 'public/data/tracks');
  const outDir = tracksDir; // write JSON next to GPX files

  const entries = await fs.readdir(tracksDir, { withFileTypes: true });
  const gpxFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.gpx'))
    .map((e) => e.name)
    .sort();

  if (gpxFiles.length === 0) {
    console.error('No GPX files found in', tracksDir);
    process.exit(1);
  }

  await ensureDir(outDir);

  for (const name of gpxFiles) {
    const inPath = path.join(tracksDir, name);
    const outPath = path.join(outDir, name.replace(/\.gpx$/i, '.json'));
    process.stdout.write(`Converting ${name} -> ${path.basename(outPath)}... `);
    try {
      await convertGpxFile(inPath, outPath);
      console.log('done');
    } catch (e) {
      console.log('failed');
      console.error(e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


