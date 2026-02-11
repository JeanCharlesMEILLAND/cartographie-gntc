'use client';

import dynamic from 'next/dynamic';
import { Platform, AggregatedRoute } from '@/lib/types';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg">
      <div className="text-muted text-sm animate-pulse">Chargement de la carte...</div>
    </div>
  ),
});

interface MapContainerProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
  majorHubs: Platform[];
}

export default function MapContainer({ platforms, routes, majorHubs }: MapContainerProps) {
  return (
    <div className="absolute inset-0">
      <MapInner platforms={platforms} routes={routes} majorHubs={majorHubs} />
    </div>
  );
}
