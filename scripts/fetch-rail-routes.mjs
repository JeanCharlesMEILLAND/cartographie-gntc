import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const dataPath = path.join(projectRoot, 'data', 'current.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const BROUTER_URL = 'https://brouter.de/brouter';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Compact offsets: exact + 4 cardinal at ~1km
const OFFSETS = [
  [0, 0],
  [0.01, 0],
  [-0.01, 0],
  [0, 0.014],
  [0, -0.014],
  [0.02, 0],
  [-0.02, 0],
  [0, 0.028],
  [0, -0.028],
];

async function tryBrouter(fromLon, fromLat, toLon, toLat) {
  const url = `${BROUTER_URL}?lonlats=${fromLon},${fromLat}|${toLon},${toLat}&profile=rail&alternativeidx=0&format=geojson`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await res.text();
    const geojson = JSON.parse(text);
    if (geojson.features && geojson.features.length > 0) {
      const coords = geojson.features[0].geometry.coordinates;
      const simplified = [];
      const step = Math.max(1, Math.floor(coords.length / 80));
      for (let i = 0; i < coords.length; i += step) {
        simplified.push([
          Math.round(coords[i][1] * 100000) / 100000,
          Math.round(coords[i][0] * 100000) / 100000
        ]);
      }
      const last = coords[coords.length - 1];
      const lastPt = [Math.round(last[1] * 100000) / 100000, Math.round(last[0] * 100000) / 100000];
      if (simplified.length === 0 || simplified[simplified.length - 1][0] !== lastPt[0] || simplified[simplified.length - 1][1] !== lastPt[1]) {
        simplified.push(lastPt);
      }
      return simplified;
    }
  } catch {}
  return null;
}

async function fetchRoute(fromLat, fromLon, toLat, toLon) {
  // Try from-offsets with exact to first
  for (const [dLat, dLon] of OFFSETS) {
    const r = await tryBrouter(fromLon + dLon, fromLat + dLat, toLon, toLat);
    if (r) return r;
    await sleep(200);
  }
  // Try to-offsets with exact from
  for (const [dLat, dLon] of OFFSETS.slice(1)) {
    const r = await tryBrouter(fromLon, fromLat, toLon + dLon, toLat + dLat);
    if (r) return r;
    await sleep(200);
  }
  return null;
}

async function main() {
  const routes = data.routes;
  console.log(`Processing ${routes.length} routes...`);

  const outPath = path.join(projectRoot, 'data', 'rail-geometries.json');
  let railGeometries = {};
  if (fs.existsSync(outPath)) {
    try { railGeometries = JSON.parse(fs.readFileSync(outPath, 'utf-8')); } catch {}
  }

  let success = Object.keys(railGeometries).length;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const key = `${route.from}||${route.to}`;

    if (railGeometries[key]) { skipped++; continue; }

    process.stdout.write(`[${i + 1}/${routes.length}] ${route.from} → ${route.to}... `);

    const coords = await fetchRoute(route.fromLat, route.fromLon, route.toLat, route.toLon);
    if (coords) {
      railGeometries[key] = coords;
      console.log(`OK (${coords.length} pts)`);
      success++;
      fs.writeFileSync(outPath, JSON.stringify(railGeometries), 'utf-8');
    } else {
      console.log('FAILED');
      failed++;
    }

    await sleep(500);
  }

  fs.writeFileSync(outPath, JSON.stringify(railGeometries), 'utf-8');
  console.log(`\n--- Done ---`);
  console.log(`Success: ${success} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
