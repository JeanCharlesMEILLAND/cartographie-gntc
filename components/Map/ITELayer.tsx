'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';

// Shared cache across all SNCF layer components
let sncfCache: { ite: FeatureCollection; iteDispo: FeatureCollection; voieUnique: FeatureCollection; voieDouble: FeatureCollection; electrification: FeatureCollection } | null = null;
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

function ITEMarkers({ data, color, borderColor, keyPrefix }: { data: FeatureCollection; color: string; borderColor: string; keyPrefix: string }) {
  return (
    <>
      {data.features.map((f, i) => {
        const coords = f.geometry?.type === 'Point' ? (f.geometry as GeoJSON.Point).coordinates : null;
        if (!coords) return null;
        const p = f.properties || {};
        const raison = (p['Raison_sociale'] || '').trim();
        const commune = p['Commune'] || '';
        const name = raison || `ITE ${p['ID_ITE'] || i}`;
        const product = p['Produit_transporté'] || '';
        const convention = p['Convention_active'] || '';
        const circulation = p['Circulation_récente'] || '';

        return (
          <CircleMarker
            key={`${keyPrefix}-${i}`}
            center={[coords[1], coords[0]]}
            radius={4}
            pathOptions={{
              fillColor: color,
              color: borderColor,
              fillOpacity: 0.8,
              weight: 1.5,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div className="text-xs" style={{ maxWidth: 220, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                <strong className="block truncate" style={{ maxWidth: 220 }}>{name}</strong>
                {commune && <div className="text-muted truncate">{commune}</div>}
                {product && <div className="text-muted truncate">{product}</div>}
                <div className="text-[10px] text-muted" style={{ lineHeight: 1.3 }}>
                  Convention: {convention || '—'} · Circulation: {circulation || '—'}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function ITELayer() {
  const showITE = useFilterStore((s) => s.showITE);
  const showITEDispo = useFilterStore((s) => s.showITEDispo);
  const [data, setData] = useState<{ ite: FeatureCollection; iteDispo: FeatureCollection } | null>(null);

  useEffect(() => {
    if ((!showITE && !showITEDispo) || data) return;
    fetchSNCFLayers().then((d) => {
      if (d?.ite && d?.iteDispo) setData({ ite: d.ite, iteDispo: d.iteDispo });
    });
  }, [showITE, showITEDispo, data]);

  if (!data) return null;

  return (
    <>
      {showITE && <ITEMarkers data={data.ite} color="#f1c40f" borderColor="#f39c12" keyPrefix="ite" />}
      {showITEDispo && <ITEMarkers data={data.iteDispo} color="#3498db" borderColor="#2980b9" keyPrefix="ite-dispo" />}
    </>
  );
}
