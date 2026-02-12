'use client';

import { useState, useMemo } from 'react';
import { TransportData, Service } from '@/lib/types';
import { groupServicesByRoute, buildOperatorStats, DAY_ORDER } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import KPICard from './shared/KPICard';
import MaterialBadge from './shared/MaterialBadge';

const DAYS = Object.keys(DAY_ORDER); // Lu, Ma, Me, Je, Ve, Sa, Di

const EMPTY_SERVICE: Omit<Service, 'operator'> = {
  from: '',
  to: '',
  dayDep: 'Lu',
  timeDep: '',
  dayArr: 'Lu',
  timeArr: '',
  acceptsCM: 'Non',
  acceptsCont: 'Non',
  acceptsSemiPre: 'Non',
  acceptsSemiNon: 'Non',
  acceptsP400: 'Non',
};

interface Props {
  data: TransportData;
  operator: string;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorRoutes({ data, operator, onSave, saving }: Props) {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState<Omit<Service, 'operator'>>({ ...EMPTY_SERVICE });
  const color = getOperatorColor(operator);

  const stats = useMemo(
    () => buildOperatorStats(operator, data.routes, data.services),
    [operator, data.routes, data.services]
  );

  const routeGroups = useMemo(
    () => groupServicesByRoute(data.services, operator),
    [data.services, operator]
  );

  const filteredGroups = useMemo(() => {
    if (!filter) return routeGroups;
    const q = filter.toLowerCase();
    return routeGroups.filter(
      (g) => g.from.toLowerCase().includes(q) || g.to.toLowerCase().includes(q)
    );
  }, [routeGroups, filter]);

  // All platform names for selects
  const platformNames = useMemo(
    () => data.platforms.map((p) => p.site).sort(),
    [data.platforms]
  );

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

  const handleAddService = () => {
    if (!newService.from || !newService.to) return;
    if (newService.from === newService.to) return;

    const service: Service = {
      operator,
      ...newService,
    };

    const updated = { ...data };
    updated.services = [...updated.services, service];
    onSave(updated);
    setNewService({ ...EMPTY_SERVICE });
    setShowAddForm(false);
  };

  const handleDeleteService = (
    from: string,
    to: string,
    dayDep: string,
    timeDep: string
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
    updated.services = updated.services.filter((_, i) => i !== idx);
    onSave(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-sm font-display font-bold text-text">{operator}</h2>
        <span className="text-[10px] text-muted">— Mes liaisons</span>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 flex-wrap">
        <KPICard value={stats.routeCount} label="Liaisons" color="text-purple" />
        <KPICard value={stats.trainsPerWeek} label="Trains / semaine" color="text-cyan" />
        <KPICard value={stats.serviceCount} label="Services" color="text-orange" />
      </div>

      {/* Toolbar: search + add */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher une liaison..."
            className="text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50 w-64"
          />
          <span className="text-[10px] text-muted">
            {filteredGroups.length} liaison{filteredGroups.length > 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-blue hover:text-cyan transition-colors px-3 py-1.5 rounded-md border border-border hover:border-blue/30"
        >
          + Ajouter un service
        </button>
      </div>

      {/* Add service form */}
      {showAddForm && (
        <div className="glass-panel rounded-lg p-4 space-y-4">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Nouveau service</h3>

          {/* Platforms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Plateforme départ</label>
              <select
                value={newService.from}
                onChange={(e) => setNewService({ ...newService, from: e.target.value })}
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              >
                <option value="">Sélectionner...</option>
                {platformNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Plateforme destination</label>
              <select
                value={newService.to}
                onChange={(e) => setNewService({ ...newService, to: e.target.value })}
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              >
                <option value="">Sélectionner...</option>
                {platformNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Jour départ</label>
              <select
                value={newService.dayDep}
                onChange={(e) => setNewService({ ...newService, dayDep: e.target.value })}
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">HLR (départ)</label>
              <input
                value={newService.timeDep}
                onChange={(e) => setNewService({ ...newService, timeDep: e.target.value })}
                placeholder="08:00"
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text font-mono placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Jour arrivée</label>
              <select
                value={newService.dayArr}
                onChange={(e) => setNewService({ ...newService, dayArr: e.target.value })}
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">MAD (arrivée)</label>
              <input
                value={newService.timeArr}
                onChange={(e) => setNewService({ ...newService, timeArr: e.target.value })}
                placeholder="14:00"
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text font-mono placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
              />
            </div>
          </div>

          {/* Material acceptance */}
          <div>
            <label className="text-[10px] text-muted uppercase block mb-2">Matériels acceptés</label>
            <div className="flex flex-wrap gap-3">
              {([
                { key: 'acceptsCM', label: 'Caisses Mobiles' },
                { key: 'acceptsCont', label: 'Conteneurs' },
                { key: 'acceptsSemiPre', label: 'Semi préhensibles' },
                { key: 'acceptsSemiNon', label: 'Semi non préh.' },
                { key: 'acceptsP400', label: 'P400' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 text-xs text-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newService[key] === 'Oui'}
                    onChange={(e) =>
                      setNewService({ ...newService, [key]: e.target.checked ? 'Oui' : 'Non' })
                    }
                    className="w-3.5 h-3.5 rounded border-border text-blue focus:ring-blue/30"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Validation */}
          {newService.from && newService.to && newService.from === newService.to && (
            <p className="text-xs text-red-400">Le départ et la destination doivent être différents.</p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddService}
              disabled={!newService.from || !newService.to || newService.from === newService.to || saving}
              className="text-xs px-4 py-1.5 rounded-md bg-blue/20 text-blue border border-blue/30 hover:bg-blue/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewService({ ...EMPTY_SERVICE }); }}
              className="text-xs px-4 py-1.5 rounded-md text-muted hover:text-text border border-border transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Route groups */}
      <div className="space-y-2">
        {filteredGroups.map(({ route, from, to, services }) => {
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
                        <th className="text-right font-normal py-1 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s, j) => (
                        <tr key={j} className="text-text border-b border-border/30 group">
                          <td className="py-1 pr-2 font-medium">{s.dayDep}</td>
                          <EditableTimeCell
                            value={s.timeDep}
                            onCommit={(val) => handleServiceEdit(from, to, s.dayDep, s.timeDep, 'timeDep', val)}
                          />
                          <td className="py-1 pr-2 font-medium">{s.dayArr}</td>
                          <EditableTimeCell
                            value={s.timeArr}
                            onCommit={(val) => handleServiceEdit(from, to, s.dayDep, s.timeDep, 'timeArr', val)}
                          />
                          <td className="py-1"><MaterialDotCell value={s.acceptsCM} /></td>
                          <td className="py-1"><MaterialDotCell value={s.acceptsCont} /></td>
                          <td className="py-1"><MaterialDotCell value={s.acceptsSemiPre} /></td>
                          <td className="py-1"><MaterialDotCell value={s.acceptsSemiNon} /></td>
                          <td className="py-1"><MaterialDotCell value={s.acceptsP400} /></td>
                          <td className="py-1 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer ce service ${from} → ${to} (${s.dayDep} ${s.timeDep || ''}) ?`)) {
                                  handleDeleteService(from, to, s.dayDep, s.timeDep);
                                }
                              }}
                              className="text-muted/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="Supprimer ce service"
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          </td>
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

      {saving && <div className="text-[10px] text-cyan animate-pulse">Sauvegarde en cours...</div>}
    </div>
  );
}

function EditableTimeCell({ value, onCommit }: { value: string; onCommit: (val: string) => void }) {
  return (
    <td
      className="py-1 pr-2 font-mono text-cyan cursor-pointer hover:text-blue"
      onDoubleClick={(e) => {
        const td = e.currentTarget;
        const input = document.createElement('input');
        input.value = value || '';
        input.className = 'w-16 bg-blue/5 border border-blue/30 rounded px-1 py-0 text-text text-[11px] font-mono focus:outline-none';
        const commit = () => {
          onCommit(input.value);
          td.textContent = input.value || '—';
        };
        input.onblur = commit;
        input.onkeydown = (ev) => {
          if (ev.key === 'Enter') commit();
          if (ev.key === 'Escape') td.textContent = value || '—';
        };
        td.textContent = '';
        td.appendChild(input);
        input.focus();
      }}
    >
      {value || '—'}
    </td>
  );
}

function MaterialDotCell({ value }: { value: string }) {
  if (!value || value === 'Non' || value === 'Non communiqué' || value === 'non communiqué') {
    return <span className="text-[9px] text-muted/40">—</span>;
  }
  return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title={value} />;
}
