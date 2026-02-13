'use client';

import { useState, useMemo, Fragment } from 'react';
import { TransportData } from '@/lib/types';
import { buildAllPlatformStats, buildPlatformOperatorBreakdown } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminStore } from '@/store/useAdminStore';
import { useAdminNav } from '@/lib/useAdminNav';
import FilterSelect from './shared/FilterSelect';
import EditableCell from './shared/EditableCell';
import MaterialBadge from './shared/MaterialBadge';

const COLS = [
  { key: 'site', label: 'Site', width: 'min-w-[180px]' },
  { key: 'ville', label: 'Ville', width: 'min-w-[100px]' },
  { key: 'exploitant', label: 'Exploitant', width: 'min-w-[130px]' },
  { key: 'groupe', label: 'Groupe', width: 'min-w-[110px]' },
  { key: 'departement', label: 'Dept', width: 'min-w-[50px]' },
  { key: 'pays', label: 'Pays', width: 'min-w-[70px]' },
  { key: '_operators', label: 'Op.', width: 'min-w-[40px]', computed: true },
  { key: '_trains', label: 'T/sem', width: 'min-w-[50px]', computed: true },
] as const;

const COL_COUNT = COLS.length;

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function PlatformTable({ data, onSave, saving }: Props) {
  const { selectedPlatformSite, selectPlatform } = useAdminStore();
  const { navigateToOperator } = useAdminNav();
  const [search, setSearch] = useState('');
  const [filterPays, setFilterPays] = useState('');
  const [filterGroupe, setFilterGroupe] = useState('');
  const [filterExploitant, setFilterExploitant] = useState('');
  const [expandedDest, setExpandedDest] = useState<string | null>(null);

  const platformStats = useMemo(
    () => buildAllPlatformStats(data.routes, data.services),
    [data.routes, data.services]
  );

  const paysList = useMemo(
    () => [...new Set(data.platforms.map((p) => p.pays).filter(Boolean))].sort(),
    [data.platforms]
  );
  const groupeList = useMemo(
    () => [...new Set(data.platforms.map((p) => p.groupe).filter(Boolean))].sort(),
    [data.platforms]
  );
  const exploitantList = useMemo(
    () => [...new Set(data.platforms.map((p) => p.exploitant).filter(Boolean))].sort(),
    [data.platforms]
  );

  const filtered = useMemo(() => {
    return data.platforms.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.site.toLowerCase().includes(q) && !p.ville.toLowerCase().includes(q)) return false;
      }
      if (filterPays && p.pays !== filterPays) return false;
      if (filterGroupe && p.groupe !== filterGroupe) return false;
      if (filterExploitant && p.exploitant !== filterExploitant) return false;
      return true;
    });
  }, [data.platforms, search, filterPays, filterGroupe, filterExploitant]);

  const handleCellEdit = (platformSite: string, col: string, newValue: string) => {
    const realIndex = data.platforms.findIndex((p) => p.site === platformSite);
    if (realIndex === -1) return;
    const updated = { ...data };
    const updatedPlatforms = [...updated.platforms];
    updatedPlatforms[realIndex] = { ...updatedPlatforms[realIndex], [col]: newValue };
    updated.platforms = updatedPlatforms;
    onSave(updated);
  };

  const handleServiceEdit = (
    operator: string, from: string, to: string, dayDep: string, timeDep: string,
    field: string, newValue: string
  ) => {
    const idx = data.services.findIndex(
      (s) => s.operator === operator && s.from === from && s.to === to && s.dayDep === dayDep && s.timeDep === timeDep
    );
    if (idx === -1) return;
    const updated = { ...data };
    const updatedServices = [...updated.services];
    updatedServices[idx] = { ...updatedServices[idx], [field]: newValue };
    updated.services = updatedServices;
    onSave(updated);
  };

  const hasFilters = filterPays || filterGroupe || filterExploitant || search;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted focus:outline-none focus:border-blue/50 w-[200px]"
        />
        <FilterSelect label="Pays" value={filterPays} onChange={setFilterPays} options={paysList} />
        <FilterSelect label="Groupe" value={filterGroupe} onChange={setFilterGroupe} options={groupeList} />
        <FilterSelect label="Exploitant" value={filterExploitant} onChange={setFilterExploitant} options={exploitantList} />
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterPays(''); setFilterGroupe(''); setFilterExploitant(''); }}
            className="text-[10px] text-muted hover:text-orange transition-colors"
          >
            Effacer filtres
          </button>
        )}
        <span className="text-[10px] text-muted ml-auto">{filtered.length} / {data.platforms.length}</span>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-blue/5">
              {COLS.map((col) => (
                <th key={col.key} className={`text-left font-medium text-muted px-3 py-2 ${col.width}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((platform) => {
              const stats = platformStats.get(platform.site);
              const isSelected = selectedPlatformSite === platform.site;
              return (
                <Fragment key={platform.site}>
                  {/* Platform row */}
                  <tr
                    onClick={() => {
                      selectPlatform(isSelected ? null : platform.site);
                      if (isSelected) setExpandedDest(null);
                    }}
                    className={`border-t border-border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue/10'
                        : 'hover:bg-blue/5'
                    }`}
                  >
                    {COLS.map((col) => {
                      if (col.key === '_operators') {
                        return (
                          <td key={col.key} className={`px-3 py-1.5 font-mono text-purple ${col.width}`}>
                            {stats?.operators.length || 0}
                          </td>
                        );
                      }
                      if (col.key === '_trains') {
                        return (
                          <td key={col.key} className={`px-3 py-1.5 font-mono text-cyan ${col.width}`}>
                            {stats?.trainsPerWeek || 0}
                          </td>
                        );
                      }
                      const value = String((platform as unknown as Record<string, unknown>)[col.key] || '');
                      return (
                        <td key={col.key} className={`px-3 py-1.5 ${col.width}`}>
                          <EditableCell
                            value={value}
                            onCommit={(v) => handleCellEdit(platform.site, col.key, v)}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Inline detail row */}
                  {isSelected && (
                    <tr>
                      <td colSpan={COL_COUNT} className="p-0">
                        <InlineDetail
                          site={platform.site}
                          data={data}
                          expandedDest={expandedDest}
                          setExpandedDest={setExpandedDest}
                          onServiceEdit={handleServiceEdit}
                          onSelectPlatform={selectPlatform}
                          onNavigateOperator={navigateToOperator}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {saving && <div className="mt-2 text-[10px] text-cyan animate-pulse">Sauvegarde en cours...</div>}
    </div>
  );
}

/* ── Inline Detail (rendered under the selected row) ──────── */

function InlineDetail({
  site,
  data,
  expandedDest,
  setExpandedDest,
  onServiceEdit,
  onSelectPlatform,
  onNavigateOperator,
}: {
  site: string;
  data: TransportData;
  expandedDest: string | null;
  setExpandedDest: (key: string | null) => void;
  onServiceEdit: (op: string, from: string, to: string, dayDep: string, timeDep: string, field: string, val: string) => void;
  onSelectPlatform: (site: string) => void;
  onNavigateOperator: (op: string) => void;
}) {
  const platform = data.platforms.find((p) => p.site === site);
  const breakdown = buildPlatformOperatorBreakdown(site, data.routes, data.services);
  const connected = data.routes.filter((r) => r.from === site || r.to === site);
  const totalFreq = connected.reduce((sum, r) => sum + r.freq, 0);

  if (!platform) return null;

  return (
    <div className="bg-blue/5 border-t border-blue/15 border-b border-b-blue/15 px-6 py-4">
      <div className="flex gap-8">
        {/* Left: metadata + KPIs */}
        <div className="flex-shrink-0 w-[220px] space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-muted">Exploitant</span>
              <div className="text-text font-medium">{platform.exploitant || '—'}</div>
            </div>
            <div>
              <span className="text-[10px] text-muted">Groupe</span>
              <div className="text-text font-medium">{platform.groupe || '—'}</div>
            </div>
            <div>
              <span className="text-[10px] text-muted">Département</span>
              <div className="text-text font-medium">{platform.departement || '—'}</div>
            </div>
            <div>
              <span className="text-[10px] text-muted">SNCF</span>
              <div className="text-text font-medium">{platform.chantierSNCF ? 'Oui' : 'Non'}</div>
            </div>
          </div>

          <div className="flex gap-3 py-2 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-cyan">{totalFreq}</div>
              <div className="text-[9px] text-muted">trains/sem</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-blue">{connected.length}</div>
              <div className="text-[9px] text-muted">liaisons</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-purple">{breakdown.length}</div>
              <div className="text-[9px] text-muted">opérateurs</div>
            </div>
          </div>

          {/* Connected platforms */}
          {connected.length > 0 && (
            <div>
              <h4 className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-1">Connectée à</h4>
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                {connected.sort((a, b) => b.freq - a.freq).map((r) => {
                  const dest = r.from === site ? r.to : r.from;
                  return (
                    <button
                      key={`${r.from}-${r.to}`}
                      onClick={(e) => { e.stopPropagation(); onSelectPlatform(dest); }}
                      className="flex items-center justify-between w-full text-[10px] py-0.5 px-1 rounded hover:bg-blue/8 transition-colors text-left"
                    >
                      <span className="text-text truncate">{dest}</span>
                      <span className="font-mono text-cyan flex-shrink-0 ml-1">{r.freq}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: operator breakdown */}
        <div className="flex-1 min-w-0 space-y-3">
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Opérateurs actifs</h4>
          {breakdown.map(({ operator, destinations, totalFreq: opFreq, freqShare }) => {
            const color = getOperatorColor(operator);
            return (
              <div key={operator} className="space-y-1">
                {/* Operator header */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateOperator(operator); }}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-semibold text-text hover:text-blue transition-colors">{operator}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${freqShare * 100}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted w-[55px] text-right">{opFreq} t/sem</span>
                  </div>
                </div>

                {/* Destinations */}
                <div className="ml-4 space-y-0.5">
                  {destinations.map((d, i) => {
                    const destKey = `${operator}||${d.dest}`;
                    const isExpanded = expandedDest === destKey;
                    return (
                      <div key={i}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedDest(isExpanded ? null : destKey); }}
                          className="flex items-center justify-between text-xs py-1 px-1.5 w-full text-left rounded hover:bg-blue/8 transition-colors"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <svg
                              width="8" height="8" viewBox="0 0 8 8"
                              className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="currentColor" style={{ color }}
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

                        {isExpanded && d.services.length > 0 && (
                          <div className="ml-3 mt-1 mb-2 space-y-2 bg-blue/5 rounded p-2">
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
                                        input.className = 'w-full bg-blue/5 border border-blue/30 rounded px-1 py-0 text-text text-[10px] font-mono focus:outline-none';
                                        const commit = () => { onServiceEdit(operator, s.from, s.to, s.dayDep, s.timeDep, 'timeDep', input.value); td.textContent = input.value || '—'; };
                                        input.onblur = commit;
                                        input.onkeydown = (ev) => { if (ev.key === 'Enter') commit(); if (ev.key === 'Escape') td.textContent = s.timeDep || '—'; };
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
                                        input.className = 'w-full bg-blue/5 border border-blue/30 rounded px-1 py-0 text-text text-[10px] font-mono focus:outline-none';
                                        const commit = () => { onServiceEdit(operator, s.from, s.to, s.dayDep, s.timeDep, 'timeArr', input.value); td.textContent = input.value || '—'; };
                                        input.onblur = commit;
                                        input.onkeydown = (ev) => { if (ev.key === 'Enter') commit(); if (ev.key === 'Escape') td.textContent = s.timeArr || '—'; };
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

                            {d.services[0] && (
                              <div className="flex flex-wrap gap-1">
                                <MaterialBadge label="CM" value={d.services[0].acceptsCM} />
                                <MaterialBadge label="Cont." value={d.services[0].acceptsCont} />
                                <MaterialBadge label="Semi préh." value={d.services[0].acceptsSemiPre} />
                                <MaterialBadge label="Semi non-préh." value={d.services[0].acceptsSemiNon} />
                                <MaterialBadge label="P400" value={d.services[0].acceptsP400} />
                              </div>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); onSelectPlatform(d.dest); }}
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
      </div>
    </div>
  );
}
