'use client';

import { useMemo } from 'react';
import { TransportData } from '@/lib/types';
import { getOperatorComparison } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorLogo, getOperatorContact, hasContact } from '@/lib/operatorContacts';
import { useAdminNav } from '@/lib/useAdminNav';

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorList({ data, onSave, saving }: Props) {
  const { navigateToOperator, navigateToOperatorFlux } = useAdminNav();

  const operators = useMemo(
    () => getOperatorComparison(data.routes, data.services),
    [data.routes, data.services]
  );

  const totalTrains = data.routes.reduce((sum, r) => sum + r.freq, 0);

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
              onClick={() => navigateToOperator(operator)}
              className="glass-panel rounded-lg p-4 text-left hover:border-blue/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                {getOperatorLogo(operator) ? (
                  <img src={getOperatorLogo(operator)!} alt="" className="w-6 h-6 rounded object-contain flex-shrink-0" />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
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
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-[10px] text-muted">{pct}% du réseau</span>
              </div>

              {/* Contact + actions */}
              <div className="mt-3 flex items-center justify-between">
                <span
                  onClick={(e) => { e.stopPropagation(); navigateToOperatorFlux(operator); }}
                  className="text-[10px] text-muted hover:text-cyan transition-colors"
                >
                  Voir les flux →
                </span>
                {hasContact(operator) && (() => {
                  const c = getOperatorContact(operator)!;
                  return (
                    <div className="flex items-center gap-2 text-[10px]">
                      {c.email && (
                        <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors" title={c.email}>
                          email
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone.replace(/\s/g, '')}`} onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors" title={c.phone}>
                          tel
                        </a>
                      )}
                      {c.website && (
                        <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors" title={c.website}>
                          web
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
