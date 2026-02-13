'use client';

import { TransportData } from '@/lib/types';
import { getTopPlatforms, getOperatorComparison } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminNav } from '@/lib/useAdminNav';
import KPICard from './shared/KPICard';

interface DashboardProps {
  data: TransportData;
}

export default function Dashboard({ data }: DashboardProps) {
  const { navigateToPlatform, navigateToOperator } = useAdminNav();

  const totalTrains = data.routes.reduce((sum, r) => sum + r.freq, 0);
  const topPlatforms = getTopPlatforms(data.routes, 10);
  const maxFreq = topPlatforms[0]?.freq || 1;
  const operatorComparison = getOperatorComparison(data.routes, data.services);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="flex gap-4 flex-wrap">
        <KPICard value={data.platforms.length} label="Plateformes" color="text-blue" />
        <KPICard value={data.operators.length} label="Opérateurs" color="text-purple" />
        <KPICard value={totalTrains} label="Trains / semaine" color="text-cyan" />
        <KPICard value={data.services.length} label="Services" color="text-orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Platforms */}
        <div className="glass-panel rounded-lg p-4">
          <h3 className="text-xs font-semibold text-text mb-3">Top 10 plateformes par trafic</h3>
          <div className="space-y-2">
            {topPlatforms.map(({ site, freq }) => (
              <button
                key={site}
                onClick={() => navigateToPlatform(site)}
                className="flex items-center gap-3 w-full text-left group hover:bg-blue/5 rounded px-2 py-1.5 transition-colors"
              >
                <span className="text-xs text-text group-hover:text-cyan truncate w-[180px] flex-shrink-0">
                  {site}
                </span>
                <div className="flex-1 h-4 bg-gray-200 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-cyan/30 rounded-sm transition-all"
                    style={{ width: `${(freq / maxFreq) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-cyan w-[50px] text-right flex-shrink-0">
                  {freq} t/s
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Operator Comparison */}
        <div className="glass-panel rounded-lg p-4">
          <h3 className="text-xs font-semibold text-text mb-3">Comparatif opérateurs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted border-b border-border">
                  <th className="text-left font-medium py-1.5 pr-2">Opérateur</th>
                  <th className="text-right font-medium py-1.5 px-2">PF</th>
                  <th className="text-right font-medium py-1.5 px-2">Liaisons</th>
                  <th className="text-right font-medium py-1.5 px-2">T/sem</th>
                  <th className="text-right font-medium py-1.5 pl-2">%</th>
                </tr>
              </thead>
              <tbody>
                {operatorComparison.map(({ operator, stats }) => {
                  const color = getOperatorColor(operator);
                  const pct = totalTrains > 0
                    ? Math.round((stats.trainsPerWeek / totalTrains) * 100)
                    : 0;
                  return (
                    <tr
                      key={operator}
                      onClick={() => navigateToOperator(operator)}
                      className="border-b border-border/50 hover:bg-blue/5 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 pr-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-text truncate">{operator}</span>
                        </div>
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-muted">{stats.platformCount}</td>
                      <td className="text-right py-1.5 px-2 font-mono text-muted">{stats.routeCount}</td>
                      <td className="text-right py-1.5 px-2 font-mono text-cyan">{stats.trainsPerWeek}</td>
                      <td className="text-right py-1.5 pl-2">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="text-[10px] text-muted w-[28px] text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
