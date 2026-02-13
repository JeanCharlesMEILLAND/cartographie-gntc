'use client';

import { useMemo, useEffect, useState } from 'react';
import { TransportData } from '@/lib/types';
import { getTopPlatforms, getOperatorComparison } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorLogo } from '@/lib/operatorContacts';
import { useAdminNav } from '@/lib/useAdminNav';
import Link from 'next/link';
import KPICard from './shared/KPICard';

/* ─── SVG Icons ─── */
const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconRoute = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />
  </svg>
);
const IconTrain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" /><path d="M8 19l-2 3" /><path d="M16 19l2 3" /><circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ─── Audit Log Entry type ─── */
interface AuditEntry {
  id: number;
  action: string;
  tableName: string;
  recordId: string | null;
  userName: string | null;
  timestamp: string;
}

/* ─── Dashboard ─── */
interface DashboardProps {
  data: TransportData;
}

export default function Dashboard({ data }: DashboardProps) {
  const { navigateToPlatform, navigateToOperator } = useAdminNav();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  // Fetch recent audit log
  useEffect(() => {
    fetch('/api/admin/audit?limit=5')
      .then((r) => r.ok ? r.json() : [])
      .then(setAuditEntries)
      .catch(() => {});
  }, []);

  const totalTrains = useMemo(
    () => data.routes.reduce((sum, r) => sum + r.freq, 0),
    [data.routes]
  );

  const routeCount = data.routes.length;

  const topPlatforms = useMemo(() => getTopPlatforms(data.routes, 10), [data.routes]);
  const maxFreq = topPlatforms[0]?.freq || 1;

  const operatorComparison = useMemo(
    () => getOperatorComparison(data.routes, data.services),
    [data.routes, data.services]
  );
  const top5Operators = operatorComparison.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          value={data.platforms.length}
          label="Plateformes"
          color="text-blue"
          icon={<IconMapPin />}
        />
        <KPICard
          value={routeCount}
          label="Liaisons"
          color="text-purple"
          icon={<IconRoute />}
        />
        <KPICard
          value={totalTrains}
          label="Trains / semaine"
          color="text-cyan"
          icon={<IconTrain />}
        />
        <KPICard
          value={data.operators.length}
          label="Opérateurs actifs"
          color="text-orange"
          icon={<IconUsers />}
        />
        <KPICard
          value={data.services.length}
          label="Services"
          color="text-muted"
          icon={<IconCalendar />}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/plateformes"
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-blue/20 text-blue hover:bg-blue/5 transition-colors"
        >
          <IconMapPin />
          Gérer les plateformes
        </Link>
        <Link
          href="/admin/operateurs"
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-purple/20 text-purple hover:bg-purple/5 transition-colors"
        >
          <IconUsers />
          Gérer les opérateurs
        </Link>
        <Link
          href="/admin/utilisateurs"
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-orange/20 text-orange hover:bg-orange/5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Gérer les utilisateurs
        </Link>
      </div>

      {/* Two-column: Top 5 Operators + Top 10 Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Operators */}
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Top 5 opérateurs
            </h3>
            <Link href="/admin/operateurs" className="text-[10px] text-blue hover:text-cyan transition-colors">
              Voir tous →
            </Link>
          </div>
          <div className="space-y-3">
            {top5Operators.map(({ operator, stats }, index) => {
              const color = getOperatorColor(operator);
              const pct = totalTrains > 0
                ? Math.round((stats.trainsPerWeek / totalTrains) * 100)
                : 0;
              const logo = getOperatorLogo(operator);

              return (
                <button
                  key={operator}
                  onClick={() => navigateToOperator(operator)}
                  className="flex items-center gap-3 w-full text-left group hover:bg-blue/5 rounded-lg px-2 py-2 transition-colors"
                >
                  {/* Rank */}
                  <span className="text-[10px] font-mono text-muted w-4 text-right flex-shrink-0">
                    {index + 1}
                  </span>
                  {/* Logo or dot */}
                  {logo ? (
                    <img src={logo} alt="" className="w-6 h-6 rounded object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text group-hover:text-blue transition-colors truncate">
                        {operator}
                      </span>
                      <span className="text-[10px] font-mono text-cyan flex-shrink-0 ml-2">
                        {stats.trainsPerWeek} t/s
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-[9px] text-muted w-[30px] text-right">{pct}%</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-[9px] text-muted">
                      <span>{stats.platformCount} PF</span>
                      <span>{stats.routeCount} liaisons</span>
                      <span>{stats.serviceCount} services</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top 10 Platforms */}
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Top 10 plateformes par trafic
            </h3>
            <Link href="/admin/plateformes" className="text-[10px] text-blue hover:text-cyan transition-colors">
              Voir toutes →
            </Link>
          </div>
          <div className="space-y-1.5">
            {topPlatforms.map(({ site, freq }, index) => {
              const platform = data.platforms.find((p) => p.site === site);
              return (
                <button
                  key={site}
                  onClick={() => navigateToPlatform(site)}
                  className="flex items-center gap-2 w-full text-left group hover:bg-blue/5 rounded px-2 py-1.5 transition-colors"
                >
                  <span className="text-[10px] font-mono text-muted w-4 text-right flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text group-hover:text-cyan truncate font-medium">
                        {site}
                      </span>
                      {platform?.pays && platform.pays !== 'France' && platform.pays !== 'FR' && (
                        <span className="text-[8px] px-1 py-0 rounded bg-purple/10 text-purple flex-shrink-0">
                          {platform.pays}
                        </span>
                      )}
                    </div>
                    {platform?.ville && (
                      <div className="text-[9px] text-muted truncate">{platform.ville}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan/40 rounded-full transition-all"
                        style={{ width: `${(freq / maxFreq) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyan w-[45px] text-right">
                      {freq} t/s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-width: Operator Comparison Table + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operator Comparison Table */}
        <div className="glass-panel rounded-lg p-4 lg:col-span-2">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
            Comparatif complet des opérateurs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted border-b border-border">
                  <th className="text-left font-medium py-1.5 pr-2">Opérateur</th>
                  <th className="text-right font-medium py-1.5 px-2">PF</th>
                  <th className="text-right font-medium py-1.5 px-2">Liaisons</th>
                  <th className="text-right font-medium py-1.5 px-2">T/sem</th>
                  <th className="text-right font-medium py-1.5 px-2">Services</th>
                  <th className="text-right font-medium py-1.5 pl-2">Part réseau</th>
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
                      <td className="text-right py-1.5 px-2 font-mono text-muted">{stats.serviceCount}</td>
                      <td className="text-right py-1.5 pl-2">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
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

        {/* Recent Activity */}
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Activité récente
            </h3>
            <Link href="/admin/historique" className="text-[10px] text-blue hover:text-cyan transition-colors">
              Voir tout →
            </Link>
          </div>
          {auditEntries.length === 0 ? (
            <p className="text-[10px] text-muted italic">Aucune activité récente</p>
          ) : (
            <div className="space-y-2">
              {auditEntries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-blue/30 pl-3 py-1">
                  <div className="flex items-center gap-1.5">
                    <ActionBadge action={entry.action} />
                    <span className="text-[10px] text-text font-medium truncate">{entry.tableName}</span>
                  </div>
                  {entry.recordId && (
                    <div className="text-[9px] text-muted truncate mt-0.5">{entry.recordId}</div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted">
                    <span>{entry.userName || 'Système'}</span>
                    <span>{formatTimeAgo(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data info */}
      <div className="text-[10px] text-muted flex items-center gap-3">
        <span>Fichier : {data.fileName}</span>
        <span>Mis à jour : {new Date(data.uploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        {data.unmatchedPlatforms.length > 0 && (
          <span className="text-orange">{data.unmatchedPlatforms.length} plateformes non géocodées</span>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    create: 'bg-cyan/10 text-cyan',
    update: 'bg-blue/10 text-blue',
    delete: 'bg-orange/10 text-orange',
    import: 'bg-cyan/10 text-cyan',
    upload: 'bg-purple/10 text-purple',
  };
  const cls = colors[action] || 'bg-gray-100 text-muted';
  return (
    <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium uppercase ${cls}`}>
      {action}
    </span>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const t = new Date(timestamp).getTime();
  const diff = now - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
