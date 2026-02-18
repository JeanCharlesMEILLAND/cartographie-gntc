'use client';

import { useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';

let waterwayCache: { waterways: FeatureCollection; ports: FeatureCollection } | null = null;
let fetchPromise: Promise<typeof waterwayCache> | null = null;

export async function fetchWaterwayData() {
  if (waterwayCache) return waterwayCache;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch('/api/waterways')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      waterwayCache = data;
      fetchPromise = null;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return null;
    });
  return fetchPromise;
}

export default function WaterwayLayer() {
  const showWaterways = useFilterStore((s) => s.showWaterways);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showWaterways || geoData) return;
    fetchWaterwayData().then((d) => {
      if (d?.waterways) setGeoData(d.waterways);
    });
  }, [showWaterways, geoData]);

  if (!showWaterways || !geoData) return null;

  return (
    <GeoJSONLayer
      key="waterways"
      data={geoData}
      style={{
        color: '#2196F3',
        weight: 1.5,
        opacity: 0.4,
      }}
      interactive={false}
    />
  );
}
