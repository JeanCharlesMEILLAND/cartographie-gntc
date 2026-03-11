'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { Platform, AggregatedRoute, Service } from '@/lib/types';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorContact, hasContact, getOperatorLogo } from '@/lib/operatorContacts';
import clsx from 'clsx';

interface InfoCardProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
  services: Service[];
}

const DAY_ORDER: Record<string, number> = { Lu: 1, Ma: 2, Me: 3, Je: 4, Ve: 5, Sa: 6, Di: 7 };

function MaterialBadge({ label, value }: { label: string; value: string }) {
  if (!value || value === 'Non' || value === 'Non communiqué' || value === 'non communiqué') return null;
  const isOui = value === 'Oui';
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-[rgba(56,217,245,0.1)] text-cyan border border-cyan/20">
      {label}{!isOui && `: ${value}`}
    </span>
  );
}

export default function InfoCard({ platforms, routes, services }: InfoCardProps) {
  const { selectedPlatform, setSelectedPlatform, showClock } = useFilterStore();
  const searchOpen = useSearchStore((s) => s.searchOpen);
  const [expandedDest, setExpandedDest] = useState<string | null>(null);
  const [contactModal, setContactModal] = useState<string | null>(null);

  if (!selectedPlatform) return null;

  const platform = platforms.find((p) => p.site === selectedPlatform);
  if (!platform) return null;

  // Find connected routes
  const connected = routes.filter(
    (r) => r.from === selectedPlatform || r.to === selectedPlatform
  );

  const totalFreq = connected.reduce((sum, r) => sum + r.freq, 0);

  // Services for this platform
  const platformServices = services.filter(
    (s) => s.from === selectedPlatform || s.to === selectedPlatform
  );

  // Build per-operator breakdown with service details
  const operatorMap = new Map<string, { dest: string; freq: number; services: Service[] }[]>();
  for (const r of connected) {
    const dest = r.from === selectedPlatform ? r.to : r.from;
    for (const op of r.operators) {
      if (!operatorMap.has(op)) operatorMap.set(op, []);
      // Find services for this operator+destination
      const destServices = platformServices.filter(
        (s) =>
          s.operator === op &&
          ((s.from === selectedPlatform && s.to === dest) ||
            (s.to === selectedPlatform && s.from === dest))
      ).sort((a, b) => (DAY_ORDER[a.dayDep] || 8) - (DAY_ORDER[b.dayDep] || 8));

      operatorMap.get(op)!.push({ dest, freq: r.freq, services: destServices });
    }
  }

  // Sort operators by total frequency
  const operatorEntries = [...operatorMap.entries()]
    .map(([op, dests]) => ({
      op,
      dests: dests.sort((a, b) => b.freq - a.freq),
      total: dests.reduce((s, d) => s + d.freq, 0),
    }))
    .sort((a, b) => b.total - a.total);

  // Keep card fully visible between header (58px) and bottom edge
  const bottomPx = showClock ? 90 : 16;
  const topReserve = 66; // header + gap

  return (
    <div
      className={clsx(
        'fixed left-4 right-4 z-[1000] glass-panel rounded-lg w-auto overflow-y-auto',
        showClock ? 'bottom-[90px] sm:bottom-4' : 'bottom-4',
        searchOpen
          ? 'sm:right-auto sm:left-4 sm:w-[380px]'
          : 'sm:left-auto sm:right-[76px] sm:w-[380px]'
      )}
      style={{
        maxHeight: `calc(100dvh - ${topReserve + bottomPx}px)`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b border-border sticky top-0 glass-panel z-10">
        <div>
          <h3 className="text-sm font-display font-semibold text-text">
            {platform.site}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {platform.ville}{platform.pays ? ` — ${platform.pays}` : ''}
          </p>
        </div>
        <button
          onClick={() => setSelectedPlatform(null)}
          className="text-muted hover:text-text transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted">Exploitant</span>
            <div className="text-text font-medium">{platform.exploitant || '—'}</div>
          </div>
          <div>
            <span className="text-muted">Groupe</span>
            <div className="text-text font-medium">{platform.groupe || '—'}</div>
          </div>
          <div>
            <span className="text-muted">Département</span>
            <div className="text-text font-medium">{platform.departement || '—'}</div>
          </div>
          <div>
            <span className="text-muted">Chantier SNCF</span>
            <div className="text-text font-medium">{platform.chantierSNCF ? 'Oui' : 'Non'}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-3 py-2 border-t border-b border-border">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-cyan">{totalFreq}</div>
            <div className="text-[10px] text-muted">trains/sem</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-blue">{connected.length}</div>
            <div className="text-[10px] text-muted">liaisons</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-purple">{operatorEntries.length}</div>
            <div className="text-[10px] text-muted">opérateurs</div>
          </div>
        </div>

        {/* Operators with their destinations */}
        {operatorEntries.map(({ op, dests, total }) => {
          const color = getOperatorColor(op);
          return (
            <div key={op} className="space-y-1">
              {/* Operator header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getOperatorLogo(op) ? (
                    <img src={getOperatorLogo(op)!} alt="" className="w-4 h-4 rounded-sm object-contain flex-shrink-0" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span className="text-xs font-semibold text-text">{op}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">{total} t/sem</span>
              </div>

              {/* Contact info button */}
              {hasContact(op) && (
                <div className="ml-4">
                  <button
                    onClick={() => setContactModal(contactModal === op ? null : op)}
                    className="inline-flex items-center gap-1 text-[10px] text-blue hover:text-cyan transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                      <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <circle cx="6" cy="4" r="0.6" fill="currentColor" />
                    </svg>
                    Fiche contact
                  </button>
                </div>
              )}

              {/* Destinations for this operator */}
              <div className="ml-4 space-y-0.5">
                {dests.map((d, i) => {
                  const destKey = `${op}||${d.dest}`;
                  const isExpanded = expandedDest === destKey;
                  return (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedDest(isExpanded ? null : destKey)}
                        className="flex items-center justify-between text-xs py-1 px-1.5 w-full text-left rounded hover:bg-blue/8 transition-colors"
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <svg
                            width="8" height="8" viewBox="0 0 8 8"
                            className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="currentColor"
                            style={{ color: color }}
                          >
                            <path d="M2 1L6 4L2 7Z" />
                          </svg>
                          <span className="text-text truncate">vers {d.dest}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span className="font-mono text-cyan">{d.freq}/s</span>
                          <span className="text-[9px] text-muted">{d.services.length} départs</span>
                        </div>
                      </button>

                      {/* Expanded: schedule + material */}
                      {isExpanded && d.services.length > 0 && (
                        <div className="ml-3 mt-1 mb-2 space-y-1.5">
                          {/* Schedule table */}
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-muted">
                                <th className="text-left font-normal py-0.5 pr-1">Départ</th>
                                <th className="text-left font-normal py-0.5 pr-1">HLR</th>
                                <th className="text-left font-normal py-0.5 pr-1">Arrivée</th>
                                <th className="text-left font-normal py-0.5">MAD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {d.services.map((s, j) => (
                                <tr key={j} className="text-text">
                                  <td className="py-0.5 pr-1 font-medium">{s.dayDep}</td>
                                  <td className="py-0.5 pr-1 font-mono text-cyan">{s.timeDep || '—'}</td>
                                  <td className="py-0.5 pr-1 font-medium">{s.dayArr}</td>
                                  <td className="py-0.5 font-mono text-cyan">{s.timeArr || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Material accepted */}
                          {d.services[0] && (
                            <div className="flex flex-wrap gap-1">
                              <MaterialBadge label="CM" value={d.services[0].acceptsCM} />
                              <MaterialBadge label="Cont." value={d.services[0].acceptsCont} />
                              <MaterialBadge label="Semi préh." value={d.services[0].acceptsSemiPre} />
                              <MaterialBadge label="Semi non-préh." value={d.services[0].acceptsSemiNon} />
                              <MaterialBadge label="P400" value={d.services[0].acceptsP400} />
                            </div>
                          )}

                          {/* Navigate button */}
                          <button
                            onClick={() => setSelectedPlatform(d.dest)}
                            className="text-[10px] text-blue hover:text-cyan transition-colors mt-0.5"
                          >
                            Voir {d.dest} →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operator contact modal */}
      {contactModal && hasContact(contactModal) && (() => {
        const c = getOperatorContact(contactModal)!;
        const logo = getOperatorLogo(contactModal);
        const color = getOperatorColor(contactModal);
        return (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setContactModal(null)} />
            <div className="relative glass-panel rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
              {/* Header with logo */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img src={logo} alt="" className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white/10 p-1" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: color + '20', border: `2px solid ${color}` }}
                      >
                        <span className="text-sm font-bold" style={{ color }}>{contactModal[0]}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-display font-bold text-text">{contactModal}</h3>
                      <p className="text-[10px] text-muted">Source : gntc.fr/plan-de-transport</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setContactModal(null)}
                    className="text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-white/5"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contact details */}
              <div className="p-4 space-y-3">
                {c.contact && (
                  <div className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5 text-muted">
                      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2.5 12.5C2.5 10 4.5 8 7 8C9.5 8 11.5 10 11.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider">Contact</div>
                      <div className="text-xs text-text font-medium">{c.contact}</div>
                    </div>
                  </div>
                )}

                {c.address && (
                  <div className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5 text-muted">
                      <path d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6C2.5 9.5 7 12.5 7 12.5C7 12.5 11.5 9.5 11.5 6C11.5 3.5 9.5 1.5 7 1.5Z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider">Adresse</div>
                      <div className="text-xs text-text">{c.address}</div>
                    </div>
                  </div>
                )}

                {c.email && (
                  <div className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5 text-muted">
                      <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M1.5 4.5L7 8L12.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider">Email</div>
                      <a href={`mailto:${c.email}`} className="text-xs text-blue hover:text-cyan transition-colors break-all">
                        {c.email}
                      </a>
                    </div>
                  </div>
                )}

                {c.phone && (
                  <div className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5 text-muted">
                      <path d="M2.5 2H5L6.5 5L4.5 6.5C5.4 8.3 5.7 8.6 7.5 9.5L9 7.5L12 9V11.5C12 12.05 11.55 12.5 11 12.5C5.5 12 2 8.5 1.5 3C1.5 2.45 1.95 2 2.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider">Téléphone</div>
                      <a href={`tel:${c.phone.replace(/[\s().]/g, '')}`} className="text-xs text-blue hover:text-cyan transition-colors">
                        {c.phone}
                      </a>
                    </div>
                  </div>
                )}

                {c.website && (
                  <div className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5 text-muted">
                      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2 7H12M7 2C5.5 4 5.5 10 7 12M7 2C8.5 4 8.5 10 7 12" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider">Site web</div>
                      <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue hover:text-cyan transition-colors">
                        {c.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
