'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { TransportData, Platform, AggregatedRoute } from '@/lib/types';
import { useFilterStore } from '@/store/useFilterStore';
import MapContainer from '@/components/Map/MapContainer';
import FilterPanel from '@/components/Filters/FilterPanel';
import KPIBar from '@/components/Dashboard/KPIBar';
import RailBadge from '@/components/Dashboard/RailBadge';
import InfoCard from '@/components/InfoCard';
import Legend from '@/components/Legend';
import UploadDialog from '@/components/UploadDialog';

export default function Home() {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const {
    country,
    activeOperators,
    minFrequency,
    setAllOperators,
  } = useFilterStore();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      const json: TransportData = await res.json();
      setData(json);
      if (json.operators.length > 0) {
        setAllOperators(json.operators);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [setAllOperators]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter platforms by country
  const filteredPlatforms = useMemo<Platform[]>(() => {
    if (!data) return [];
    return data.platforms.filter((p) => {
      if (country === 'france') return p.pays?.toLowerCase() === 'france';
      if (country === 'international') return p.pays?.toLowerCase() !== 'france';
      return true;
    });
  }, [data, country]);

  // Filter routes by operators, frequency, and country
  const filteredRoutes = useMemo<AggregatedRoute[]>(() => {
    if (!data) return [];
    return data.routes.filter((r) => {
      // Frequency filter
      if (r.freq < minFrequency) return false;

      // Operator filter: at least one operator must be active
      // If no operators selected ("Aucun"), hide all routes
      const hasActiveOp = r.operators.some((op) => activeOperators.has(op));
      if (!hasActiveOp) return false;

      // Country filter
      if (country === 'france') {
        const fromPlatform = data.platforms.find((p) => p.site === r.from);
        const toPlatform = data.platforms.find((p) => p.site === r.to);
        if (!fromPlatform || !toPlatform) return false;
        if (
          fromPlatform.pays?.toLowerCase() !== 'france' ||
          toPlatform.pays?.toLowerCase() !== 'france'
        )
          return false;
      } else if (country === 'international') {
        const fromPlatform = data.platforms.find((p) => p.site === r.from);
        const toPlatform = data.platforms.find((p) => p.site === r.to);
        if (!fromPlatform && !toPlatform) return false;
        const fromFR = fromPlatform?.pays?.toLowerCase() === 'france';
        const toFR = toPlatform?.pays?.toLowerCase() === 'france';
        if (fromFR && toFR) return false;
      }

      return true;
    });
  }, [data, activeOperators, minFrequency, country]);

  // Major hubs: platforms with >100 trains/sem
  const majorHubs = useMemo<Platform[]>(() => {
    const volumeMap = new Map<string, number>();
    filteredRoutes.forEach((r) => {
      volumeMap.set(r.from, (volumeMap.get(r.from) || 0) + r.freq);
      volumeMap.set(r.to, (volumeMap.get(r.to) || 0) + r.freq);
    });
    return filteredPlatforms.filter((p) => (volumeMap.get(p.site) || 0) > 100);
  }, [filteredPlatforms, filteredRoutes]);

  // KPIs
  const totalTrains = useMemo(
    () => filteredRoutes.reduce((sum, r) => sum + r.freq, 0),
    [filteredRoutes]
  );

  const activeOps = useMemo(() => {
    const ops = new Set<string>();
    filteredRoutes.forEach((r) => r.operators.forEach((op) => ops.add(op)));
    return ops;
  }, [filteredRoutes]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="text-cyan text-lg animate-pulse mb-2">Chargement...</div>
          <div className="text-muted text-xs">Transport Combiné 2026</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] h-[50px] glass-panel flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue to-cyan flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12H14M4 8H12M6 4H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-display font-bold text-text leading-tight truncate">
                Transport Combiné 2026
              </h1>
              <p className="text-[10px] text-muted leading-tight hidden sm:block">OTC / GNTC</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <KPIBar
          platformCount={filteredPlatforms.length}
          routeCount={filteredRoutes.length}
          trainsPerWeek={totalTrains}
          operatorCount={activeOps.size}
        />

        {/* Upload button */}
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1.5 text-xs text-blue hover:text-cyan transition-colors px-2 sm:px-3 py-1.5 rounded-md border border-border hover:border-blue/30 flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 10V2M7 2L4 5M7 2L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 9V11C2 11.55 2.45 12 3 12H11C11.55 12 12 11.55 12 11V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Importer Excel</span>
        </button>
      </header>

      {/* Map (fullscreen behind everything) */}
      <MapContainer
        platforms={filteredPlatforms}
        routes={filteredRoutes}
        majorHubs={majorHubs}
      />

      {/* Filter Panel */}
      <FilterPanel />

      {/* Rail Badge */}
      <RailBadge />

      {/* Legend */}
      <Legend />

      {/* Info Card */}
      <InfoCard platforms={data?.platforms || []} routes={filteredRoutes} />

      {/* Unmatched platforms warning - only show if significant */}
      {data && data.unmatchedPlatforms.length > 3 && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[1000] glass-panel rounded-md px-3 py-1.5">
          <span className="text-xs text-orange">
            Plateformes non géocodées ({data.unmatchedPlatforms.length}) :{' '}
            <span className="text-muted">
              {data.unmatchedPlatforms.slice(0, 5).join(', ')}
              {data.unmatchedPlatforms.length > 5 && '...'}
            </span>
          </span>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
