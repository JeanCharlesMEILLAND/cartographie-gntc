'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { Platform, AggregatedRoute } from '@/lib/types';
import { getOperatorColor } from '@/lib/colors';

interface InfoCardProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
}

export default function InfoCard({ platforms, routes }: InfoCardProps) {
  const { selectedPlatform, setSelectedPlatform } = useFilterStore();

  if (!selectedPlatform) return null;

  const platform = platforms.find((p) => p.site === selectedPlatform);
  if (!platform) return null;

  // Find connected routes
  const connected = routes.filter(
    (r) => r.from === selectedPlatform || r.to === selectedPlatform
  );

  const totalFreq = connected.reduce((sum, r) => sum + r.freq, 0);

  // Build per-operator breakdown
  const operatorMap = new Map<string, { dest: string; freq: number }[]>();
  for (const r of connected) {
    const dest = r.from === selectedPlatform ? r.to : r.from;
    for (const op of r.operators) {
      if (!operatorMap.has(op)) operatorMap.set(op, []);
      operatorMap.get(op)!.push({ dest, freq: r.freq });
    }
  }

  // Sort operators by total frequency
  const operatorEntries = [...operatorMap.entries()]
    .map(([op, dests]) => ({
      op,
      dests: dests.sort((a, b) => b.freq - a.freq),
      total: dests.reduce((s, d) => s + d.freq, 0),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[1000] glass-panel rounded-lg w-auto sm:w-[340px] max-h-[60vh] sm:max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b border-border sticky top-0 glass-panel z-10">
        <div>
          <h3 className="text-sm font-display font-semibold text-text">
            {platform.site}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {platform.ville}{platform.pays ? ` — ${platform.pays}` : ''}
          </p>
        </div>
        <button
          onClick={() => setSelectedPlatform(null)}
          className="text-muted hover:text-text transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted">Exploitant</span>
            <div className="text-text font-medium">{platform.exploitant || '—'}</div>
          </div>
          <div>
            <span className="text-muted">Groupe</span>
            <div className="text-text font-medium">{platform.groupe || '—'}</div>
          </div>
          <div>
            <span className="text-muted">Département</span>
            <div className="text-text font-medium">{platform.departement || '—'}</div>
          </div>
          <div>
            <span className="text-muted">Chantier SNCF</span>
            <div className="text-text font-medium">{platform.chantierSNCF ? 'Oui' : 'Non'}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-3 py-2 border-t border-b border-border">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-cyan">{totalFreq}</div>
            <div className="text-[10px] text-muted">trains/sem</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-blue">{connected.length}</div>
            <div className="text-[10px] text-muted">liaisons</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-purple">{operatorEntries.length}</div>
            <div className="text-[10px] text-muted">opérateurs</div>
          </div>
        </div>

        {/* Operators with their destinations */}
        {operatorEntries.map(({ op, dests, total }) => {
          const color = getOperatorColor(op);
          return (
            <div key={op} className="space-y-1">
              {/* Operator header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-semibold text-text">{op}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">{total} t/sem</span>
              </div>

              {/* Destinations for this operator */}
              <div className="ml-4 space-y-0.5">
                {dests.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPlatform(d.dest)}
                    className="flex items-center justify-between text-xs py-0.5 px-1.5 w-full text-left rounded hover:bg-[rgba(20,30,60,0.5)] transition-colors"
                  >
                    <span className="text-text truncate">{d.dest}</span>
                    <span className="font-mono text-cyan flex-shrink-0 ml-2">{d.freq}/s</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
