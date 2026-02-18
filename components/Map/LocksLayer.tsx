'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';

let locksCache: FeatureCollection | null = null;
let fetchPromise: Promise<FeatureCollection | null> | null = null;

async function fetchLocksData() {
  if (locksCache) return locksCache;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch('/api/locks')
    .then((res) => (res.ok ? res.json() : null))
    .then((data: FeatureCollection | null) => {
      locksCache = data;
      fetchPromise = null;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return null;
    });
  return fetchPromise;
}

export default function LocksLayer() {
  const showLocks = useFilterStore((s) => s.showLocks);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showLocks || geoData) return;
    fetchLocksData().then((d) => {
      if (d) setGeoData(d);
    });
  }, [showLocks, geoData]);

  if (!showLocks || !geoData) return null;

  return (
    <>
      {geoData.features.map((f, i) => {
        const geom = f.geometry;
        if (!geom || geom.type !== 'Point') return null;
        const coords = (geom as GeoJSON.Point).coordinates;
        const p = f.properties || {};
        const name = p.name || '';

        return (
          <CircleMarker
            key={`lock-${p.osmId || i}`}
            center={[coords[1], coords[0]]}
            radius={3.5}
            pathOptions={{
              fillColor: '#FF6F00',
              color: '#fff',
              fillOpacity: 0.85,
              weight: 1,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
              <div className="text-xs" style={{ maxWidth: 200 }}>
                <strong>{name || 'Écluse'}</strong>
                {p.gateCount > 1 && (
                  <div className="text-[10px] opacity-60">
                    {p.gateCount} portes
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
