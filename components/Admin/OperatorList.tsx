'use client';

import { useMemo } from 'react';
import { TransportData } from '@/lib/types';
import { getOperatorComparison } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminStore } from '@/store/useAdminStore';
import OperatorView from './OperatorView';

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorList({ data, onSave, saving }: Props) {
  const { selectedOperator, selectOperator, navigateToOperatorFlux } = useAdminStore();

  const operators = useMemo(
    () => getOperatorComparison(data.routes, data.services),
    [data.routes, data.services]
  );

  const totalTrains = data.routes.reduce((sum, r) => sum + r.freq, 0);

  // If an operator is selected, show its detail view
  if (selectedOperator) {
    return (
      <div>
        <button
          onClick={() => selectOperator(null)}
          className="text-xs text-muted hover:text-blue transition-colors mb-4 flex items-center gap-1"
        >
          &larr; Retour à la liste des opérateurs
        </button>
        <OperatorView data={data} operator={selectedOperator} onSave={onSave} saving={saving} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text">
          {operators.length} opérateurs actifs
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map(({ operator, stats }) => {
          const color = getOperatorColor(operator);
          const pct = totalTrains > 0
            ? Math.round((stats.trainsPerWeek / totalTrains) * 100)
            : 0;

          return (
            <button
              key={operator}
              onClick={() => selectOperator(operator)}
              className="glass-panel rounded-lg p-4 text-left hover:border-blue/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-text group-hover:text-blue transition-colors truncate">
                  {operator}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <div className="text-sm font-mono font-bold text-blue">{stats.platformCount}</div>
                  <div className="text-[9px] text-muted">plateformes</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-purple">{stats.routeCount}</div>
                  <div className="text-[9px] text-muted">liaisons</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-cyan">{stats.trainsPerWeek}</div>
                  <div className="text-[9px] text-muted">trains/sem</div>
                </div>
              </div>

              {/* Share bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[rgba(10,15,30,0.6)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-[10px] text-muted">{pct}% du réseau</span>
              </div>

              {/* Quick action */}
              <div className="mt-3 flex gap-2">
                <span
                  onClick={(e) => { e.stopPropagation(); navigateToOperatorFlux(operator); }}
                  className="text-[10px] text-muted hover:text-cyan transition-colors"
                >
                  Voir les flux →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
