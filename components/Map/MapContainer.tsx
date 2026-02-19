'use client';

import dynamic from 'next/dynamic';
import { Platform, AggregatedRoute, Service } from '@/lib/types';
import { ErrorBoundary } from '@cartographie/shared/ui';

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
  railGeometries?: Record<string, [number, number][]>;
  services?: Service[];
  allPlatforms?: Platform[];
}

export default function MapContainer({ platforms, routes, railGeometries, services, allPlatforms }: MapContainerProps) {
  return (
    <div className="absolute inset-0">
      <ErrorBoundary fallbackMessage="Erreur lors du chargement de la carte">
        <MapInner platforms={platforms} routes={routes} railGeometries={railGeometries} services={services} allPlatforms={allPlatforms} />
      </ErrorBoundary>
    </div>
  );
}
