'use client';

import { useEffect } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import clsx from 'clsx';
import CountryFilter from './CountryFilter';
import OperatorChips from './OperatorChips';
import FrequencySlider from './FrequencySlider';
import TileSelector from './TileSelector';
import LayerToggles from './LayerToggles';

export default function FilterPanel() {
  const { panelCollapsed, setPanelCollapsed } = useFilterStore();

  // Auto-collapse on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    if (mq.matches) setPanelCollapsed(true);
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setPanelCollapsed(true);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setPanelCollapsed]);

  return (
    <>
      {/* Toggle button - Desktop: side, Mobile: bottom */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        className={clsx(
          'absolute z-[1000] glass-panel transition-all duration-300',
          // Desktop: side button
          'hidden sm:block top-1/2 -translate-y-1/2 rounded-r-md px-1 py-4 text-muted hover:text-blue',
          panelCollapsed ? 'left-0' : 'left-[280px]'
        )}
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

      {/* Mobile toggle button - bottom bar */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        className={clsx(
          'sm:hidden absolute z-[1000] glass-panel rounded-t-lg transition-all duration-300',
          'left-2 right-2 py-2 px-4 flex items-center justify-center gap-2 text-xs',
          panelCollapsed ? 'bottom-0 text-muted' : 'bottom-[60vh] text-blue'
        )}
      >
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={clsx('transition-transform', !panelCollapsed && 'rotate-180')}
        >
          <path d="M3 7.5L6 4.5L9 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {panelCollapsed ? 'Filtres' : 'Fermer'}
      </button>

      {/* Panel - Desktop: sidebar, Mobile: bottom sheet */}
      <div
        className={clsx(
          'absolute z-[999] glass-panel overflow-y-auto transition-all duration-300',
          // Desktop: left sidebar
          'sm:top-[50px] sm:left-0 sm:bottom-0 sm:w-[280px]',
          panelCollapsed ? 'sm:-translate-x-full' : 'sm:translate-x-0',
          // Mobile: bottom sheet
          'sm:rounded-none rounded-t-xl',
          'left-0 right-0',
          panelCollapsed
            ? 'bottom-0 translate-y-full sm:translate-y-0'
            : 'bottom-0 h-[60vh] sm:h-auto'
        )}
      >
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
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

          {/* Spacer for mobile bottom safe area */}
          <div className="sm:hidden h-4" />
        </div>
      </div>

      {/* Mobile backdrop */}
      {!panelCollapsed && (
        <div
          className="sm:hidden fixed inset-0 z-[998] bg-black/30"
          onClick={() => setPanelCollapsed(true)}
        />
      )}
    </>
  );
}
