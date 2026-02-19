'use client';

import { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TransportData, Service } from '@/lib/types';
import { useAdminNav } from '@/lib/useAdminNav';
import { exportServices } from '@/lib/exportCsv';
import { parseCsvServices } from '@/lib/importCsv';
import { FilterSelect, MaterialDot } from '@cartographie/shared/ui';

const ALL_COLS = [
  { key: 'operator', label: 'Opérateur', width: 'min-w-[120px]' },
  { key: 'from', label: 'Départ', width: 'min-w-[150px]' },
  { key: 'to', label: 'Destination', width: 'min-w-[150px]' },
  { key: 'dayDep', label: 'J.Dép', width: 'min-w-[50px]' },
  { key: 'timeDep', label: 'HLR', width: 'min-w-[55px]' },
  { key: 'dayArr', label: 'J.Arr', width: 'min-w-[50px]' },
  { key: 'timeArr', label: 'MAD', width: 'min-w-[55px]' },
  { key: 'acceptsCM', label: 'CM', width: 'min-w-[35px]' },
  { key: 'acceptsCont', label: 'Cont', width: 'min-w-[35px]' },
  { key: 'acceptsSemiPre', label: 'S.Pr', width: 'min-w-[35px]' },
  { key: 'acceptsSemiNon', label: 'S.NP', width: 'min-w-[35px]' },
  { key: 'acceptsP400', label: 'P400', width: 'min-w-[35px]' },
] as const;

const MATERIAL_COLS = new Set(['acceptsCM', 'acceptsCont', 'acceptsSemiPre', 'acceptsSemiNon', 'acceptsP400']);
const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
  userOperator?: string;
}

const EMPTY_NEW_SERVICE = {
  from: '', to: '', dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '',
  acceptsCM: 'Non', acceptsCont: 'Non', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non',
};

export default function FluxTable({ data, onSave, saving, userOperator }: Props) {
  const searchParams = useSearchParams();
  const fluxOperatorFilter = searchParams.get('operateur') || '';
  const { navigateToPlatform } = useAdminNav();
  const [search, setSearch] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 50;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({ ...EMPTY_NEW_SERVICE });

  // Hide operator column for operators
  const COLS = useMemo(() => {
    if (userOperator) return ALL_COLS.filter((c) => c.key !== 'operator');
    return ALL_COLS;
  }, [userOperator]);

  // Apply external operator filter from store navigation
  const effectiveOperatorFilter = userOperator || fluxOperatorFilter || filterOperator;

  const baseServices = useMemo(() => {
    if (userOperator) return data.services.filter((s) => s.operator === userOperator);
    return data.services;
  }, [data.services, userOperator]);

  const operatorList = useMemo(
    () => [...new Set(baseServices.map((s) => s.operator).filter(Boolean))].sort(),
    [baseServices]
  );
  const fromList = useMemo(
    () => [...new Set(baseServices.map((s) => s.from).filter(Boolean))].sort(),
    [baseServices]
  );
  const toList = useMemo(
    () => [...new Set(baseServices.map((s) => s.to).filter(Boolean))].sort(),
    [baseServices]
  );
  const dayList = useMemo(
    () => [...new Set(baseServices.map((s) => s.dayDep).filter(Boolean))].sort(),
    [baseServices]
  );

  const platformNames = useMemo(
    () => data.platforms.map((p) => p.site).sort(),
    [data.platforms]
  );

  const filtered = useMemo(() => {
    return baseServices.filter((s) => {
      if (effectiveOperatorFilter && s.operator !== effectiveOperatorFilter) return false;
      if (filterFrom && s.from !== filterFrom) return false;
      if (filterTo && s.to !== filterTo) return false;
      if (filterDay && s.dayDep !== filterDay) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.operator.toLowerCase().includes(q) &&
          !s.from.toLowerCase().includes(q) &&
          !s.to.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [baseServices, effectiveOperatorFilter, filterFrom, filterTo, filterDay, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage);

  const startEdit = (rowIndex: number, col: string, value: string) => {
    setEditCell({ row: rowIndex, col });
    setEditValue(value);
  };

  const commitEdit = () => {
    if (!editCell) return;
    const service = pageData[editCell.row];
    if (!service) return;
    const realIndex = data.services.findIndex(
      (s) => s.operator === service.operator && s.from === service.from && s.to === service.to && s.dayDep === service.dayDep && s.timeDep === service.timeDep
    );
    if (realIndex === -1) return;
    const updated = { ...data };
    const updatedServices = [...updated.services];
    updatedServices[realIndex] = { ...updatedServices[realIndex], [editCell.col]: editValue };
    updated.services = updatedServices;
    onSave(updated);
    setEditCell(null);
  };

  const handleDelete = (service: Service) => {
    const realIndex = data.services.findIndex(
      (s) => s.operator === service.operator && s.from === service.from && s.to === service.to && s.dayDep === service.dayDep && s.timeDep === service.timeDep
    );
    if (realIndex === -1) return;
    const updated = { ...data };
    updated.services = data.services.filter((_, i) => i !== realIndex);
    onSave(updated);
  };

  const handleAddService = () => {
    if (!newService.from || !newService.to) return;
    const operator = userOperator || '';
    if (!operator && !userOperator) return;
    const svc: Service = { operator, ...newService };
    const updated = { ...data };
    updated.services = [...data.services, svc];
    onSave(updated);
    setNewService({ ...EMPTY_NEW_SERVICE });
    setShowAddForm(false);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const result = parseCsvServices(text, userOperator);
      if (result.errors.length > 0) {
        setImportResult({ added: 0, errors: result.errors });
        return;
      }
      if (result.services.length === 0) {
        setImportResult({ added: 0, errors: ['Aucun service valide trouvé'] });
        return;
      }
      const updated = { ...data };
      updated.services = [...updated.services, ...result.services];
      // Re-aggregate routes
      const routeMap = new Map<string, { from: string; to: string; fromLat: number; fromLon: number; toLat: number; toLon: number; freq: number; operators: Set<string> }>();
      for (const s of updated.services) {
        const key = [s.from, s.to].sort().join('||');
        if (!routeMap.has(key)) {
          const fromP = updated.platforms.find((p) => p.site === s.from);
          const toP = updated.platforms.find((p) => p.site === s.to);
          routeMap.set(key, {
            from: s.from, to: s.to,
            fromLat: fromP?.lat || 0, fromLon: fromP?.lon || 0,
            toLat: toP?.lat || 0, toLon: toP?.lon || 0,
            freq: 0, operators: new Set(),
          });
        }
        const r = routeMap.get(key)!;
        r.freq++;
        r.operators.add(s.operator);
      }
      updated.routes = [...routeMap.values()].map((r) => ({ ...r, operators: [...r.operators] }));
      updated.operators = [...new Set(updated.services.map((s) => s.operator))].sort();
      onSave(updated);
      setImportResult({ added: result.services.length, errors: result.skipped > 0 ? [`${result.skipped} lignes ignorées (données manquantes)`] : [] });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasFilters = effectiveOperatorFilter || filterFrom || filterTo || filterDay || search;

  const selectCls = 'text-[10px] bg-white border border-border rounded px-1.5 py-1 text-text focus:outline-none focus:border-blue/40';
  const inputCls = 'text-[10px] bg-white border border-border rounded px-1.5 py-1 text-text font-mono focus:outline-none focus:border-blue/40 w-16';

  return (
    <div className="pb-20 md:pb-0">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Rechercher..."
          className="text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted focus:outline-none focus:border-blue/50 w-[200px]"
        />
        {!userOperator && (
          <FilterSelect
            label="Opérateur"
            value={fluxOperatorFilter || filterOperator}
            onChange={(v) => { setFilterOperator(v); setPage(0); }}
            options={operatorList}
          />
        )}
        <FilterSelect label="Départ" value={filterFrom} onChange={(v) => { setFilterFrom(v); setPage(0); }} options={fromList} />
        <FilterSelect label="Destination" value={filterTo} onChange={(v) => { setFilterTo(v); setPage(0); }} options={toList} />
        <FilterSelect label="Jour" value={filterDay} onChange={(v) => { setFilterDay(v); setPage(0); }} options={dayList} />
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterOperator(''); setFilterFrom(''); setFilterTo(''); setFilterDay(''); setPage(0); }}
            className="text-[10px] text-muted hover:text-orange transition-colors"
          >
            Effacer filtres
          </button>
        )}
        <span className="text-[10px] text-muted ml-auto">{filtered.length} / {baseServices.length} services</span>

        {/* Add service button */}
        {userOperator && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 ${
              showAddForm
                ? 'border-orange/20 text-orange hover:bg-orange/5'
                : 'border-cyan/20 text-cyan hover:bg-cyan/5'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {showAddForm ? <path d="M3 7H11" /> : <><path d="M7 3V11" /><path d="M3 7H11" /></>}
            </svg>
            {showAddForm ? 'Annuler' : 'Ajouter'}
          </button>
        )}

        <button
          onClick={() => exportServices(filtered)}
          className="text-xs px-3 py-1.5 rounded-md border border-cyan/20 text-cyan hover:bg-cyan/5 transition-colors flex items-center gap-1.5"
          title="Exporter en CSV"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
        {!userOperator && (
          <>
            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleCsvImport} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-md border border-blue/20 text-blue hover:bg-blue/5 transition-colors flex items-center gap-1.5"
              title="Importer des services depuis un CSV"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import CSV
            </button>
          </>
        )}
        {userOperator && (
          <Link
            href="/admin/import"
            className="text-xs px-3 py-1.5 rounded-md border border-blue/20 text-blue hover:bg-blue/5 transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import CSV
          </Link>
        )}
      </div>

      {/* Add service form */}
      {showAddForm && userOperator && (
        <div className="mb-3 glass-panel rounded-lg p-3 border border-cyan/20">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="text-[9px] text-muted block mb-0.5">Départ</label>
              <select
                value={newService.from}
                onChange={(e) => setNewService({ ...newService, from: e.target.value })}
                className={selectCls + ' w-40'}
              >
                <option value="">— Choisir —</option>
                {platformNames.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted block mb-0.5">Destination</label>
              <select
                value={newService.to}
                onChange={(e) => setNewService({ ...newService, to: e.target.value })}
                className={selectCls + ' w-40'}
              >
                <option value="">— Choisir —</option>
                {platformNames.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted block mb-0.5">J.Dép</label>
              <select value={newService.dayDep} onChange={(e) => setNewService({ ...newService, dayDep: e.target.value })} className={selectCls}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted block mb-0.5">HLR</label>
              <input value={newService.timeDep} onChange={(e) => setNewService({ ...newService, timeDep: e.target.value })} placeholder="08:30" className={inputCls} />
            </div>
            <div>
              <label className="text-[9px] text-muted block mb-0.5">J.Arr</label>
              <select value={newService.dayArr} onChange={(e) => setNewService({ ...newService, dayArr: e.target.value })} className={selectCls}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted block mb-0.5">MAD</label>
              <input value={newService.timeArr} onChange={(e) => setNewService({ ...newService, timeArr: e.target.value })} placeholder="14:00" className={inputCls} />
            </div>
            {['CM', 'Cont', 'S.Pr', 'S.NP', 'P400'].map((label, idx) => {
              const keys = ['acceptsCM', 'acceptsCont', 'acceptsSemiPre', 'acceptsSemiNon', 'acceptsP400'] as const;
              const key = keys[idx];
              return (
                <label key={key} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newService[key] === 'Oui'}
                    onChange={(e) => setNewService({ ...newService, [key]: e.target.checked ? 'Oui' : 'Non' })}
                    className="accent-cyan w-3 h-3"
                  />
                  <span className="text-[9px] text-muted">{label}</span>
                </label>
              );
            })}
            <button
              onClick={handleAddService}
              disabled={!newService.from || !newService.to || saving}
              className="text-[10px] px-3 py-1.5 rounded-md bg-cyan text-white hover:bg-cyan/90 transition-colors disabled:opacity-40"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className={`mb-3 p-3 rounded-lg text-xs ${importResult.errors.length > 0 && importResult.added === 0 ? 'bg-orange/10 border border-orange/20' : 'bg-cyan/10 border border-cyan/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              {importResult.added > 0 && <span className="text-cyan font-medium">{importResult.added} services importés avec succès. </span>}
              {importResult.errors.map((err, i) => <span key={i} className="text-orange">{err} </span>)}
            </div>
            <button onClick={() => setImportResult(null)} className="text-muted hover:text-text text-[10px]">Fermer</button>
          </div>
        </div>
      )}

      {/* Edit hint */}
      <div className="flex items-center gap-1.5 mb-2 text-[10px] text-muted">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" />
        </svg>
        Double-cliquez sur une cellule pour la modifier
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-blue/5">
              {COLS.map((col) => (
                <th key={col.key} className={`text-left font-medium text-muted px-2 py-2 ${col.width}`}>
                  {col.label}
                </th>
              ))}
              <th className="w-8 px-1 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((service, i) => (
              <tr key={`${service.from}-${service.to}-${service.dayDep}-${service.timeDep}-${i}`} className="border-t border-border hover:bg-blue/5 group">
                {COLS.map((col) => {
                  const value = String((service as unknown as Record<string, unknown>)[col.key] || '');
                  const isEditing = editCell?.row === i && editCell?.col === col.key;
                  const isMaterial = MATERIAL_COLS.has(col.key);
                  const isClickable = !userOperator && (col.key === 'from' || col.key === 'to');

                  if (isMaterial && !isEditing) {
                    return (
                      <td key={col.key} className={`px-2 py-1.5 text-center cursor-pointer hover:bg-blue/10 transition-colors ${col.width}`} onDoubleClick={() => startEdit(i, col.key, value)} title="Double-clic pour modifier">
                        <MaterialDot value={value} />
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className={`px-2 py-1.5 cursor-pointer hover:bg-blue/10 transition-colors ${col.width}`} onDoubleClick={() => startEdit(i, col.key, value)} title="Double-clic pour modifier">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') setEditCell(null);
                          }}
                          className="w-full bg-blue/5 border border-blue/30 rounded px-1.5 py-0.5 text-text focus:outline-none text-xs"
                        />
                      ) : isClickable ? (
                        <button
                          onClick={() => navigateToPlatform(value)}
                          className="text-text hover:text-blue transition-colors text-left truncate"
                        >
                          {value}
                        </button>
                      ) : (
                        <span className="cursor-default">{value}</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-1 py-1.5 w-8">
                  <button
                    onClick={() => handleDelete(service)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-orange transition-all"
                    title="Supprimer ce service"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 3H10M4 3V2H8V3M5 5V9M7 5V9M3 3L3.5 10H8.5L9 3" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-text disabled:opacity-30"
          >
            Précédent
          </button>
          <span className="text-[10px] text-muted">
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-text disabled:opacity-30"
          >
            Suivant
          </button>
        </div>
      )}
      {saving && <div className="mt-2 text-[10px] text-cyan animate-pulse">Sauvegarde en cours...</div>}
    </div>
  );
}
