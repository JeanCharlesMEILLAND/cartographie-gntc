'use client';

import { useState, useMemo } from 'react';
import { TransportData } from '@/lib/types';
import { useAdminStore } from '@/store/useAdminStore';
import FilterSelect from './shared/FilterSelect';
import { MaterialDot } from './shared/MaterialBadge';

const COLS = [
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

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
  userOperator?: string;
}

export default function FluxTable({ data, onSave, saving, userOperator }: Props) {
  const { fluxOperatorFilter, navigateToPlatform } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 50;

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

  const hasFilters = effectiveOperatorFilter || filterFrom || filterTo || filterDay || search;

  return (
    <div>
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
            </tr>
          </thead>
          <tbody>
            {pageData.map((service, i) => (
              <tr key={`${service.from}-${service.to}-${service.dayDep}-${i}`} className="border-t border-border hover:bg-blue/5">
                {COLS.map((col) => {
                  const value = String((service as unknown as Record<string, unknown>)[col.key] || '');
                  const isEditing = editCell?.row === i && editCell?.col === col.key;
                  const isMaterial = MATERIAL_COLS.has(col.key);
                  const isClickable = col.key === 'from' || col.key === 'to';

                  if (isMaterial && !isEditing) {
                    return (
                      <td key={col.key} className={`px-2 py-1.5 text-center ${col.width}`} onDoubleClick={() => startEdit(i, col.key, value)}>
                        <MaterialDot value={value} />
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className={`px-2 py-1.5 ${col.width}`} onDoubleClick={() => startEdit(i, col.key, value)}>
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
