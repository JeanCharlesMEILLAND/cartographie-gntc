import { NextResponse } from 'next/server';
import type { FeatureCollection } from 'geojson';

export const dynamic = 'force-dynamic';

// Sandre WFS requires "application/json; subtype=geojson" as output format
const GEOJSON_FORMAT = encodeURIComponent('application/json; subtype=geojson');

const WATERWAYS_URL =
  `https://services.sandre.eaufrance.fr/geo/dpf?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=SegDPF&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

const PORTS_URL =
  `https://services.sandre.eaufrance.fr/geo/pts?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=PortMaritime&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

interface WaterwayData {
  waterways: FeatureCollection;
  ports: FeatureCollection;
}

// In-memory cache
let cache: WaterwayData | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

async function fetchGeoJSON(url: string): Promise<FeatureCollection | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };

// Keep only navigable waterways (filter out non-navigable segments)
function filterNavigable(fc: FeatureCollection): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fc.features.filter((f) => {
      const nav = f.properties?.['Navigabilité'] || '';
      return nav !== 'Non navigable' && nav !== '';
    }),
  };
}

// Freight-focused port filter:
// - Maritime ports: must have "Commerce" activity
// - Fluvial/Fluvio-maritime ports: keep unless ONLY plaisance/pêche
//   (Sandre doesn't tag fluvial ports with "Commerce" even when they do freight)
function filterFretPorts(fc: FeatureCollection): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fc.features.filter((f) => {
      const p = f.properties || {};
      const nature = p['MnNaturePort'] || '';

      // Collect all activities
      const activities: string[] = [];
      for (let i = 1; i <= 6; i++) {
        const act = p[`MnActivitePortuaire_${i}`] || '';
        if (act) activities.push(act);
      }

      const hasCommerce = activities.includes('Commerce');

      // Maritime: only if Commerce (fret)
      if (nature === 'Maritime') return hasCommerce;

      // Fluvial / Fluvio-maritime: keep unless exclusively plaisance/pêche
      if (nature === 'Fluvial' || nature === 'Fluvio-maritime') {
        if (hasCommerce) return true;
        // No activities listed → likely freight infrastructure, keep it
        if (activities.length === 0) return true;
        // Exclude if ALL activities are plaisance/pêche only
        const fretExcluded = new Set(['Plaisance', 'Peche', 'Pêche']);
        const onlyLeisure = activities.every((a) => fretExcluded.has(a));
        return !onlyLeisure;
      }

      // Unknown nature: only if Commerce
      return hasCommerce;
    }),
  };
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  const [rawWaterways, rawPorts] = await Promise.all([
    fetchGeoJSON(WATERWAYS_URL),
    fetchGeoJSON(PORTS_URL),
  ]);

  const data: WaterwayData = {
    waterways: rawWaterways ? filterNavigable(rawWaterways) : EMPTY_FC,
    ports: rawPorts ? filterFretPorts(rawPorts) : EMPTY_FC,
  };

  cache = data;
  cacheTime = Date.now();

  return NextResponse.json(data);
}
