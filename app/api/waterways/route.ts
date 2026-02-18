import { NextResponse } from 'next/server';
import type { FeatureCollection } from 'geojson';

export const dynamic = 'force-dynamic';

const WATERWAYS_URL =
  'https://services.sandre.eaufrance.fr/geo/dpf?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=SegDPF&SRSNAME=EPSG:4326&OUTPUTFORMAT=application/json';

const PORTS_URL =
  'https://services.sandre.eaufrance.fr/geo/pts?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=PortMaritime&SRSNAME=EPSG:4326&OUTPUTFORMAT=application/json';

interface WaterwayData {
  waterways: FeatureCollection;
  ports: FeatureCollection;
}

// In-memory cache
let cache: WaterwayData | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchGeoJSON(url: string): Promise<FeatureCollection | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  const [waterways, ports] = await Promise.all([
    fetchGeoJSON(WATERWAYS_URL),
    fetchGeoJSON(PORTS_URL),
  ]);

  const data: WaterwayData = {
    waterways: waterways || EMPTY_FC,
    ports: ports || EMPTY_FC,
  };

  cache = data;
  cacheTime = Date.now();

  return NextResponse.json(data);
}
