import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const dataPath = path.join(projectRoot, 'data', 'current.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const BROUTER_URL = 'https://brouter.de/brouter';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cache of platform -> nearest rail node coordinates
const railNodeCache = {};
const railNodeCachePath = path.join(projectRoot, 'data', 'rail-node-cache.json');
if (fs.existsSync(railNodeCachePath)) {
  try { Object.assign(railNodeCache, JSON.parse(fs.readFileSync(railNodeCachePath, 'utf-8'))); } catch {}
}

/**
 * Use Overpass API to find the nearest railway node (station, halt, yard, junction)
 * within a given radius of the platform coordinates
 */
async function findNearestRailNode(lat, lon, platformName) {
  const cacheKey = `${lat},${lon}`;
  if (railNodeCache[cacheKey]) return railNodeCache[cacheKey];

  // Search for railway infrastructure within increasing radii
  const radii = [3000, 5000, 8000, 12000, 20000];

  for (const radius of radii) {
    const query = `
      [out:json][timeout:15];
      (
        node["railway"="station"](around:${radius},${lat},${lon});
        node["railway"="halt"](around:${radius},${lat},${lon});
        node["railway"="yard"](around:${radius},${lat},${lon});
        node["railway"="junction"](around:${radius},${lat},${lon});
        node["railway"="facility"](around:${radius},${lat},${lon});
      );
      out body;
    `.trim();

    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(20000),
      });
      const json = await res.json();

      if (json.elements && json.elements.length > 0) {
        // Find the closest one by distance
        let closest = null;
        let minDist = Infinity;
        for (const el of json.elements) {
          const d = Math.sqrt((el.lat - lat) ** 2 + (el.lon - lon) ** 2);
          if (d < minDist) {
            minDist = d;
            closest = el;
          }
        }
        if (closest) {
          const result = { lat: closest.lat, lon: closest.lon, name: closest.tags?.name || 'unknown', dist: Math.round(minDist * 111000) };
          railNodeCache[cacheKey] = result;
          fs.writeFileSync(railNodeCachePath, JSON.stringify(railNodeCache, null, 2), 'utf-8');
          return result;
        }
      }
    } catch (err) {
      // Overpass might be rate-limited
      await sleep(2000);
    }
    await sleep(1000);
  }

  // No rail node found at all
  railNodeCache[cacheKey] = null;
  fs.writeFileSync(railNodeCachePath, JSON.stringify(railNodeCache, null, 2), 'utf-8');
  return null;
}

// Small offsets to try around a snapped point (BRouter might still not snap exactly)
const MICRO_OFFSETS = [
  [0, 0],
  [0.005, 0],
  [-0.005, 0],
  [0, 0.007],
  [0, -0.007],
  [0.01, 0],
  [-0.01, 0],
  [0, 0.014],
  [0, -0.014],
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
          Math.round(coords[i][0] * 100000) / 100000,
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

async function fetchRouteWithSnap(fromLat, fromLon, toLat, toLon, fromName, toName) {
  // Phase 1: Try exact coordinates with micro offsets
  for (const [dLat, dLon] of MICRO_OFFSETS.slice(0, 5)) {
    const r = await tryBrouter(fromLon + dLon, fromLat + dLat, toLon, toLat);
    if (r) return r;
    await sleep(150);
  }

  // Phase 2: Find nearest rail nodes via Overpass
  process.stdout.write('[Overpass snap] ');
  const fromNode = await findNearestRailNode(fromLat, fromLon, fromName);
  const toNode = await findNearestRailNode(toLat, toLon, toName);

  if (fromNode && toNode) {
    // Try with snapped coordinates
    for (const [dLat, dLon] of MICRO_OFFSETS) {
      const r = await tryBrouter(fromNode.lon + dLon, fromNode.lat + dLat, toNode.lon, toNode.lat);
      if (r) return r;
      await sleep(150);
    }
    for (const [dLat, dLon] of MICRO_OFFSETS.slice(1)) {
      const r = await tryBrouter(fromNode.lon, fromNode.lat, toNode.lon + dLon, toNode.lat + dLat);
      if (r) return r;
      await sleep(150);
    }
  } else if (fromNode) {
    // Only from snapped
    for (const [dLat, dLon] of MICRO_OFFSETS) {
      const r = await tryBrouter(fromNode.lon + dLon, fromNode.lat + dLat, toLon, toLat);
      if (r) return r;
      await sleep(150);
    }
  } else if (toNode) {
    // Only to snapped
    for (const [dLat, dLon] of MICRO_OFFSETS) {
      const r = await tryBrouter(fromLon, fromLat, toNode.lon + dLon, toNode.lat + dLat);
      if (r) return r;
      await sleep(150);
    }
  }

  // Phase 3: Try remaining original offsets (wider grid)
  const WIDE_OFFSETS = [
    [0.02, 0], [-0.02, 0], [0, 0.028], [0, -0.028],
    [0.03, 0], [-0.03, 0], [0, 0.042], [0, -0.042],
    [0.015, 0.015], [-0.015, 0.015], [0.015, -0.015], [-0.015, -0.015],
  ];

  for (const [dLat, dLon] of WIDE_OFFSETS) {
    const r = await tryBrouter(fromLon + dLon, fromLat + dLat, toLon, toLat);
    if (r) return r;
    await sleep(150);
  }

  return null;
}

async function main() {
  const routes = data.routes;
  const outPath = path.join(projectRoot, 'data', 'rail-geometries.json');
  let railGeometries = {};
  if (fs.existsSync(outPath)) {
    try { railGeometries = JSON.parse(fs.readFileSync(outPath, 'utf-8')); } catch {}
  }

  // Only process routes that previously failed
  const toProcess = routes.filter((r) => {
    const key = `${r.from}||${r.to}`;
    return !railGeometries[key];
  });

  console.log(`Total routes: ${routes.length} | Already resolved: ${Object.keys(railGeometries).length} | To retry: ${toProcess.length}`);
  console.log(`Rail node cache: ${Object.keys(railNodeCache).length} entries\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const route = toProcess[i];
    const key = `${route.from}||${route.to}`;

    // Skip if somehow resolved between iterations
    if (railGeometries[key]) continue;

    process.stdout.write(`[${i + 1}/${toProcess.length}] ${route.from} → ${route.to}... `);

    const coords = await fetchRouteWithSnap(
      route.fromLat, route.fromLon, route.toLat, route.toLon,
      route.from, route.to
    );

    if (coords) {
      railGeometries[key] = coords;
      console.log(`OK (${coords.length} pts)`);
      success++;
      fs.writeFileSync(outPath, JSON.stringify(railGeometries), 'utf-8');
    } else {
      console.log('FAILED');
      failed++;
    }

    await sleep(400);
  }

  fs.writeFileSync(outPath, JSON.stringify(railGeometries), 'utf-8');
  console.log(`\n--- Done ---`);
  console.log(`New successes: ${success} | Still failed: ${failed}`);
  console.log(`Total resolved: ${Object.keys(railGeometries).length} / ${routes.length}`);
  console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
