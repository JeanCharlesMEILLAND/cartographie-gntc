'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import clsx from 'clsx';

type LayerKey = 'showRoutes' | 'showPlatforms' | 'showLabels' | 'showRailway' | 'showITE' | 'showITEDispo' | 'showVoieUnique' | 'showVoieDouble' | 'showElectrification' | 'showWaterways' | 'showPorts' | 'showLocks';

// Color matching the map rendering for each layer
const LAYER_COLORS: Record<LayerKey, string> = {
  showRoutes: '#587bbd',
  showPlatforms: '#587bbd',
  showLabels: '#587bbd',
  showRailway: '#64b5f6',
  showWaterways: '#2196F3',
  showPorts: '#0D47A1',
  showLocks: '#FF6F00',
  showITE: '#FDD835',
  showITEDispo: '#42A5F5',
  showVoieUnique: '#42A5F5',
  showVoieDouble: '#FF9800',
  showElectrification: '#EF5350',
};

const LAYERS: { key: LayerKey; label: string }[] = [
  { key: 'showRoutes', label: 'Liaisons' },
  { key: 'showPlatforms', label: 'Plateformes' },
  { key: 'showRailway', label: 'Réseau ferré' },
  { key: 'showWaterways', label: 'Voies navigables' },
  { key: 'showPorts', label: 'Ports de fret' },
  { key: 'showLocks', label: 'Écluses' },
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
          {LAYERS.map(({ key, label }) => {
            const color = LAYER_COLORS[key];
            return (
              <button
                key={key}
                onClick={() => store.toggleLayer(key)}
                className="flex items-center gap-1.5 w-full text-left hover:bg-blue/5 rounded px-2 py-0.5 transition-colors"
              >
                <div
                  className={clsx(
                    'w-3 h-3 rounded-sm border transition-colors flex items-center justify-center flex-shrink-0',
                    store[key]
                      ? 'border-transparent'
                      : 'border-muted'
                  )}
                  style={store[key] ? { backgroundColor: color } : undefined}
                >
                  {store[key] && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {/* Color indicator dot */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, opacity: store[key] ? 1 : 0.4 }}
                />
                <span className={clsx('text-[11px]', store[key] ? 'text-text' : 'text-muted')}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
