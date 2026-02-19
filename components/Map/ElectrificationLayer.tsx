'use client';

import { useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection, Feature } from 'geojson';
import { fetchSNCFLayers } from '@/lib/fetchSNCFLayers';
import type { PathOptions } from 'leaflet';

const ELEC_COLORS: Record<string, string> = {
  '25000 volts alternatif': '#e74c3c',
  '1500 volts continu': '#3498db',
  '15000 volts 16 2/3 alternatif': '#f39c12',
  '3000 volts continu': '#2ecc71',
  '750 Volts continu': '#9b59b6',
};

const DEFAULT_COLOR = '#7f8c8d';

function styleFeature(feature: Feature | undefined): PathOptions {
  const elec = (feature?.properties?.elect || '') as string;
  const color = ELEC_COLORS[elec] || DEFAULT_COLOR;
  return { color, weight: 2.5, opacity: 0.7 };
}

export default function ElectrificationLayer() {
  const showElectrification = useFilterStore((s) => s.showElectrification);
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showElectrification || data) return;
    fetchSNCFLayers().then((d) => {
      if (d?.electrification) setData(d.electrification);
    });
  }, [showElectrification, data]);

  if (!showElectrification || !data) return null;

  return (
    <GeoJSONLayer
      key="electrification"
      data={data}
      style={styleFeature}
      interactive={false}
    />
  );
}
