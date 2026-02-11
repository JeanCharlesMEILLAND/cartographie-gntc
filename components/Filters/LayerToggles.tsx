'use client';

import { useFilterStore } from '@/store/useFilterStore';
import clsx from 'clsx';

type LayerKey = 'showRoutes' | 'showPlatforms' | 'showLabels' | 'showRailway' | 'animateFlux' | 'showFranceBorder';

const LAYERS: { key: LayerKey; label: string }[] = [
  { key: 'showRoutes', label: 'Routes' },
  { key: 'showPlatforms', label: 'Plateformes' },
  { key: 'showLabels', label: 'Labels hubs' },
  { key: 'showRailway', label: 'Réseau ferré' },
  { key: 'animateFlux', label: 'Animation flux' },
  { key: 'showFranceBorder', label: 'Contour France' },
];

export default function LayerToggles() {
  const store = useFilterStore();

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">
        Couches
      </label>
      <div className="space-y-1">
        {LAYERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => store.toggleLayer(key)}
            className="flex items-center gap-2 w-full text-left text-sm hover:bg-[rgba(20,30,60,0.4)] rounded px-2 py-1 transition-colors"
          >
            <div
              className={clsx(
                'w-3.5 h-3.5 rounded-sm border transition-colors flex items-center justify-center',
                store[key]
                  ? 'bg-blue border-blue'
                  : 'border-muted'
              )}
            >
              {store[key] && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={clsx('text-xs', store[key] ? 'text-text' : 'text-muted')}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
