'use client';

import { useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { getOperatorColor } from '@/lib/colors';

interface LegendProps {
  routes?: { operators: string[]; freq: number }[];
}

export default function Legend({ routes = [] }: LegendProps) {
  const [visible, setVisible] = useState(false);
  const showClock = useFilterStore((s) => s.showClock);
  const selectedPlatform = useFilterStore((s) => s.selectedPlatform);
  const activeOperators = useFilterStore((s) => s.activeOperators);

  const hiddenOnMobile = selectedPlatform ? 'hidden sm:block' : '';

  // Build operator list from visible routes
  const operatorStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of routes) {
      for (const op of r.operators) {
        if (activeOperators.has(op)) {
          map.set(op, (map.get(op) || 0) + r.freq);
        }
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([op, freq]) => ({ operator: op, freq, color: getOperatorColor(op) }));
  }, [routes, activeOperators]);

  return (
    <div className={`absolute ${showClock ? 'bottom-[72px] sm:bottom-[60px]' : 'bottom-4'} right-2 sm:right-4 z-[1000] ${hiddenOnMobile}`}>
      {/* Toggle button */}
      <button
        onClick={() => setVisible(!visible)}
        className="glass-panel rounded-md px-2 py-1 text-[10px] text-muted hover:text-blue transition-colors mb-1 ml-auto block"
      >
        {visible ? 'Masquer légende' : 'Légende'}
      </button>

      {visible && (
        <div className="glass-panel rounded-lg p-3 max-w-[220px] max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {/* Route intensity */}
            <div>
              <div className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-1">Intensité</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-5 h-[4px] rounded-full flex-shrink-0" style={{ backgroundColor: '#587bbd' }} />
                  <span className="text-muted">&gt;30 trains/sem</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-5 h-[3px] rounded-full flex-shrink-0 opacity-85" style={{ backgroundColor: '#587bbd' }} />
                  <span className="text-muted">16–30 trains/sem</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-5 h-[2.5px] rounded-full flex-shrink-0 opacity-65" style={{ backgroundColor: '#587bbd' }} />
                  <span className="text-muted">9–15 trains/sem</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-5 h-[1.5px] rounded-full flex-shrink-0 opacity-40" style={{ backgroundColor: '#587bbd' }} />
                  <span className="text-muted">1–8 trains/sem</span>
                </div>
              </div>
            </div>

            {/* Platform types */}
            <div className="border-t border-border pt-2">
              <div className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-1">Plateformes</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#7dc243', border: '1px solid #7dc243' }} />
                  <span className="text-muted">France</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#8b6db5', border: '1px solid #8b6db5' }} />
                  <span className="text-muted">International</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 marker-hub" style={{ backgroundColor: '#7dc243', border: '1px solid #7dc243' }} />
                  <span className="text-muted">Hub majeur</span>
                </div>
              </div>
            </div>

            {/* Operator colors */}
            {operatorStats.length > 0 && (
              <div className="border-t border-border pt-2">
                <div className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Opérateurs ({operatorStats.length})
                </div>
                <div className="space-y-0.5">
                  {operatorStats.map(({ operator, freq, color }) => (
                    <div key={operator} className="flex items-center gap-1.5 text-[10px]">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-text truncate flex-1">{operator}</span>
                      <span className="text-muted font-mono flex-shrink-0">{freq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard shortcuts */}
            <div className="border-t border-border pt-2">
              <div className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-1">Raccourcis</div>
              <div className="space-y-0.5 text-[10px] text-muted">
                <div><kbd className="px-1 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: 'rgba(88,123,189,0.1)' }}>F</kbd> Filtres</div>
                <div><kbd className="px-1 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: 'rgba(88,123,189,0.1)' }}>S</kbd> Recherche</div>
                <div><kbd className="px-1 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: 'rgba(88,123,189,0.1)' }}>Esc</kbd> Fermer</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
