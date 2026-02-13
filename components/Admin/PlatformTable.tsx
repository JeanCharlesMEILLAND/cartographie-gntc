'use client';

import { useState, useMemo, Fragment } from 'react';
import { TransportData, Platform } from '@/lib/types';
import { buildAllPlatformStats, buildPlatformOperatorBreakdown } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminStore } from '@/store/useAdminStore';
import { useAdminNav } from '@/lib/useAdminNav';
import { exportPlatforms } from '@/lib/exportCsv';
import FilterSelect from './shared/FilterSelect';
import EditableCell from './shared/EditableCell';
import MaterialBadge from './shared/MaterialBadge';

const COLS = [
  { key: 'site', label: 'Site', width: 'min-w-[160px]' },
  { key: 'ville', label: 'Ville', width: 'min-w-[90px]' },
  { key: 'exploitant', label: 'Exploitant', width: 'min-w-[120px]' },
  { key: 'groupe', label: 'Groupe', width: 'min-w-[100px]' },
  { key: 'departement', label: 'Dept', width: 'min-w-[45px]' },
  { key: 'pays', label: 'Pays', width: 'min-w-[65px]' },
  { key: 'lat', label: 'Lat', width: 'min-w-[65px]' },
  { key: 'lon', label: 'Lon', width: 'min-w-[65px]' },
  { key: 'chantierSNCF', label: 'SNCF', width: 'min-w-[40px]' },
  { key: '_operators', label: 'Op.', width: 'min-w-[35px]', computed: true },
  { key: '_trains', label: 'T/sem', width: 'min-w-[45px]', computed: true },
  { key: '_actions', label: '', width: 'min-w-[30px]', computed: true },
] as const;

const COL_COUNT = COLS.length;

const inputCls = 'w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50';

const EMPTY_PLATFORM: Omit<Platform, 'lat' | 'lon'> & { lat: string; lon: string } = {
  site: '', ville: '', exploitant: '', groupe: '', departement: '', pays: 'France', lat: '', lon: '',
};

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

  // Add platform state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_PLATFORM });
  const [addChantier, setAddChantier] = useState(false);
  const [addError, setAddError] = useState('');

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

    // Validate numeric fields
    if (col === 'lat' || col === 'lon') {
      const num = parseFloat(newValue);
      if (isNaN(num)) return;
      const updated = { ...data };
      const updatedPlatforms = [...updated.platforms];
      updatedPlatforms[realIndex] = { ...updatedPlatforms[realIndex], [col]: num };
      updated.platforms = updatedPlatforms;
      onSave(updated);
      return;
    }

    const updated = { ...data };
    const updatedPlatforms = [...updated.platforms];
    updatedPlatforms[realIndex] = { ...updatedPlatforms[realIndex], [col]: newValue };
    updated.platforms = updatedPlatforms;
    onSave(updated);
  };

  const handleChantierToggle = (platformSite: string) => {
    const realIndex = data.platforms.findIndex((p) => p.site === platformSite);
    if (realIndex === -1) return;
    const updated = { ...data };
    const updatedPlatforms = [...updated.platforms];
    updatedPlatforms[realIndex] = { ...updatedPlatforms[realIndex], chantierSNCF: !updatedPlatforms[realIndex].chantierSNCF };
    updated.platforms = updatedPlatforms;
    onSave(updated);
  };

  const handleDelete = (platformSite: string) => {
    if (!confirm(`Supprimer la plateforme "${platformSite}" et toutes ses liaisons/services associés ?`)) return;
    const updated = { ...data };
    updated.platforms = updated.platforms.filter((p) => p.site !== platformSite);
    updated.routes = updated.routes.filter((r) => r.from !== platformSite && r.to !== platformSite);
    updated.services = updated.services.filter((s) => s.from !== platformSite && s.to !== platformSite);
    if (selectedPlatformSite === platformSite) selectPlatform(null);
    onSave(updated);
  };

  const handleAdd = () => {
    const site = addForm.site.trim();
    if (!site) { setAddError('Le nom du site est requis'); return; }
    if (data.platforms.some((p) => p.site === site)) { setAddError('Ce site existe déjà'); return; }
    const lat = parseFloat(addForm.lat) || 0;
    const lon = parseFloat(addForm.lon) || 0;

    const newPlatform: Platform = {
      site,
      ville: addForm.ville.trim(),
      exploitant: addForm.exploitant.trim(),
      groupe: addForm.groupe.trim(),
      departement: addForm.departement.trim(),
      pays: addForm.pays.trim() || 'France',
      lat,
      lon,
      chantierSNCF: addChantier,
    };

    const updated = { ...data };
    updated.platforms = [...updated.platforms, newPlatform];
    onSave(updated);
    setShowAdd(false);
    setAddForm({ ...EMPTY_PLATFORM });
    setAddChantier(false);
    setAddError('');
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
      {/* Header */}
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
        <button
          onClick={() => exportPlatforms(filtered)}
          className="text-xs px-3 py-1.5 rounded-md border border-cyan/20 text-cyan hover:bg-cyan/5 transition-colors flex items-center gap-1.5"
          title="Exporter en CSV"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          CSV
        </button>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs px-3 py-1.5 rounded-md bg-blue text-white hover:bg-blue/90 transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Add platform form */}
      {showAdd && (
        <div className="glass-panel rounded-lg p-4 mb-4 border border-blue/20">
          <h4 className="text-xs font-semibold text-text mb-3">Nouvelle plateforme</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Site *</label>
              <input value={addForm.site} onChange={(e) => setAddForm({ ...addForm, site: e.target.value })} className={inputCls} placeholder="Nom du site" />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Ville</label>
              <input value={addForm.ville} onChange={(e) => setAddForm({ ...addForm, ville: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Exploitant</label>
              <input value={addForm.exploitant} onChange={(e) => setAddForm({ ...addForm, exploitant: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Groupe</label>
              <input value={addForm.groupe} onChange={(e) => setAddForm({ ...addForm, groupe: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Département</label>
              <input value={addForm.departement} onChange={(e) => setAddForm({ ...addForm, departement: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Pays</label>
              <input value={addForm.pays} onChange={(e) => setAddForm({ ...addForm, pays: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Latitude</label>
              <input type="number" step="any" value={addForm.lat} onChange={(e) => setAddForm({ ...addForm, lat: e.target.value })} className={inputCls} placeholder="46.5" />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Longitude</label>
              <input type="number" step="any" value={addForm.lon} onChange={(e) => setAddForm({ ...addForm, lon: e.target.value })} className={inputCls} placeholder="2.3" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
              <input type="checkbox" checked={addChantier} onChange={(e) => setAddChantier(e.target.checked)} className="rounded" />
              Chantier SNCF
            </label>
          </div>
          {addError && <p className="text-[10px] text-orange mt-2">{addError}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="text-xs px-4 py-1.5 rounded-md bg-blue text-white hover:bg-blue/90 transition-colors">Créer</button>
            <button onClick={() => { setShowAdd(false); setAddError(''); }} className="text-xs px-3 py-1.5 rounded-md border border-border text-muted hover:text-text transition-colors">Annuler</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-blue/5">
              {COLS.map((col) => (
                <th key={col.key} className={`text-left font-medium text-muted px-2 py-2 ${col.width}`}>
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
                  <tr
                    onClick={() => {
                      selectPlatform(isSelected ? null : platform.site);
                      if (isSelected) setExpandedDest(null);
                    }}
                    className={`border-t border-border cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue/10' : 'hover:bg-blue/5'
                    }`}
                  >
                    {COLS.map((col) => {
                      if (col.key === '_operators') {
                        return (
                          <td key={col.key} className={`px-2 py-1.5 font-mono text-purple ${col.width}`}>
                            {stats?.operators.length || 0}
                          </td>
                        );
                      }
                      if (col.key === '_trains') {
                        return (
                          <td key={col.key} className={`px-2 py-1.5 font-mono text-cyan ${col.width}`}>
                            {stats?.trainsPerWeek || 0}
                          </td>
                        );
                      }
                      if (col.key === '_actions') {
                        return (
                          <td key={col.key} className={`px-2 py-1.5 ${col.width}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(platform.site); }}
                              className="text-muted hover:text-orange transition-colors"
                              title="Supprimer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        );
                      }
                      if (col.key === 'chantierSNCF') {
                        return (
                          <td key={col.key} className={`px-2 py-1.5 text-center ${col.width}`}>
                            <input
                              type="checkbox"
                              checked={!!platform.chantierSNCF}
                              onChange={(e) => { e.stopPropagation(); handleChantierToggle(platform.site); }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded cursor-pointer"
                            />
                          </td>
                        );
                      }
                      if (col.key === 'lat' || col.key === 'lon') {
                        const numVal = platform[col.key];
                        return (
                          <td key={col.key} className={`px-2 py-1.5 ${col.width}`}>
                            <EditableCell
                              value={numVal != null ? String(numVal) : ''}
                              onCommit={(v) => handleCellEdit(platform.site, col.key, v)}
                              className="font-mono text-[10px]"
                            />
                          </td>
                        );
                      }
                      const value = String((platform as unknown as Record<string, unknown>)[col.key] || '');
                      return (
                        <td key={col.key} className={`px-2 py-1.5 ${col.width}`}>
                          <EditableCell
                            value={value}
                            onCommit={(v) => handleCellEdit(platform.site, col.key, v)}
                          />
                        </td>
                      );
                    })}
                  </tr>

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
