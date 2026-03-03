'use client';

import { useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import clsx from 'clsx';

export default function PlatformList() {
  const {
    visiblePlatforms,
    selectedPlatform,
    setSelectedPlatform,
  } = useFilterStore();
  const setMapZoomTarget = useSearchStore((s) => s.setMapZoomTarget);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Sort platforms alphabetically, filter by search
  const filtered = useMemo(() => {
    const sorted = [...visiblePlatforms].sort((a, b) =>
      a.site.localeCompare(b.site, 'fr')
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (p) =>
        p.site.toLowerCase().includes(q) ||
        p.ville.toLowerCase().includes(q)
    );
  }, [visiblePlatforms, search]);

  const handleSelect = (site: string) => {
    if (selectedPlatform === site) {
      setSelectedPlatform(null);
    } else {
      setSelectedPlatform(site);
    }
  };

  return (
    <div>
      {/* Accordion header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-1"
      >
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          Plateformes{' '}
          <span className="text-cyan font-mono">{visiblePlatforms.length}</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={clsx(
            'text-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-1 space-y-1">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une plateforme..."
            className="w-full bg-white border border-border text-text text-[11px] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue"
          />

          {/* Platform list */}
          <div className="max-h-[200px] overflow-y-auto space-y-px">
            {filtered.length === 0 && (
              <p className="text-[10px] text-muted py-2 text-center">
                Aucune plateforme
              </p>
            )}
            {filtered.map((p) => {
              const isSelected = selectedPlatform === p.site;
              return (
                <button
                  key={p.site}
                  onClick={() => handleSelect(p.site)}
                  className={clsx(
                    'flex items-center gap-1.5 w-full text-left rounded px-2 py-0.5 transition-colors text-[11px]',
                    isSelected
                      ? 'bg-blue/10 text-blue font-medium'
                      : 'hover:bg-blue/5 text-text'
                  )}
                >
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      isSelected ? 'bg-blue' : 'bg-muted/40'
                    )}
                  />
                  <span className="truncate">{p.site}</span>
                  {p.ville && p.ville !== p.site && (
                    <span className="text-[9px] text-muted ml-auto flex-shrink-0">
                      {p.ville}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
