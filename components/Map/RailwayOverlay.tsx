'use client';

import { useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';

export default function RailwayOverlay() {
  const showRailway = useFilterStore((s) => s.showRailway);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showRailway || geoData) return;
    fetch('/sncf-rfn.geojson')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setGeoData(data); })
      .catch(() => {});
  }, [showRailway, geoData]);

  if (!showRailway || !geoData) return null;

  return (
    <GeoJSONLayer
      key="sncf-rfn"
      data={geoData}
      style={{
        color: '#6b7db3',
        weight: 1,
        opacity: 0.35,
      }}
      interactive={false}
    />
  );
}
