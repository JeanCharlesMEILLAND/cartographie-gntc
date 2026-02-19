import { NextResponse } from 'next/server';
import type { FeatureCollection, Feature } from 'geojson';

export const dynamic = 'force-dynamic';

const REGIME_URL = 'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/regime-dexploitation-des-lignes/exports/geojson';
const ELEC_URL = 'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/liste-des-lignes-electrifiees/exports/geojson';

interface SNCFData {
  voieUnique: FeatureCollection;
  voieDouble: FeatureCollection;
  electrification: FeatureCollection;
}

// In-memory cache
let cache: SNCFData | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchJSON(url: string): Promise<FeatureCollection | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const VOIE_UNIQUE_TYPES = new Set([
  'Voie unique',
  'Voie unique à signalisation simplifiée',
  'Voie unique à trafic restreint (consigne de ligne)',
  'Régime particulier de voie unique autre que trafic restreint',
]);

const VOIE_DOUBLE_TYPES = new Set([
  'Double voie',
  'Voie banalisée',
  'Régime en navette',
]);

export async function GET() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  const [regime, elecRaw] = await Promise.all([
    fetchJSON(REGIME_URL),
    fetchJSON(ELEC_URL),
  ]);

  // Split regime into voie unique / voie double
  let voieUnique: FeatureCollection = { type: 'FeatureCollection', features: [] };
  let voieDouble: FeatureCollection = { type: 'FeatureCollection', features: [] };
  if (regime) {
    const unique: Feature[] = [];
    const double: Feature[] = [];
    for (const f of regime.features) {
      const t = (f.properties?.exploitati || '') as string;
      if (VOIE_UNIQUE_TYPES.has(t)) unique.push(f);
      else if (VOIE_DOUBLE_TYPES.has(t)) double.push(f);
    }
    voieUnique = { type: 'FeatureCollection', features: unique };
    voieDouble = { type: 'FeatureCollection', features: double };
  }

  // Build electrification with real geometries from regime
  let electrification: FeatureCollection = { type: 'FeatureCollection', features: [] };
  if (elecRaw && regime) {
    // Index regime geometries by code_ligne + rg_troncon
    const geoIndex = new Map<string, Feature[]>();
    for (const f of regime.features) {
      const p = f.properties || {};
      const key = `${p.code_ligne}_${p.rg_troncon}`;
      const arr = geoIndex.get(key);
      if (arr) arr.push(f);
      else geoIndex.set(key, [f]);
    }

    const elecFeatures: Feature[] = [];
    for (const f of elecRaw.features) {
      const p = f.properties || {};
      const key = `${p.code_ligne}_${p.rg_troncon}`;
      const regimeMatches = geoIndex.get(key);

      if (regimeMatches) {
        // Use regime geometry with electrification properties
        for (const rm of regimeMatches) {
          elecFeatures.push({
            type: 'Feature',
            geometry: rm.geometry,
            properties: { ...p, exploitati: rm.properties?.exploitati },
          });
        }
      } else if (p.x_d_wgs84 && p.y_d_wgs84 && p.x_f_wgs84 && p.y_f_wgs84) {
        // Fallback: straight line from start/end coords
        elecFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [p.x_d_wgs84, p.y_d_wgs84],
              [p.x_f_wgs84, p.y_f_wgs84],
            ],
          },
          properties: p,
        });
      }
    }
    electrification = { type: 'FeatureCollection', features: elecFeatures };
  } else if (elecRaw) {
    electrification = elecRaw;
  }

  const result: SNCFData = {
    voieUnique,
    voieDouble,
    electrification,
  };

  cache = result;
  cacheTime = Date.now();

  return NextResponse.json(result);
}
