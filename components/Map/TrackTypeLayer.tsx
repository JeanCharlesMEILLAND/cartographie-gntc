'use client';

import { useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection, Feature } from 'geojson';
import { fetchSNCFLayers } from './ITELayer';
import type { PathOptions } from 'leaflet';

const TRACK_STYLES: Record<string, PathOptions> = {
  'Double voie': { color: '#e67e22', weight: 2.5, opacity: 0.7 },
  'Voie unique': { color: '#3498db', weight: 1.5, opacity: 0.6 },
  'Voie banalisée': { color: '#9b59b6', weight: 1.5, opacity: 0.5, dashArray: '6 4' },
  'Régime en navette': { color: '#1abc9c', weight: 1, opacity: 0.4, dashArray: '4 4' },
};

const DEFAULT_STYLE: PathOptions = { color: '#95a5a6', weight: 1, opacity: 0.3, dashArray: '3 3' };

function styleFeature(feature: Feature | undefined): PathOptions {
  const regime = feature?.properties?.exploitati || '';
  return TRACK_STYLES[regime] || DEFAULT_STYLE;
}

export default function TrackTypeLayer() {
  const showTrackType = useFilterStore((s) => s.showTrackType);
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showTrackType || data) return;
    fetchSNCFLayers().then((d) => {
      if (d?.regime) setData(d.regime);
    });
  }, [showTrackType, data]);

  if (!showTrackType || !data) return null;

  return (
    <GeoJSONLayer
      key="track-type"
      data={data}
      style={styleFeature}
      interactive={false}
    />
  );
}
