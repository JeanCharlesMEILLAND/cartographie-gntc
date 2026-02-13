'use client';

import dynamic from 'next/dynamic';
import { Platform, AggregatedRoute, Service } from '@/lib/types';

const OperatorMapInner = dynamic(() => import('./OperatorMapInner'), {
  ssr: false,
  loading: () => (
    <div className="glass-panel rounded-lg flex items-center justify-center text-muted text-xs animate-pulse" style={{ height: 400 }}>
      Chargement de la carte...
    </div>
  ),
});

interface Props {
  platforms: Platform[];
  routes: AggregatedRoute[];
  services: Service[];
  operator: string;
  highlightedSite?: string | null;
  onSiteSelect?: (site: string | null) => void;
  extraRailGeometries?: Record<string, [number, number][]>;
}

export default function OperatorMap({ platforms, routes, services, operator, highlightedSite, onSiteSelect, extraRailGeometries }: Props) {
  return <OperatorMapInner platforms={platforms} routes={routes} services={services} operator={operator} highlightedSite={highlightedSite} onSiteSelect={onSiteSelect} extraRailGeometries={extraRailGeometries} />;
}
