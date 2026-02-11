'use client';

import { useFilterStore } from '@/store/useFilterStore';
import clsx from 'clsx';
import CountryFilter from './CountryFilter';
import OperatorChips from './OperatorChips';
import FrequencySlider from './FrequencySlider';
import TileSelector from './TileSelector';
import LayerToggles from './LayerToggles';

export default function FilterPanel() {
  const { panelCollapsed, setPanelCollapsed } = useFilterStore();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-[1000] glass-panel rounded-r-md px-1 py-4 text-muted hover:text-blue transition-colors"
        style={{ left: panelCollapsed ? 0 : 280 }}
      >
        {panelCollapsed ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Panel */}
      <div
        className={clsx(
          'absolute top-[50px] left-0 bottom-0 z-[999] glass-panel overflow-y-auto transition-transform duration-300',
          panelCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}
        style={{ width: 280 }}
      >
        <div className="p-4 space-y-5">
          <h2 className="text-sm font-display font-semibold text-blue uppercase tracking-wider">
            Filtres
          </h2>

          <CountryFilter />
          <OperatorChips />
          <FrequencySlider />

          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-display font-semibold text-blue uppercase tracking-wider mb-3">
              Carte
            </h2>
            <TileSelector />
          </div>

          <LayerToggles />
        </div>
      </div>
    </>
  );
}
