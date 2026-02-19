import { NextResponse } from 'next/server';
import type { FeatureCollection, Feature, Point } from 'geojson';

export const dynamic = 'force-dynamic';

// Sandre WFS requires "application/json; subtype=geojson" as output format
const GEOJSON_FORMAT = encodeURIComponent('application/json; subtype=geojson');

const WATERWAYS_URL =
  `https://services.sandre.eaufrance.fr/geo/dpf?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=SegDPF&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

const PORTS_URL =
  `https://services.sandre.eaufrance.fr/geo/pts?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=PortMaritime&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

// Overpass query for industrial port areas in France bounding box
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const INLAND_PORTS_QUERY = `[out:json][timeout:120];(way["industrial"="port"](42.0,-5.5,51.5,8.5);relation["industrial"="port"](42.0,-5.5,51.5,8.5););out center tags;`;

interface OverpassElement {
  type: 'way' | 'relation';
  id: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

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

// Fetch inland/fluvial ports from OpenStreetMap via Overpass
async function fetchInlandPorts(): Promise<Feature<Point>[]> {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(INLAND_PORTS_QUERY)}`,
      next: { revalidate: 43200 },
    });
    if (!res.ok) return [];
    const data: OverpassResponse = await res.json();

    return data.elements
      .filter((el) => {
        // Must have center coordinates
        if (!el.center) return false;
        // Exclude maritime/seaports (already from Sandre)
        const tags = el.tags || {};
        if (tags['seamark:type']) return false;
        if (tags['port:type'] === 'seaport') return false;
        return true;
      })
      .map((el) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [el.center!.lon, el.center!.lat],
        },
        properties: {
          NomPort: el.tags?.name || 'Port fluvial',
          LbCommune: '',
          MnNaturePort: 'Fluvial',
          MnModeGestionPort: el.tags?.operator || '',
          NomZonePortuaire: '',
          MnActivitePortuaire_1: 'Commerce',
          source: 'osm',
          osmId: el.id,
          cargo: el.tags?.cargo || '',
        },
      }));
  } catch {
    return [];
  }
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

  const [rawWaterways, rawPorts, inlandPortFeatures] = await Promise.all([
    fetchGeoJSON(WATERWAYS_URL),
    fetchGeoJSON(PORTS_URL),
    fetchInlandPorts(),
  ]);

  // Combine Sandre maritime ports (filtered) + OSM inland ports
  const maritimePorts = rawPorts ? filterFretPorts(rawPorts) : EMPTY_FC;
  const combinedPorts: FeatureCollection = {
    type: 'FeatureCollection',
    features: [...maritimePorts.features, ...inlandPortFeatures],
  };

  const data: WaterwayData = {
    waterways: rawWaterways ? filterNavigable(rawWaterways) : EMPTY_FC,
    ports: combinedPorts,
  };

  cache = data;
  cacheTime = Date.now();

  return NextResponse.json(data);
}
