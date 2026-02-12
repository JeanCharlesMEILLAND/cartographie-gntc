'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import clsx from 'clsx';

type LayerKey = 'showRoutes' | 'showPlatforms' | 'showLabels' | 'showRailway' | 'showITE' | 'showITEDispo' | 'showVoieUnique' | 'showVoieDouble' | 'showElectrification';

const LAYERS: { key: LayerKey; label: string }[] = [
  { key: 'showRoutes', label: 'Liaisons' },
  { key: 'showPlatforms', label: 'Plateformes' },
  { key: 'showRailway', label: 'Réseau ferré' },
  { key: 'showITE', label: 'ITE utilisées' },
  { key: 'showITEDispo', label: 'ITE disponibles' },
  { key: 'showVoieUnique', label: 'Voie unique' },
  { key: 'showVoieDouble', label: 'Double voie' },
  { key: 'showElectrification', label: 'Électrification' },
];

export default function LayerToggles() {
  const store = useFilterStore();
  const [open, setOpen] = useState(false);

  // Count active layers
  const activeCount = LAYERS.filter(({ key }) => store[key]).length;

  return (
    <div>
      {/* Accordion header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-1"
      >
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          Couches <span className="text-cyan font-mono">{activeCount}/{LAYERS.length}</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={clsx('text-muted transition-transform duration-200', open && 'rotate-180')}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Accordion content */}
      {open && (
        <div className="mt-1 space-y-0.5">
          {LAYERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => store.toggleLayer(key)}
              className="flex items-center gap-1.5 w-full text-left hover:bg-blue/5 rounded px-2 py-0.5 transition-colors"
            >
              <div
                className={clsx(
                  'w-3 h-3 rounded-sm border transition-colors flex items-center justify-center flex-shrink-0',
                  store[key]
                    ? 'bg-blue border-blue'
                    : 'border-muted'
                )}
              >
                {store[key] && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={clsx('text-[11px]', store[key] ? 'text-text' : 'text-muted')}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
