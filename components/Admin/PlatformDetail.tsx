'use client';

import { useState, useMemo } from 'react';
import { TransportData } from '@/lib/types';
import { buildPlatformOperatorBreakdown, DAY_ORDER } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminStore } from '@/store/useAdminStore';
import MaterialBadge from './shared/MaterialBadge';

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
}

export default function PlatformDetail({ data, onSave }: Props) {
  const { selectedPlatformSite, selectPlatform, navigateToOperator } = useAdminStore();
  const [expandedDest, setExpandedDest] = useState<string | null>(null);

  const platform = data.platforms.find((p) => p.site === selectedPlatformSite);

  const breakdown = useMemo(() => {
    if (!selectedPlatformSite) return [];
    return buildPlatformOperatorBreakdown(selectedPlatformSite, data.routes, data.services);
  }, [selectedPlatformSite, data.routes, data.services]);

  const connected = useMemo(() => {
    if (!selectedPlatformSite) return [];
    return data.routes.filter(
      (r) => r.from === selectedPlatformSite || r.to === selectedPlatformSite
    );
  }, [selectedPlatformSite, data.routes]);

  if (!platform || !selectedPlatformSite) return null;

  const totalFreq = connected.reduce((sum, r) => sum + r.freq, 0);

  const handleServiceEdit = (
    operator: string,
    from: string,
    to: string,
    dayDep: string,
    timeDep: string,
    field: string,
    newValue: string
  ) => {
    const idx = data.services.findIndex(
      (s) =>
        s.operator === operator &&
        s.from === from &&
        s.to === to &&
        s.dayDep === dayDep &&
        s.timeDep === timeDep
    );
    if (idx === -1) return;
    const updated = { ...data };
    const updatedServices = [...updated.services];
    updatedServices[idx] = { ...updatedServices[idx], [field]: newValue };
    updated.services = updatedServices;
    onSave(updated);
  };

  return (
    <div className="glass-panel rounded-lg overflow-y-auto max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border sticky top-0 glass-panel z-10">
        <div>
          <h3 className="text-sm font-display font-semibold text-text">{platform.site}</h3>
          <p className="text-xs text-muted mt-0.5">
            {platform.ville}{platform.pays ? ` — ${platform.pays}` : ''}
          </p>
        </div>
        <button
          onClick={() => selectPlatform(null)}
          className="text-muted hover:text-text transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Platform metadata */}
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
        <div className="flex gap-4 py-3 border-t border-b border-border">
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-cyan">{totalFreq}</div>
            <div className="text-[10px] text-muted">trains/sem</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-blue">{connected.length}</div>
            <div className="text-[10px] text-muted">liaisons</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-purple">{breakdown.length}</div>
            <div className="text-[10px] text-muted">opérateurs</div>
          </div>
        </div>

        {/* Operator breakdown */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Opérateurs actifs</h4>
          {breakdown.map(({ operator, destinations, totalFreq: opFreq, freqShare }) => {
            const color = getOperatorColor(operator);
            return (
              <div key={operator} className="space-y-1">
                {/* Operator header */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateToOperator(operator)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-semibold text-text hover:text-blue transition-colors">
                      {operator}
                    </span>
                  </button>
                  <span className="text-[10px] font-mono text-muted">{opFreq} t/sem</span>
                </div>

                {/* Frequency bar */}
                <div className="h-1.5 bg-[rgba(10,15,30,0.6)] rounded-full overflow-hidden ml-4">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${freqShare * 100}%`, backgroundColor: color }}
                  />
                </div>

                {/* Destinations */}
                <div className="ml-4 space-y-0.5">
                  {destinations.map((d, i) => {
                    const destKey = `${operator}||${d.dest}`;
                    const isExpanded = expandedDest === destKey;
                    return (
                      <div key={i}>
                        <button
                          onClick={() => setExpandedDest(isExpanded ? null : destKey)}
                          className="flex items-center justify-between text-xs py-1 px-1.5 w-full text-left rounded hover:bg-[rgba(20,30,60,0.5)] transition-colors"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <svg
                              width="8" height="8" viewBox="0 0 8 8"
                              className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="currentColor"
                              style={{ color }}
                            >
                              <path d="M2 1L6 4L2 7Z" />
                            </svg>
                            <span className="text-text truncate">{d.dest}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <span className="font-mono text-cyan">{d.freq}/s</span>
                            <span className="text-[9px] text-muted">{d.services.length} dép.</span>
                          </div>
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && d.services.length > 0 && (
                          <div className="ml-3 mt-1 mb-2 space-y-2 bg-[rgba(10,15,30,0.3)] rounded p-2">
                            {/* Schedule table */}
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="text-muted">
                                  <th className="text-left font-normal py-0.5 pr-1">Jour Dép</th>
                                  <th className="text-left font-normal py-0.5 pr-1">HLR</th>
                                  <th className="text-left font-normal py-0.5 pr-1">Jour Arr</th>
                                  <th className="text-left font-normal py-0.5">MAD</th>
                                </tr>
                              </thead>
                              <tbody>
                                {d.services.map((s, j) => (
                                  <tr key={j} className="text-text">
                                    <td className="py-0.5 pr-1 font-medium">{s.dayDep}</td>
                                    <td
                                      className="py-0.5 pr-1 font-mono text-cyan cursor-pointer hover:text-blue"
                                      onDoubleClick={(e) => {
                                        const td = e.currentTarget;
                                        const input = document.createElement('input');
                                        input.value = s.timeDep || '';
                                        input.className = 'w-full bg-blue/10 border border-blue/30 rounded px-1 py-0 text-text text-[10px] font-mono focus:outline-none';
                                        const commit = () => {
                                          handleServiceEdit(operator, s.from, s.to, s.dayDep, s.timeDep, 'timeDep', input.value);
                                          td.textContent = input.value || '—';
                                        };
                                        input.onblur = commit;
                                        input.onkeydown = (ev) => {
                                          if (ev.key === 'Enter') commit();
                                          if (ev.key === 'Escape') td.textContent = s.timeDep || '—';
                                        };
                                        td.textContent = '';
                                        td.appendChild(input);
                                        input.focus();
                                      }}
                                    >
                                      {s.timeDep || '—'}
                                    </td>
                                    <td className="py-0.5 pr-1 font-medium">{s.dayArr}</td>
                                    <td
                                      className="py-0.5 font-mono text-cyan cursor-pointer hover:text-blue"
                                      onDoubleClick={(e) => {
                                        const td = e.currentTarget;
                                        const input = document.createElement('input');
                                        input.value = s.timeArr || '';
                                        input.className = 'w-full bg-blue/10 border border-blue/30 rounded px-1 py-0 text-text text-[10px] font-mono focus:outline-none';
                                        const commit = () => {
                                          handleServiceEdit(operator, s.from, s.to, s.dayDep, s.timeDep, 'timeArr', input.value);
                                          td.textContent = input.value || '—';
                                        };
                                        input.onblur = commit;
                                        input.onkeydown = (ev) => {
                                          if (ev.key === 'Enter') commit();
                                          if (ev.key === 'Escape') td.textContent = s.timeArr || '—';
                                        };
                                        td.textContent = '';
                                        td.appendChild(input);
                                        input.focus();
                                      }}
                                    >
                                      {s.timeArr || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Material badges */}
                            {d.services[0] && (
                              <div className="flex flex-wrap gap-1">
                                <MaterialBadge label="CM" value={d.services[0].acceptsCM} />
                                <MaterialBadge label="Cont." value={d.services[0].acceptsCont} />
                                <MaterialBadge label="Semi préh." value={d.services[0].acceptsSemiPre} />
                                <MaterialBadge label="Semi non-préh." value={d.services[0].acceptsSemiNon} />
                                <MaterialBadge label="P400" value={d.services[0].acceptsP400} />
                              </div>
                            )}

                            {/* Navigate to destination */}
                            <button
                              onClick={() => selectPlatform(d.dest)}
                              className="text-[10px] text-blue hover:text-cyan transition-colors"
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

        {/* Connected platforms summary */}
        {connected.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Plateformes connectées ({connected.length})
            </h4>
            <div className="space-y-0.5">
              {connected
                .sort((a, b) => b.freq - a.freq)
                .map((r) => {
                  const dest = r.from === selectedPlatformSite ? r.to : r.from;
                  return (
                    <button
                      key={`${r.from}-${r.to}`}
                      onClick={() => selectPlatform(dest)}
                      className="flex items-center justify-between w-full text-xs py-1 px-2 rounded hover:bg-[rgba(20,30,60,0.5)] transition-colors text-left"
                    >
                      <span className="text-text truncate">{dest}</span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="font-mono text-cyan text-[10px]">{r.freq} t/s</span>
                        <span className="text-[9px] text-muted">{r.operators.length} op.</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
