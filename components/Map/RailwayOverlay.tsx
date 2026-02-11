'use client';

import { TileLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';

export default function RailwayOverlay() {
  const { showRailway, railwayStyle } = useFilterStore();

  if (!showRailway) return null;

  return (
    <TileLayer
      url={`https://{s}.tiles.openrailwaymap.org/${railwayStyle}/{z}/{x}/{y}.png`}
      attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
      opacity={0.4}
      maxZoom={19}
      subdomains={['a', 'b', 'c']}
    />
  );
}
