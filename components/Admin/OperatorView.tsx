'use client';

import { useState, useMemo } from 'react';
import { TransportData, Platform } from '@/lib/types';
import { buildOperatorStats, groupServicesByRoute, getOperatorPlatforms, DAY_ORDER } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminStore } from '@/store/useAdminStore';
import KPICard from './shared/KPICard';
import MaterialBadge from './shared/MaterialBadge';

interface Props {
  data: TransportData;
  operator: string;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorView({ data, operator, onSave, saving }: Props) {
  const { navigateToPlatform } = useAdminStore();
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const color = getOperatorColor(operator);

  const stats = useMemo(
    () => buildOperatorStats(operator, data.routes, data.services),
    [operator, data.routes, data.services]
  );

  const routeGroups = useMemo(
    () => groupServicesByRoute(data.services, operator),
    [data.services, operator]
  );

  const operatorPlatforms = useMemo(() => {
    const sites = getOperatorPlatforms(data.services, operator);
    return sites.map((site) => {
      const p = data.platforms.find((pl) => pl.site === site);
      const destinations = data.services
        .filter((s) => s.operator === operator && s.from === site)
        .reduce((acc, s) => {
          if (!acc.includes(s.to)) acc.push(s.to);
          return acc;
        }, [] as string[]);
      return { site, platform: p, destinations };
    });
  }, [data.services, data.platforms, operator]);

  const handleServiceEdit = (
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-sm font-display font-bold text-text">{operator}</h2>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 flex-wrap">
        <KPICard value={stats.platformCount} label="Plateformes" color="text-blue" />
        <KPICard value={stats.routeCount} label="Liaisons" color="text-purple" />
        <KPICard value={stats.trainsPerWeek} label="Trains / semaine" color="text-cyan" />
        <KPICard value={stats.serviceCount} label="Services" color="text-orange" />
      </div>

      {/* Platforms */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
          Mes plateformes ({operatorPlatforms.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {operatorPlatforms.map(({ site, platform, destinations }) => (
            <button
              key={site}
              onClick={() => navigateToPlatform(site)}
              className="glass-panel rounded-lg p-3 text-left hover:border-blue/30 transition-colors"
            >
              <div className="text-xs font-semibold text-text truncate">{site}</div>
              {platform && (
                <div className="text-[10px] text-muted mt-0.5">
                  {platform.ville}{platform.pays !== 'France' ? ` — ${platform.pays}` : ''}
                </div>
              )}
              <div className="text-[10px] text-muted mt-1.5">
                {destinations.length} destination{destinations.length > 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Route groups */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
          Mes services par route ({routeGroups.length})
        </h3>
        <div className="space-y-2">
          {routeGroups.map(({ route, from, to, services }) => {
            const isExpanded = expandedRoute === route;
            return (
              <div key={route} className="glass-panel rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedRoute(isExpanded ? null : route)}
                  className="flex items-center justify-between w-full p-3 text-left hover:bg-blue/5 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      width="8" height="8" viewBox="0 0 8 8"
                      className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="currentColor"
                      style={{ color }}
                    >
                      <path d="M2 1L6 4L2 7Z" />
                    </svg>
                    <span className="text-xs text-text font-medium truncate">
                      {from} → {to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-cyan">{services.length} dép/sem</span>
                    {/* Material summary badges */}
                    {services[0] && (
                      <div className="hidden sm:flex gap-1">
                        <MaterialBadge label="CM" value={services[0].acceptsCM} />
                        <MaterialBadge label="Cont." value={services[0].acceptsCont} />
                      </div>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {/* Schedule table */}
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-muted border-b border-border/50">
                          <th className="text-left font-normal py-1 pr-2">Jour Dép</th>
                          <th className="text-left font-normal py-1 pr-2">HLR</th>
                          <th className="text-left font-normal py-1 pr-2">Jour Arr</th>
                          <th className="text-left font-normal py-1 pr-2">MAD</th>
                          <th className="text-left font-normal py-1">CM</th>
                          <th className="text-left font-normal py-1">Cont</th>
                          <th className="text-left font-normal py-1">S.Pr</th>
                          <th className="text-left font-normal py-1">S.NP</th>
                          <th className="text-left font-normal py-1">P400</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((s, j) => (
                          <tr key={j} className="text-text border-b border-border/30">
                            <td className="py-1 pr-2 font-medium">{s.dayDep}</td>
                            <td
                              className="py-1 pr-2 font-mono text-cyan cursor-pointer hover:text-blue"
                              onDoubleClick={(e) => {
                                const td = e.currentTarget;
                                const input = document.createElement('input');
                                input.value = s.timeDep || '';
                                input.className = 'w-16 bg-blue/5 border border-blue/30 rounded px-1 py-0 text-text text-[11px] font-mono focus:outline-none';
                                const commit = () => {
                                  handleServiceEdit(from, to, s.dayDep, s.timeDep, 'timeDep', input.value);
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
                            <td className="py-1 pr-2 font-medium">{s.dayArr}</td>
                            <td
                              className="py-1 pr-2 font-mono text-cyan cursor-pointer hover:text-blue"
                              onDoubleClick={(e) => {
                                const td = e.currentTarget;
                                const input = document.createElement('input');
                                input.value = s.timeArr || '';
                                input.className = 'w-16 bg-blue/5 border border-blue/30 rounded px-1 py-0 text-text text-[11px] font-mono focus:outline-none';
                                const commit = () => {
                                  handleServiceEdit(from, to, s.dayDep, s.timeDep, 'timeArr', input.value);
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
                            <td className="py-1"><MaterialDotCell value={s.acceptsCM} /></td>
                            <td className="py-1"><MaterialDotCell value={s.acceptsCont} /></td>
                            <td className="py-1"><MaterialDotCell value={s.acceptsSemiPre} /></td>
                            <td className="py-1"><MaterialDotCell value={s.acceptsSemiNon} /></td>
                            <td className="py-1"><MaterialDotCell value={s.acceptsP400} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {saving && <div className="text-[10px] text-cyan animate-pulse">Sauvegarde en cours...</div>}
    </div>
  );
}

function MaterialDotCell({ value }: { value: string }) {
  if (!value || value === 'Non' || value === 'Non communiqué' || value === 'non communiqué') {
    return <span className="text-[9px] text-muted/40">—</span>;
  }
  return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title={value} />;
}
