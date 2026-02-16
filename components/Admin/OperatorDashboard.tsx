'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { TransportData } from '@/lib/types';
import { buildOperatorStats, groupServicesByRoute } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import KPICard from './shared/KPICard';

interface OperatorInfo {
  id: number;
  name: string;
  logo: string | null;
  color: string | null;
}

interface Props {
  data: TransportData;
  operator: string;
}

export default function OperatorDashboard({ data, operator }: Props) {
  const color = getOperatorColor(operator);
  const [operatorInfo, setOperatorInfo] = useState<OperatorInfo | null>(null);

  useEffect(() => {
    fetch('/api/admin/operators')
      .then((res) => (res.ok ? res.json() : []))
      .then((ops: OperatorInfo[]) => {
        const op = ops.find((o) => o.name === operator);
        if (op) setOperatorInfo(op);
      })
      .catch(() => {});
  }, [operator]);

  const stats = useMemo(
    () => buildOperatorStats(operator, data.routes, data.services),
    [data, operator]
  );

  const routeGroups = useMemo(
    () => groupServicesByRoute(data.services, operator).slice(0, 8),
    [data.services, operator]
  );

  const maxRouteServices = routeGroups.length > 0 ? routeGroups[0].services.length : 1;

  const materialStats = useMemo(() => {
    const opServices = data.services.filter((s) => s.operator === operator);
    const total = opServices.length || 1;
    return {
      cm: opServices.filter((s) => s.acceptsCM === 'Oui').length,
      cont: opServices.filter((s) => s.acceptsCont === 'Oui').length,
      semiPre: opServices.filter((s) => s.acceptsSemiPre === 'Oui').length,
      semiNon: opServices.filter((s) => s.acceptsSemiNon === 'Oui').length,
      p400: opServices.filter((s) => s.acceptsP400 === 'Oui').length,
      total,
    };
  }, [data.services, operator]);

  const materials = [
    { label: 'Caisses mobiles', key: 'cm' as const, color: 'bg-blue' },
    { label: 'Conteneurs', key: 'cont' as const, color: 'bg-cyan' },
    { label: 'Semi préhensibles', key: 'semiPre' as const, color: 'bg-purple' },
    { label: 'Semi non-préh.', key: 'semiNon' as const, color: 'bg-orange' },
    { label: 'P400', key: 'p400' as const, color: 'bg-yellow' },
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* ── Welcome banner ── */}
      <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
        <div className="flex items-center gap-4">
          {operatorInfo?.logo && (
            <img src={operatorInfo.logo} alt={operator} className="h-10 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-lg font-display font-bold text-text">{operator}</h1>
            <p className="text-xs text-muted mt-0.5">Bienvenue sur votre espace de gestion</p>
          </div>
          {data.uploadedAt && (
            <div className="ml-auto text-[10px] text-muted">
              Dernière mise à jour : {new Date(data.uploadedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border-l-4 border-blue rounded-lg">
          <KPICard
            value={stats.platformCount}
            label="Sites"
            color="text-blue"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="10" cy="7" r="3" /><path d="M10 10V17" /><path d="M6 17H14" />
              </svg>
            }
          />
        </div>
        <div className="border-l-4 border-purple rounded-lg">
          <KPICard
            value={stats.routeCount}
            label="Liaisons"
            color="text-purple"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 10H17M17 10L13 6M17 10L13 14" /><circle cx="3" cy="10" r="2" />
              </svg>
            }
          />
        </div>
        <div className="border-l-4 border-cyan rounded-lg">
          <KPICard
            value={stats.trainsPerWeek}
            label="Trains / semaine"
            color="text-cyan"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="4" y="3" width="12" height="12" rx="2" /><path d="M4 11H16" /><circle cx="7" cy="17" r="1" /><circle cx="13" cy="17" r="1" />
              </svg>
            }
          />
        </div>
        <div className="border-l-4 border-orange rounded-lg">
          <KPICard
            value={stats.serviceCount}
            label="Services"
            color="text-orange"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3V17H17" /><path d="M7 13L10 9L13 11L17 5" />
              </svg>
            }
          />
        </div>
      </div>

      {/* ── Two columns: Top routes + Material stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Top liaisons */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-4">
          <h2 className="text-xs font-display font-bold text-text mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
              <path d="M2 12L5 3L8 8L12 2" />
            </svg>
            Top liaisons
          </h2>
          {routeGroups.length === 0 ? (
            <p className="text-xs text-muted">Aucune liaison enregistrée</p>
          ) : (
            <div className="space-y-2">
              {routeGroups.map((g) => (
                <Link
                  key={g.route}
                  href={`/admin/flux?operateur=${encodeURIComponent(operator)}`}
                  className="flex items-center gap-3 group hover:bg-blue/5 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text truncate">
                      {g.from} <span className="text-muted mx-1">→</span> {g.to}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted w-8 text-right flex-shrink-0">
                    {g.services.length}
                  </span>
                  <div className="w-24 h-2 bg-border/50 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(g.services.length / maxRouteServices) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Material acceptance */}
        <div className="glass-panel rounded-xl p-4">
          <h2 className="text-xs font-display font-bold text-text mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="5" height="5" rx="1" />
              <rect x="8" y="1" width="5" height="5" rx="1" />
              <rect x="1" y="8" width="5" height="5" rx="1" />
              <rect x="8" y="8" width="5" height="5" rx="1" />
            </svg>
            Acceptation matériels
          </h2>
          <div className="space-y-3">
            {materials.map((m) => {
              const count = materialStats[m.key];
              const pct = Math.round((count / materialStats.total) * 100);
              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted">{m.label}</span>
                    <span className="text-[10px] font-mono text-text">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/activite"
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-blue/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 3.5L5 1.5L9 3.5L13 1.5V10.5L9 12.5L5 10.5L1 12.5V3.5Z" />
                <path d="M5 1.5V10.5M9 3.5V12.5" />
              </svg>
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-blue transition-colors">
              Voir mon réseau
            </h3>
          </div>
          <p className="text-[10px] text-muted">Carte interactive de vos sites et liaisons</p>
        </Link>

        <Link
          href="/admin/flux"
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-cyan/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center text-cyan">
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="2" width="12" height="10" rx="1.5" />
                <path d="M1 5.5H13M1 8.5H13M5 5.5V12M9 5.5V12" />
              </svg>
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-cyan transition-colors">
              Gérer mes services
            </h3>
          </div>
          <p className="text-[10px] text-muted">Tableau complet avec édition et filtres</p>
        </Link>

        <Link
          href="/admin/import"
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-purple/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 9V2M7 2L4.5 4.5M7 2L9.5 4.5" />
                <path d="M2 8.5V11C2 11.55 2.45 12 3 12H11C11.55 12 12 11.55 12 11V8.5" />
              </svg>
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-purple transition-colors">
              Importer des données
            </h3>
          </div>
          <p className="text-[10px] text-muted">Import CSV avec guide du format</p>
        </Link>
      </div>
    </div>
  );
}
