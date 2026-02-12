'use client';

import { useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';
import { fetchSNCFLayers } from './ITELayer';
import type { PathOptions } from 'leaflet';

const UNIQUE_STYLE: PathOptions = { color: '#3498db', weight: 2, opacity: 0.7 };
const DOUBLE_STYLE: PathOptions = { color: '#e67e22', weight: 3, opacity: 0.7 };

export default function TrackTypeLayer() {
  const showVoieUnique = useFilterStore((s) => s.showVoieUnique);
  const showVoieDouble = useFilterStore((s) => s.showVoieDouble);
  const [data, setData] = useState<{ voieUnique: FeatureCollection; voieDouble: FeatureCollection } | null>(null);

  useEffect(() => {
    if ((!showVoieUnique && !showVoieDouble) || data) return;
    fetchSNCFLayers().then((d) => {
      if (d?.voieUnique && d?.voieDouble) setData({ voieUnique: d.voieUnique, voieDouble: d.voieDouble });
    });
  }, [showVoieUnique, showVoieDouble, data]);

  if (!data) return null;

  return (
    <>
      {showVoieUnique && (
        <GeoJSONLayer
          key="voie-unique"
          data={data.voieUnique}
          style={() => UNIQUE_STYLE}
          interactive={false}
        />
      )}
      {showVoieDouble && (
        <GeoJSONLayer
          key="voie-double"
          data={data.voieDouble}
          style={() => DOUBLE_STYLE}
          interactive={false}
        />
      )}
    </>
  );
}
