import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BROUTER_URL = 'https://brouter.de/brouter';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const GEO_PATH = path.join(process.cwd(), 'public', 'rail-geometries.json');

// Mêmes offsets que fetch-rail-routes-v2.mjs
const MICRO_OFFSETS: [number, number][] = [
  [0, 0],
  [0.005, 0], [-0.005, 0], [0, 0.007], [0, -0.007],
  [0.01, 0], [-0.01, 0], [0, 0.014], [0, -0.014],
];

const WIDE_OFFSETS: [number, number][] = [
  [0.02, 0], [-0.02, 0], [0, 0.028], [0, -0.028],
  [0.02, 0.028], [-0.02, 0.028], [0.02, -0.028], [-0.02, -0.028],
  [0.04, 0], [-0.04, 0], [0, 0.056], [0, -0.056],
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryBrouter(fromLon: number, fromLat: number, toLon: number, toLat: number): Promise<[number, number][] | null> {
  const url = `${BROUTER_URL}?lonlats=${fromLon},${fromLat}|${toLon},${toLat}&profile=rail&alternativeidx=0&format=geojson`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    if (text.includes('not mapped')) return null;
    const geojson = JSON.parse(text);
    if (geojson.features?.length > 0) {
      const coords = geojson.features[0].geometry.coordinates;
      const simplified: [number, number][] = [];
      const step = Math.max(1, Math.floor(coords.length / 80));
      for (let i = 0; i < coords.length; i += step) {
        simplified.push([
          Math.round(coords[i][1] * 100000) / 100000,
          Math.round(coords[i][0] * 100000) / 100000,
        ]);
      }
      const last = coords[coords.length - 1];
      const lastPt: [number, number] = [Math.round(last[1] * 100000) / 100000, Math.round(last[0] * 100000) / 100000];
      if (!simplified.length || simplified[simplified.length - 1][0] !== lastPt[0] || simplified[simplified.length - 1][1] !== lastPt[1]) {
        simplified.push(lastPt);
      }
      return simplified;
    }
  } catch { /* brouter failure */ }
  return null;
}

async function findNearestRailNode(lat: number, lon: number): Promise<{ lat: number; lon: number } | null> {
  const radii = [3000, 5000, 8000, 12000, 20000];
  for (const radius of radii) {
    const query = `[out:json][timeout:15];(node["railway"="station"](around:${radius},${lat},${lon});node["railway"="halt"](around:${radius},${lat},${lon});node["railway"="yard"](around:${radius},${lat},${lon});node["railway"="junction"](around:${radius},${lat},${lon});node["railway"="facility"](around:${radius},${lat},${lon}););out body;`;
    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(20000),
      });
      const json = await res.json();
      if (json.elements?.length > 0) {
        let closest = json.elements[0];
        let minDist = Infinity;
        for (const el of json.elements) {
          const d = Math.sqrt((el.lat - lat) ** 2 + (el.lon - lon) ** 2);
          if (d < minDist) { minDist = d; closest = el; }
        }
        return { lat: closest.lat as number, lon: closest.lon as number };
      }
    } catch { /* overpass failure */ }
    await sleep(500);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { from, to, fromLat, fromLon, toLat, toLon } = await req.json();
    if (!from || !to || !fromLat || !toLat) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const key = `${from}||${to}`;
    const reverseKey = `${to}||${from}`;

    // Vérifier si déjà existant
    let existing: Record<string, [number, number][]> = {};
    try { existing = JSON.parse(fs.readFileSync(GEO_PATH, 'utf-8')); } catch { /* empty */ }
    if (existing[key] || existing[reverseKey]) {
      return NextResponse.json({ key, geometry: existing[key] || existing[reverseKey], cached: true });
    }

    let geometry: [number, number][] | null = null;

    // Phase 1 : essai direct avec micro-offsets (coordonnées brutes)
    for (const [dLat, dLon] of MICRO_OFFSETS) {
      geometry = await tryBrouter(fromLon + dLon, fromLat + dLat, toLon, toLat);
      if (geometry) break;
      // Essai inverse (from offset sur to)
      geometry = await tryBrouter(fromLon, fromLat, toLon + dLon, toLat + dLat);
      if (geometry) break;
      await sleep(100);
    }

    // Phase 2 : snap Overpass — trouver les noeuds ferroviaires les plus proches
    if (!geometry) {
      const [fromNode, toNode] = await Promise.all([
        findNearestRailNode(fromLat, fromLon),
        findNearestRailNode(toLat, toLon),
      ]);

      if (fromNode && toNode) {
        for (const [dLat, dLon] of MICRO_OFFSETS) {
          geometry = await tryBrouter(fromNode.lon + dLon, fromNode.lat + dLat, toNode.lon, toNode.lat);
          if (geometry) break;
          geometry = await tryBrouter(fromNode.lon, fromNode.lat, toNode.lon + dLon, toNode.lat + dLat);
          if (geometry) break;
          await sleep(100);
        }
      }

      // Phase 2b : un seul côté snappé
      if (!geometry && fromNode) {
        for (const [dLat, dLon] of MICRO_OFFSETS.slice(0, 5)) {
          geometry = await tryBrouter(fromNode.lon + dLon, fromNode.lat + dLat, toLon, toLat);
          if (geometry) break;
        }
      }
      if (!geometry && toNode) {
        for (const [dLat, dLon] of MICRO_OFFSETS.slice(0, 5)) {
          geometry = await tryBrouter(fromLon, fromLat, toNode.lon + dLon, toNode.lat + dLat);
          if (geometry) break;
        }
      }
    }

    // Phase 3 : offsets larges (dernier recours)
    if (!geometry) {
      for (const [dLat, dLon] of WIDE_OFFSETS) {
        geometry = await tryBrouter(fromLon + dLon, fromLat + dLat, toLon, toLat);
        if (geometry) break;
        geometry = await tryBrouter(fromLon, fromLat, toLon + dLon, toLat + dLat);
        if (geometry) break;
        await sleep(100);
      }
    }

    if (!geometry) {
      return NextResponse.json({ key, geometry: null, error: 'No rail route found' });
    }

    // Sauvegarder dans le fichier pour persistance
    existing[key] = geometry;
    fs.writeFileSync(GEO_PATH, JSON.stringify(existing), 'utf-8');

    return NextResponse.json({ key, geometry, cached: false });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
