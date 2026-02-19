import type { FeatureCollection } from 'geojson';

interface SNCFLayerData {
  voieUnique: FeatureCollection;
  voieDouble: FeatureCollection;
  electrification: FeatureCollection;
}

let sncfCache: SNCFLayerData | null = null;
let fetchPromise: Promise<SNCFLayerData | null> | null = null;

export async function fetchSNCFLayers(): Promise<SNCFLayerData | null> {
  if (sncfCache) return sncfCache;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch('/api/sncf-layers')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) sncfCache = data;
      fetchPromise = null;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return null;
    });
  return fetchPromise;
}
