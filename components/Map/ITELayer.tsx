'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';

// Shared cache across all SNCF layer components
let sncfCache: { ite: FeatureCollection; regime: FeatureCollection; electrification: FeatureCollection } | null = null;
let fetchPromise: Promise<typeof sncfCache> | null = null;

export async function fetchSNCFLayers() {
  if (sncfCache) return sncfCache;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch('/api/sncf-layers')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      sncfCache = data;
      fetchPromise = null;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return null;
    });
  return fetchPromise;
}

export default function ITELayer() {
  const showITE = useFilterStore((s) => s.showITE);
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showITE || data) return;
    fetchSNCFLayers().then((d) => {
      if (d?.ite) setData(d.ite);
    });
  }, [showITE, data]);

  if (!showITE || !data) return null;

  return (
    <>
      {data.features.map((f, i) => {
        const coords = f.geometry?.type === 'Point' ? (f.geometry as GeoJSON.Point).coordinates : null;
        if (!coords) return null;
        const p = f.properties || {};
        const name = p['Nom_ITE'] || p['nom_ite'] || p['NOM_ITE'] || p['nom'] || `ITE ${i}`;
        const product = p['Produit_transporté'] || p['produit_transporte'] || p['Produit_transporte'] || '';
        const convention = p['Convention_active'] || p['convention_active'] || '';
        const circulation = p['Circulation_récente'] || p['Circulation_recente'] || p['circulation_recente'] || '';

        return (
          <CircleMarker
            key={`ite-${i}`}
            center={[coords[1], coords[0]]}
            radius={4}
            pathOptions={{
              fillColor: '#7dc243',
              color: '#7dc243',
              fillOpacity: 0.8,
              weight: 1.5,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div className="text-xs max-w-[200px]">
                <strong>{name}</strong>
                {product && <div className="text-muted">{product}</div>}
                <div className="text-[10px] text-muted">
                  Convention: {convention || '—'} | Circulation: {circulation || '—'}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
