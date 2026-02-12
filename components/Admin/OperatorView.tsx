'use client';

import { useMemo } from 'react';
import { TransportData } from '@/lib/types';
import { buildOperatorStats, getOperatorPlatforms } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { useAdminStore } from '@/store/useAdminStore';
import KPICard from './shared/KPICard';
import OperatorMap from './OperatorMap';

interface Props {
  data: TransportData;
  operator: string;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorView({ data, operator, onSave, saving }: Props) {
  const { navigateToPlatform, setActiveTab } = useAdminStore();
  const color = getOperatorColor(operator);

  const stats = useMemo(
    () => buildOperatorStats(operator, data.routes, data.services),
    [operator, data.routes, data.services]
  );

  const operatorPlatforms = useMemo(() => {
    const sites = getOperatorPlatforms(data.services, operator);
    return sites.map((site) => {
      const p = data.platforms.find((pl) => pl.site === site);
      const destinations = data.services
        .filter((s) => s.operator === operator && s.from === site)
        .reduce((acc, s) => {
          if (!acc.includes(s.to)) acc.push(s.to);
          return acc;
        }, [] as string[]);
      return { site, platform: p, destinations };
    });
  }, [data.services, data.platforms, operator]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-sm font-display font-bold text-text">{operator}</h2>
        <span className="text-[10px] text-muted">— Mon activité</span>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 flex-wrap">
        <KPICard value={stats.platformCount} label="Plateformes" color="text-blue" />
        <KPICard value={stats.routeCount} label="Liaisons" color="text-purple" />
        <KPICard value={stats.trainsPerWeek} label="Trains / semaine" color="text-cyan" />
        <KPICard value={stats.serviceCount} label="Services" color="text-orange" />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('routes')}
          className="text-xs px-3 py-1.5 rounded-md border border-blue/20 text-blue hover:bg-blue/5 transition-colors"
        >
          Voir mes liaisons →
        </button>
        <button
          onClick={() => setActiveTab('flux')}
          className="text-xs px-3 py-1.5 rounded-md border border-border text-muted hover:text-text hover:border-blue/20 transition-colors"
        >
          Voir mes flux →
        </button>
      </div>

      {/* Map */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
          Carte du réseau
        </h3>
        <OperatorMap
          platforms={data.platforms}
          routes={data.routes}
          services={data.services}
          operator={operator}
        />
      </div>

      {/* Platforms */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
          Mes plateformes ({operatorPlatforms.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {operatorPlatforms.map(({ site, platform, destinations }) => (
            <button
              key={site}
              onClick={() => navigateToPlatform(site)}
              className="glass-panel rounded-lg p-3 text-left hover:border-blue/30 transition-colors"
            >
              <div className="text-xs font-semibold text-text truncate">{site}</div>
              {platform && (
                <div className="text-[10px] text-muted mt-0.5">
                  {platform.ville}{platform.pays !== 'France' ? ` — ${platform.pays}` : ''}
                </div>
              )}
              <div className="text-[10px] text-muted mt-1.5">
                {destinations.length} destination{destinations.length > 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {saving && <div className="text-[10px] text-cyan animate-pulse">Sauvegarde en cours...</div>}
    </div>
  );
}
