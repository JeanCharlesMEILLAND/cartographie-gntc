'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { Platform, AggregatedRoute, Service } from '@/lib/types';
import { getOperatorColor } from '@/lib/colors';

interface InfoCardProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
  services: Service[];
}

const DAY_ORDER: Record<string, number> = { Lu: 1, Ma: 2, Me: 3, Je: 4, Ve: 5, Sa: 6, Di: 7 };

function MaterialBadge({ label, value }: { label: string; value: string }) {
  if (!value || value === 'Non' || value === 'Non communiqué' || value === 'non communiqué') return null;
  const isOui = value === 'Oui';
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-[rgba(56,217,245,0.1)] text-cyan border border-cyan/20">
      {label}{!isOui && `: ${value}`}
    </span>
  );
}

export default function InfoCard({ platforms, routes, services }: InfoCardProps) {
  const { selectedPlatform, setSelectedPlatform } = useFilterStore();
  const searchOpen = useSearchStore((s) => s.searchOpen);
  const [expandedDest, setExpandedDest] = useState<string | null>(null);

  if (!selectedPlatform) return null;

  const platform = platforms.find((p) => p.site === selectedPlatform);
  if (!platform) return null;

  // Find connected routes
  const connected = routes.filter(
    (r) => r.from === selectedPlatform || r.to === selectedPlatform
  );

  const totalFreq = connected.reduce((sum, r) => sum + r.freq, 0);

  // Services for this platform
  const platformServices = services.filter(
    (s) => s.from === selectedPlatform || s.to === selectedPlatform
  );

  // Build per-operator breakdown with service details
  const operatorMap = new Map<string, { dest: string; freq: number; services: Service[] }[]>();
  for (const r of connected) {
    const dest = r.from === selectedPlatform ? r.to : r.from;
    for (const op of r.operators) {
      if (!operatorMap.has(op)) operatorMap.set(op, []);
      // Find services for this operator+destination
      const destServices = platformServices.filter(
        (s) =>
          s.operator === op &&
          ((s.from === selectedPlatform && s.to === dest) ||
            (s.to === selectedPlatform && s.from === dest))
      ).sort((a, b) => (DAY_ORDER[a.dayDep] || 8) - (DAY_ORDER[b.dayDep] || 8));

      operatorMap.get(op)!.push({ dest, freq: r.freq, services: destServices });
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
    <div className={`absolute bottom-4 left-4 right-4 z-[1000] glass-panel rounded-lg w-auto max-h-[70vh] sm:max-h-[600px] overflow-y-auto ${
      searchOpen
        ? 'sm:right-auto sm:left-4 sm:w-[380px]'
        : 'sm:left-auto sm:right-4 sm:w-[380px]'
    }`}>
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
                {dests.map((d, i) => {
                  const destKey = `${op}||${d.dest}`;
                  const isExpanded = expandedDest === destKey;
                  return (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedDest(isExpanded ? null : destKey)}
                        className="flex items-center justify-between text-xs py-1 px-1.5 w-full text-left rounded hover:bg-blue/8 transition-colors"
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <svg
                            width="8" height="8" viewBox="0 0 8 8"
                            className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="currentColor"
                            style={{ color: color }}
                          >
                            <path d="M2 1L6 4L2 7Z" />
                          </svg>
                          <span className="text-text truncate">{d.dest}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span className="font-mono text-cyan">{d.freq}/s</span>
                          <span className="text-[9px] text-muted">{d.services.length} départs</span>
                        </div>
                      </button>

                      {/* Expanded: schedule + material */}
                      {isExpanded && d.services.length > 0 && (
                        <div className="ml-3 mt-1 mb-2 space-y-1.5">
                          {/* Schedule table */}
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-muted">
                                <th className="text-left font-normal py-0.5 pr-1">Départ</th>
                                <th className="text-left font-normal py-0.5 pr-1">HLR</th>
                                <th className="text-left font-normal py-0.5 pr-1">Arrivée</th>
                                <th className="text-left font-normal py-0.5">MAD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {d.services.map((s, j) => (
                                <tr key={j} className="text-text">
                                  <td className="py-0.5 pr-1 font-medium">{s.dayDep}</td>
                                  <td className="py-0.5 pr-1 font-mono text-cyan">{s.timeDep || '—'}</td>
                                  <td className="py-0.5 pr-1 font-medium">{s.dayArr}</td>
                                  <td className="py-0.5 font-mono text-cyan">{s.timeArr || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Material accepted */}
                          {d.services[0] && (
                            <div className="flex flex-wrap gap-1">
                              <MaterialBadge label="CM" value={d.services[0].acceptsCM} />
                              <MaterialBadge label="Cont." value={d.services[0].acceptsCont} />
                              <MaterialBadge label="Semi préh." value={d.services[0].acceptsSemiPre} />
                              <MaterialBadge label="Semi non-préh." value={d.services[0].acceptsSemiNon} />
                              <MaterialBadge label="P400" value={d.services[0].acceptsP400} />
                            </div>
                          )}

                          {/* Navigate button */}
                          <button
                            onClick={() => setSelectedPlatform(d.dest)}
                            className="text-[10px] text-blue hover:text-cyan transition-colors mt-0.5"
                          >
                            Voir {d.dest} →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
