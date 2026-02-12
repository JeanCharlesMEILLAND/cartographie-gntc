import { NextResponse } from 'next/server';
import type { FeatureCollection } from 'geojson';

const ITE_URL = 'https://www.data.gouv.fr/api/1/datasets/r/a31e504f-ad5c-4b78-916e-f9ed30d789b7';
const REGIME_URL = 'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/regime-dexploitation-des-lignes/exports/geojson';
const ELEC_URL = 'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/liste-des-lignes-electrifiees/exports/geojson';

// In-memory cache (persists across requests in the same server process)
let cache: { ite: FeatureCollection; regime: FeatureCollection; electrification: FeatureCollection } | null = null;
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

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  const [iteRaw, regime, electrification] = await Promise.all([
    fetchJSON(ITE_URL),
    fetchJSON(REGIME_URL),
    fetchJSON(ELEC_URL),
  ]);

  // Filter ITE: only active sites (convention active or recent circulation)
  let ite: FeatureCollection = { type: 'FeatureCollection', features: [] };
  if (iteRaw) {
    ite = {
      type: 'FeatureCollection',
      features: iteRaw.features.filter((f) => {
        const p = f.properties || {};
        return (
          p['Convention_active'] === 'Oui' ||
          p['Circulation_récente'] === 'Oui' ||
          p['Convention_Active'] === 'Oui' ||
          p['Circulation_recente'] === 'Oui' ||
          p['circulation_recente'] === 'Oui' ||
          p['convention_active'] === 'Oui'
        );
      }),
    };
  }

  const result = {
    ite,
    regime: regime || { type: 'FeatureCollection' as const, features: [] },
    electrification: electrification || { type: 'FeatureCollection' as const, features: [] },
  };

  cache = result;
  cacheTime = Date.now();

  return NextResponse.json(result);
}
