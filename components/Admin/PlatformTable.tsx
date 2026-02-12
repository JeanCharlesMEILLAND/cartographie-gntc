'use client';

import { useState, useMemo } from 'react';
import { TransportData } from '@/lib/types';
import { buildAllPlatformStats } from '@/lib/adminComputations';
import { useAdminStore } from '@/store/useAdminStore';
import FilterSelect from './shared/FilterSelect';
import EditableCell from './shared/EditableCell';

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

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function PlatformTable({ data, onSave, saving }: Props) {
  const { selectedPlatformSite, selectPlatform } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterPays, setFilterPays] = useState('');
  const [filterGroupe, setFilterGroupe] = useState('');
  const [filterExploitant, setFilterExploitant] = useState('');

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
          className="text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted focus:outline-none focus:border-blue/50 w-[200px]"
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
            <tr className="bg-[rgba(10,15,30,0.6)]">
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
                <tr
                  key={platform.site}
                  onClick={() => selectPlatform(isSelected ? null : platform.site)}
                  className={`border-t border-border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue/10 border-l-2 border-l-blue'
                      : 'hover:bg-[rgba(20,30,60,0.3)]'
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
              );
            })}
          </tbody>
        </table>
      </div>
      {saving && <div className="mt-2 text-[10px] text-cyan animate-pulse">Sauvegarde en cours...</div>}
    </div>
  );
}
