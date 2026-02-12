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
  const allOps = new Set<string>();
  connected.forEach((r) => r.operators.forEach((op) => allOps.add(op)));

  // Destinations
  const destinations = connected.map((r) => ({
    name: r.from === selectedPlatform ? r.to : r.from,
    freq: r.freq,
    operators: r.operators,
  })).sort((a, b) => b.freq - a.freq);

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[1000] glass-panel rounded-lg w-auto sm:w-[320px] max-h-[50vh] sm:max-h-[400px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b border-border">
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
            <div className="text-lg font-mono font-bold text-purple">{allOps.size}</div>
            <div className="text-[10px] text-muted">opérateurs</div>
          </div>
        </div>

        {/* Destinations */}
        {destinations.length > 0 && (
          <div>
            <span className="text-[10px] text-muted uppercase tracking-wider">
              Destinations ({destinations.length})
            </span>
            <div className="mt-1 space-y-0.5 max-h-[200px] overflow-y-auto">
              {destinations.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPlatform(d.name)}
                  className="flex items-center justify-between text-xs py-1 px-1.5 w-full text-left rounded hover:bg-[rgba(20,30,60,0.5)] transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getOperatorColor(d.operators[0] || '') }}
                    />
                    <span className="text-text truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="font-mono text-cyan">{d.freq}/s</span>
                    <span className="text-[9px] text-muted truncate max-w-[60px]">{d.operators[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
