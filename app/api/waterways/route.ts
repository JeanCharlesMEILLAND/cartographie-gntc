import { NextResponse } from 'next/server';
import type { FeatureCollection } from 'geojson';
import { db } from '@cartographie/shared/db';
import { ports } from '@cartographie/shared/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Sandre WFS for waterways (voies navigables) — ports now come from DB
const GEOJSON_FORMAT = encodeURIComponent('application/json; subtype=geojson');
const WATERWAYS_URL =
  `https://services.sandre.eaufrance.fr/geo/dpf?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=SegDPF&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

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

// Load ports from database and convert to GeoJSON
async function loadPortsFromDB(): Promise<FeatureCollection> {
  try {
    const rows = await db.select().from(ports).where(eq(ports.visible, 1));

    return {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
        },
        properties: {
          NomPort: row.name,
          LbCommune: row.commune || '',
          MnNaturePort: row.nature || '',
          MnModeGestionPort: row.gestion || '',
          NomZonePortuaire: row.zone || '',
          MnActivitePortuaire_1: row.hasCommerce ? 'Commerce' : '',
          source: row.source,
          osmId: row.sourceId || '',
          cargo: row.cargo || '',
          CdPort: row.source === 'sandre' ? row.sourceId : '',
        },
      })),
    };
  } catch {
    return EMPTY_FC;
  }
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  const [rawWaterways, portsFC] = await Promise.all([
    fetchGeoJSON(WATERWAYS_URL),
    loadPortsFromDB(),
  ]);

  const data: WaterwayData = {
    waterways: rawWaterways ? filterNavigable(rawWaterways) : EMPTY_FC,
    ports: portsFC,
  };

  cache = data;
  cacheTime = Date.now();

  return NextResponse.json(data);
}
