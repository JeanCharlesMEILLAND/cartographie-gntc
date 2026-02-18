import { NextResponse } from 'next/server';
import type { FeatureCollection, Feature, Point } from 'geojson';

export const dynamic = 'force-dynamic';

// Overpass API query for lock gates in France
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OVERPASS_QUERY = `[out:json][timeout:120];node["waterway"="lock_gate"](41.0,-5.5,51.5,10.0);out body;`;

interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassNode[];
}

// In-memory cache
let cache: FeatureCollection | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours (OSM data changes slowly)

const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };

// Group nearby lock gates into single lock points (~200m proximity)
function deduplicateLocks(nodes: OverpassNode[]): Feature<Point>[] {
  const PROXIMITY = 0.002; // ~200m in degrees
  const used = new Set<number>();
  const features: Feature<Point>[] = [];

  for (let i = 0; i < nodes.length; i++) {
    if (used.has(i)) continue;
    const group = [nodes[i]];
    used.add(i);

    // Find nearby gates (same lock)
    for (let j = i + 1; j < nodes.length; j++) {
      if (used.has(j)) continue;
      const dlat = Math.abs(nodes[i].lat - nodes[j].lat);
      const dlon = Math.abs(nodes[i].lon - nodes[j].lon);
      if (dlat < PROXIMITY && dlon < PROXIMITY) {
        group.push(nodes[j]);
        used.add(j);
      }
    }

    // Average coordinates of the group
    const lat = group.reduce((s, n) => s + n.lat, 0) / group.length;
    const lon = group.reduce((s, n) => s + n.lon, 0) / group.length;

    // Pick the best name from the group
    const name = group.find((n) => n.tags?.name)?.tags?.name || '';

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name,
        gateCount: group.length,
        osmId: group[0].id,
      },
    });
  }

  return features;
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      next: { revalidate: 43200 },
    });

    if (!res.ok) {
      return NextResponse.json(cache || EMPTY_FC);
    }

    const data: OverpassResponse = await res.json();
    const features = deduplicateLocks(data.elements);

    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    cache = fc;
    cacheTime = Date.now();

    return NextResponse.json(fc);
  } catch {
    return NextResponse.json(cache || EMPTY_FC);
  }
}
