'use client';

import { useMemo, useEffect, useState } from 'react';
import { TransportData } from '@/lib/types';
import { getTopPlatforms, getOperatorComparison } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorLogo } from '@/lib/operatorContacts';
import { useAdminNav } from '@/lib/useAdminNav';
import { analyzeDataQuality } from '@/lib/dataQuality';
import { exportPlatforms, exportRoutes, exportServices, exportSynthese } from '@/lib/exportCsv';
import Link from 'next/link';
import KPICard from './shared/KPICard';

/* ─── SVG Icons (20x20 for KPIs) ─── */
const IconMapPin20 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconRoute20 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />
  </svg>
);
const IconTrain20 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" /><path d="M8 19l-2 3" /><path d="M16 19l2 3" /><circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
  </svg>
);
const IconUsers20 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconCalendar20 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ─── Small icons (14-18px for section headers & quick actions) ─── */
const IconMapPin18 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconGroup18 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconUserPlus18 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const IconUpload18 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ─── Section header icons (14px) ─── */
const IconTrending14 = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12L5 3L8 8L12 2" />
  </svg>
);
const IconTable14 = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2" width="12" height="10" rx="1.5" />
    <path d="M1 5.5H13M1 8.5H13M5 5.5V12M9 5.5V12" />
  </svg>
);
const IconClock14 = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5.5" /><path d="M7 4V7L9 8.5" />
  </svg>
);
const IconShield14 = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1L2 3.5V6.5C2 9.5 4 12 7 13C10 12 12 9.5 12 6.5V3.5L7 1Z" />
    <path d="M5 7L6.5 8.5L9 5.5" />
  </svg>
);
const IconDownload14 = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2V9.5M7 9.5L4.5 7M7 9.5L9.5 7" /><path d="M2 9.5V11.5C2 12 2.45 12.5 3 12.5H11C11.55 12.5 12 12 12 11.5V9.5" />
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
  onImport?: () => void;
}

export default function Dashboard({ data, onImport }: DashboardProps) {
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

  const qualityIssues = useMemo(() => analyzeDataQuality(data), [data]);

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* ── Welcome Banner ── */}
      <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 gntc-gradient" />
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-display font-bold gntc-gradient bg-clip-text text-transparent">
              Administration
            </h1>
            <p className="text-xs text-muted mt-0.5">Vue d&apos;ensemble du réseau de transport combiné</p>
          </div>
          <div className="ml-auto text-right text-[10px] text-muted hidden sm:block">
            <div>Fichier : {data.fileName}</div>
            <div>Mis à jour : {new Date(data.uploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            {data.unmatchedPlatforms.length > 0 && (
              <div className="text-orange">{data.unmatchedPlatforms.length} plateformes non géocodées</div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPIs Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="border-l-4 border-blue rounded-lg">
          <KPICard value={data.platforms.length} label="Plateformes" color="text-blue" icon={<IconMapPin20 />} />
        </div>
        <div className="border-l-4 border-purple rounded-lg">
          <KPICard value={routeCount} label="Liaisons" color="text-purple" icon={<IconRoute20 />} />
        </div>
        <div className="border-l-4 border-cyan rounded-lg">
          <KPICard value={totalTrains} label="Trains / semaine" color="text-cyan" icon={<IconTrain20 />} />
        </div>
        <div className="border-l-4 border-orange rounded-lg">
          <KPICard value={data.operators.length} label="Opérateurs actifs" color="text-orange" icon={<IconUsers20 />} />
        </div>
        <div className="border-l-4 border-muted rounded-lg">
          <KPICard value={data.services.length} label="Services" color="text-muted" icon={<IconCalendar20 />} />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/admin/plateformes"
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-blue/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
              <IconMapPin18 />
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-blue transition-colors">
              Gérer les plateformes
            </h3>
          </div>
          <p className="text-[10px] text-muted">{data.platforms.length} sites enregistrés</p>
        </Link>

        <Link
          href="/admin/operateurs"
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-purple/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
              <IconGroup18 />
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-purple transition-colors">
              Gérer les opérateurs
            </h3>
          </div>
          <p className="text-[10px] text-muted">{data.operators.length} opérateurs actifs</p>
        </Link>

        <Link
          href="/admin/utilisateurs"
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-orange/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
              <IconUserPlus18 />
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-orange transition-colors">
              Gérer les utilisateurs
            </h3>
          </div>
          <p className="text-[10px] text-muted">Comptes et permissions</p>
        </Link>

        <button
          onClick={onImport}
          className="glass-panel rounded-xl p-5 group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-cyan/20 text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center text-cyan">
              <IconUpload18 />
            </div>
            <h3 className="text-xs font-display font-bold text-text group-hover:text-cyan transition-colors">
              Importer Excel
            </h3>
          </div>
          <p className="text-[10px] text-muted">Import de données complet</p>
        </button>
      </div>

      {/* ── Two-column: Top 5 Operators + Top 10 Platforms ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Operators */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <IconTrending14 />
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
                  <span className="text-[10px] font-mono text-muted w-4 text-right flex-shrink-0">
                    {index + 1}
                  </span>
                  {logo ? (
                    <img src={logo} alt="" className="w-6 h-6 rounded object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  )}
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
                      <div className="flex-1 h-2 bg-border/50 rounded-full overflow-hidden">
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
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <IconMapPin20 />
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
                    <div className="w-20 h-1.5 bg-border/50 rounded-full overflow-hidden">
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

      {/* ── Operator Comparison Table + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 lg:col-span-2">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <IconTable14 />
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
                          <div className="w-14 h-1.5 bg-border/50 rounded-full overflow-hidden">
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
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <IconClock14 />
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

      {/* ── Quality + Export ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Data Quality */}
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <IconShield14 />
            Qualité des données
          </h3>
          {qualityIssues.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-cyan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Aucun problème détecté
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {qualityIssues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs rounded px-2 py-1.5 ${
                  issue.severity === 'error' ? 'bg-orange/5' : issue.severity === 'warning' ? 'bg-yellow-500/5' : 'bg-blue/5'
                }`}>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium uppercase flex-shrink-0 mt-0.5 ${
                    issue.severity === 'error' ? 'bg-orange/10 text-orange' : issue.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-blue/10 text-blue'
                  }`}>
                    {issue.severity === 'error' ? 'Erreur' : issue.severity === 'warning' ? 'Alerte' : 'Info'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-text font-medium">{issue.message}</div>
                    {issue.details && <div className="text-[10px] text-muted mt-0.5 truncate">{issue.details}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 text-[10px] text-muted">
            {qualityIssues.filter((i) => i.severity === 'error').length} erreurs,{' '}
            {qualityIssues.filter((i) => i.severity === 'warning').length} alertes,{' '}
            {qualityIssues.filter((i) => i.severity === 'info').length} infos
          </div>
        </div>

        {/* Export */}
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <IconDownload14 />
            Export des données
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => exportSynthese(data)}
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border border-cyan/20 text-cyan hover:bg-cyan/5 transition-colors"
            >
              <IconExport />
              Synthèse complète
            </button>
            <button
              onClick={() => exportPlatforms(data.platforms)}
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border border-blue/20 text-blue hover:bg-blue/5 transition-colors"
            >
              <IconExport />
              Plateformes
            </button>
            <button
              onClick={() => exportRoutes(data.routes)}
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border border-purple/20 text-purple hover:bg-purple/5 transition-colors"
            >
              <IconExport />
              Liaisons
            </button>
            <button
              onClick={() => exportServices(data.services)}
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border border-orange/20 text-orange hover:bg-orange/5 transition-colors"
            >
              <IconExport />
              Services
            </button>
          </div>
          <p className="text-[9px] text-muted mt-2">Format CSV (séparateur point-virgule) compatible Excel</p>
        </div>
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

const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

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
