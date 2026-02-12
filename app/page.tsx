'use client';

import { useEffect, useState, useMemo } from 'react';
import { TransportData, Platform, AggregatedRoute } from '@/lib/types';
import { useFilterStore } from '@/store/useFilterStore';
import MapContainer from '@/components/Map/MapContainer';
import FilterPanel from '@/components/Filters/FilterPanel';
import KPIBar from '@/components/Dashboard/KPIBar';
import CO2Badge from '@/components/Dashboard/CO2Badge';
import InfoCard from '@/components/InfoCard';
import Legend from '@/components/Legend';
import SearchPanel from '@/components/Search/SearchPanel';
import TimeControl from '@/components/Clock/TimeControl';
import { useSearchStore } from '@/store/useSearchStore';
import { dayTimeToMinutes, getTrainProgress } from '@/lib/trainClock';

export default function Home() {
  const [data, setData] = useState<TransportData | null>(null);
  const [railGeometries, setRailGeometries] = useState<Record<string, [number, number][]>>({});
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStep, setLoadStep] = useState('Initialisation...');
  const { searchOpen, setSearchOpen } = useSearchStore();

  const {
    country,
    activeOperators,
    minFrequency,
    selectedPlatform,
    setAllOperators,
    setVisibleOperators,
    setSelectedPlatformOperators,
    showClock,
    toggleClock,
    clockDay,
    clockTime,
  } = useFilterStore();

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        // Step 1: Fetch transport data
        setLoadStep('Chargement des données...');
        setLoadProgress(10);
        const res = await fetch('/api/data');
        if (cancelled) return;
        setLoadProgress(30);
        setLoadStep('Traitement des plateformes...');

        const json: TransportData = await res.json();
        if (cancelled) return;
        setData(json);
        if (json.operators.length > 0) {
          setAllOperators(json.operators);
        }
        setLoadProgress(50);

        // Step 2: Fetch rail geometries
        setLoadStep('Chargement du réseau ferré...');
        setLoadProgress(55);
        try {
          const geoRes = await fetch('/rail-geometries.json');
          if (cancelled) return;
          setLoadProgress(75);
          setLoadStep('Construction de la carte...');
          if (geoRes.ok) {
            const geo = await geoRes.json();
            if (cancelled) return;
            setRailGeometries(geo);
          }
        } catch {
          // Rail geometries are optional
        }
        setLoadProgress(90);

        // Step 3: Finalize
        setLoadStep('Prêt !');
        setLoadProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (!cancelled) {
          setLoadStep('Erreur de chargement');
          setLoading(false);
        }
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [setAllOperators]);

  // Filter platforms by country
  const filteredPlatforms = useMemo<Platform[]>(() => {
    if (!data) return [];
    return data.platforms.filter((p) => {
      if (country === 'france') return p.pays?.toLowerCase() === 'france';
      if (country === 'international') return p.pays?.toLowerCase() !== 'france';
      return true;
    });
  }, [data, country]);

  // Compute which operators have routes passing the frequency filter
  useEffect(() => {
    if (!data) return;
    const ops = new Set<string>();
    data.routes.forEach((r) => {
      if (r.freq >= minFrequency) {
        r.operators.forEach((op) => ops.add(op));
      }
    });
    setVisibleOperators(ops);
  }, [data, minFrequency, setVisibleOperators]);

  // Compute operators serving the selected platform
  useEffect(() => {
    if (!selectedPlatform || !data) {
      setSelectedPlatformOperators(null);
      return;
    }
    const ops = new Set<string>();
    data.routes.forEach((r) => {
      if (r.from === selectedPlatform || r.to === selectedPlatform) {
        r.operators.forEach((op) => ops.add(op));
      }
    });
    setSelectedPlatformOperators(ops);
  }, [data, selectedPlatform, setSelectedPlatformOperators]);

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

  // Only show platforms connected to at least one visible route
  const visiblePlatforms = useMemo<Platform[]>(() => {
    const connectedSites = new Set<string>();
    filteredRoutes.forEach((r) => {
      connectedSites.add(r.from);
      connectedSites.add(r.to);
    });
    return filteredPlatforms.filter((p) => connectedSites.has(p.site));
  }, [filteredPlatforms, filteredRoutes]);

  // KPIs — context-aware: show platform stats when one is selected
  const selectedRoutes = useMemo(() => {
    if (!selectedPlatform) return null;
    return filteredRoutes.filter(
      (r) => r.from === selectedPlatform || r.to === selectedPlatform
    );
  }, [filteredRoutes, selectedPlatform]);

  const kpiRoutes = selectedRoutes || filteredRoutes;

  const totalTrains = useMemo(
    () => kpiRoutes.reduce((sum, r) => sum + r.freq, 0),
    [kpiRoutes]
  );

  const activeOps = useMemo(() => {
    const ops = new Set<string>();
    kpiRoutes.forEach((r) => r.operators.forEach((op) => ops.add(op)));
    return ops;
  }, [kpiRoutes]);

  const kpiPlatformCount = selectedPlatform
    ? new Set(kpiRoutes.flatMap((r) => [r.from, r.to])).size
    : visiblePlatforms.length;

  // Train count for the clock
  const clockTrainCount = useMemo(() => {
    if (!showClock || !data) return 0;
    const dayIndex: Record<string, number> = { Lu: 0, Ma: 1, Me: 2, Je: 3, Ve: 4, Sa: 5, Di: 6 };
    const currentMinutes = (dayIndex[clockDay] ?? 0) * 24 * 60 + clockTime;
    let count = 0;
    for (const svc of data.services) {
      const depMin = dayTimeToMinutes(svc.dayDep, svc.timeDep);
      const arrMin = dayTimeToMinutes(svc.dayArr, svc.timeArr);
      if (getTrainProgress(depMin, arrMin, currentMinutes) !== null) count++;
    }
    return count;
  }, [showClock, data, clockDay, clockTime]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-bg">
        {/* Animated network graph */}
        <svg width="340" height="160" viewBox="0 0 340 160" fill="none" className="mb-6">
          {/* Track lines - draw themselves */}
          <path d="M 30,100 C 60,100 80,60 120,60" className="loading-track" stroke="#587bbd" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 120,60 C 160,60 180,100 220,100" className="loading-track loading-track-2" stroke="#587bbd" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 220,100 C 260,100 280,60 310,60" className="loading-track loading-track-3" stroke="#587bbd" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 120,60 L 170,30" className="loading-track loading-track-4" stroke="#587bbd" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M 220,100 L 260,130" className="loading-track loading-track-5" stroke="#8b6db5" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />

          {/* Platform nodes - pop in */}
          <circle cx="30" cy="100" r="0" fill="#7dc243" className="loading-node loading-node-1" />
          <circle cx="120" cy="60" r="0" fill="#7dc243" className="loading-node loading-node-2" />
          <circle cx="220" cy="100" r="0" fill="#7dc243" className="loading-node loading-node-3" />
          <circle cx="310" cy="60" r="0" fill="#7dc243" className="loading-node loading-node-4" />
          <circle cx="170" cy="30" r="0" fill="#8b6db5" className="loading-node loading-node-5" />
          <circle cx="260" cy="130" r="0" fill="#8b6db5" className="loading-node loading-node-6" />

          {/* Hub pulse on main node */}
          <circle cx="120" cy="60" r="4.5" fill="none" stroke="#7dc243" strokeWidth="1" className="loading-pulse" />
          <circle cx="220" cy="100" r="4.5" fill="none" stroke="#7dc243" strokeWidth="1" className="loading-pulse" style={{ animationDelay: '2s' }} />

          {/* Moving train dot */}
          <circle r="4" fill="#587bbd" stroke="#fff" strokeWidth="1.5" className="loading-train" />
        </svg>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-xl font-display font-bold gntc-gradient loading-title mb-1">
            Transport Combiné
          </h1>
          <p className="text-xs text-muted loading-subtitle">
            OTC / GNTC
          </p>
        </div>

        {/* Progress bar + percentage */}
        <div className="mt-6 w-52 loading-bar-container">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted">{loadStep}</span>
            <span className="text-[11px] font-mono font-bold gntc-gradient">{loadProgress}%</span>
          </div>
          <div className="w-full h-[4px] rounded-full bg-[rgba(88,123,189,0.12)] overflow-hidden">
            <div
              className="h-full rounded-full gntc-gradient-bg transition-all duration-500 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] h-[50px] glass-panel flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo GNTC */}
          <img src="/logo-gntc.jpg" alt="GNTC" className="h-8 sm:h-9 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-display font-bold leading-tight truncate gntc-gradient">
              Transport Combiné
            </h1>
            <p className="text-[10px] text-muted leading-tight hidden sm:block">OTC / GNTC</p>
          </div>
        </div>

        {/* KPIs */}
        <KPIBar
          platformCount={kpiPlatformCount}
          routeCount={kpiRoutes.length}
          trainsPerWeek={totalTrains}
          operatorCount={activeOps.size}
          selectedPlatform={selectedPlatform}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`flex items-center gap-1.5 text-xs transition-colors px-2 sm:px-3 py-1.5 rounded-md border flex-shrink-0 ${
              searchOpen
                ? 'text-cyan border-cyan/30 bg-cyan/10'
                : 'text-blue hover:text-cyan border-border hover:border-blue/30'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="2" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="text-[9px] sm:text-xs"><span className="sm:hidden">Trajet</span><span className="hidden sm:inline">Planificateur</span></span>
          </button>

          {/* Live traffic button */}
          <button
            onClick={toggleClock}
            className={`flex items-center gap-1.5 text-xs transition-colors px-2 sm:px-3 py-1.5 rounded-md border flex-shrink-0 ${
              showClock
                ? 'text-cyan border-cyan/30 bg-cyan/10'
                : 'text-blue hover:text-cyan border-border hover:border-blue/30'
            }`}
            title="Trafic en direct"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M2 10V8M5 10V5M8 10V3M11 10V6" />
            </svg>
            <span className="text-[9px] sm:text-xs"><span className="sm:hidden">Live</span><span className="hidden sm:inline">Trafic live</span></span>
          </button>

          {/* Admin button */}
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-blue transition-colors px-2 sm:px-3 py-1.5 rounded-md border border-border hover:border-blue/30 flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2.5 12.5C2.5 10 4.5 8 7 8C9.5 8 11.5 10 11.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Admin</span>
          </a>
        </div>
      </header>

      {/* Map (fullscreen behind everything) */}
      <MapContainer
        platforms={visiblePlatforms}
        routes={filteredRoutes}
        railGeometries={railGeometries}
        services={data?.services}
        allPlatforms={data?.platforms}
      />

      {/* Filter Panel */}
      <FilterPanel />

      {/* Right-side badges */}
      <div className="absolute top-[54px] sm:top-[60px] right-2 sm:right-4 z-[999] flex flex-col gap-1.5 sm:gap-2">
        <CO2Badge routes={filteredRoutes} />
      </div>

      {/* Legend */}
      <Legend />

      {/* Search Panel */}
      <SearchPanel platforms={data?.platforms || []} services={data?.services || []} routes={filteredRoutes} />

      {/* Info Card */}
      <InfoCard platforms={data?.platforms || []} routes={filteredRoutes} services={data?.services || []} />

      {/* Train Clock */}
      <TimeControl trainCount={clockTrainCount} />

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

    </div>
  );
}
