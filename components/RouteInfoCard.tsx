'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { AggregatedRoute, Service } from '@/lib/types';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorLogo } from '@/lib/operatorContacts';
import clsx from 'clsx';

interface RouteInfoCardProps {
  routes: AggregatedRoute[];
  services: Service[];
}

const DAY_ORDER: Record<string, number> = { Lu: 1, Ma: 2, Me: 3, Je: 4, Ve: 5, Sa: 6, Di: 7 };

export default function RouteInfoCard({ routes, services }: RouteInfoCardProps) {
  const { selectedCorridor, setSelectedCorridor, setSelectedPlatform, showClock } = useFilterStore();
  const searchOpen = useSearchStore((s) => s.searchOpen);

  if (!selectedCorridor) return null;

  const { operators, platforms, freq } = selectedCorridor;

  // Find the actual routes that connect these platforms
  const corridorRoutes = routes.filter(
    (r) => platforms.includes(r.from) && platforms.includes(r.to)
  );

  // Build per-operator route details
  const operatorDetails = operators.map((op) => {
    const opRoutes = corridorRoutes.filter((r) => r.operators.includes(op));
    const pairs = opRoutes.map((r) => ({
      from: r.from,
      to: r.to,
      freq: r.freq,
      services: services
        .filter(
          (s) =>
            s.operator === op &&
            ((s.from === r.from && s.to === r.to) || (s.to === r.from && s.from === r.to))
        )
        .sort((a, b) => (DAY_ORDER[a.dayDep] || 8) - (DAY_ORDER[b.dayDep] || 8)),
    }));
    const totalFreq = pairs.reduce((sum, p) => sum + p.freq, 0);
    return { op, pairs, totalFreq };
  }).sort((a, b) => b.totalFreq - a.totalFreq);

  // Unique platform names for display
  const uniquePlatforms = [...new Set(platforms)];

  const bottomPx = showClock ? 90 : 16;
  const topReserve = 66;

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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-cyan/15 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan">
              <path d="M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h3.19M15 6h2.81A2 2 0 0120 8v8a2 2 0 01-2 2h-2" />
              <path d="M15 18H9" />
              <circle cx="7.5" cy="18" r="2" />
              <circle cx="16.5" cy="18" r="2" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-text">
              Liaison
            </h3>
            <p className="text-[10px] text-muted">
              {operators.length} opérateur{operators.length > 1 ? 's' : ''} · {freq} trains/sem
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedCorridor(null)}
          className="text-muted hover:text-text transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Platforms */}
        <div>
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1.5">Plateformes desservies</div>
          <div className="flex flex-wrap gap-1.5">
            {uniquePlatforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue/10 text-blue hover:bg-blue/20 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="flex-shrink-0 opacity-60">
                  <circle cx="5" cy="5" r="3" />
                </svg>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-4 py-2 border-t border-b border-border">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-cyan">{freq}</div>
            <div className="text-[10px] text-muted">trains/sem</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-blue">{corridorRoutes.length}</div>
            <div className="text-[10px] text-muted">liaison{corridorRoutes.length > 1 ? 's' : ''}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-purple">{operators.length}</div>
            <div className="text-[10px] text-muted">opérateur{operators.length > 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Operator details */}
        {operatorDetails.map(({ op, pairs, totalFreq }) => {
          const color = getOperatorColor(op);
          const logo = getOperatorLogo(op);
          return (
            <div key={op} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {logo ? (
                    <img src={logo} alt="" className="w-4 h-4 rounded-sm object-contain flex-shrink-0" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span className="text-xs font-semibold text-text">{op}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">{totalFreq} t/sem</span>
              </div>

              {/* Route pairs for this operator */}
              <div className="ml-4 space-y-1">
                {pairs.map((pair, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-1 text-text">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ color }} className="flex-shrink-0">
                          <path d="M2 1L6 4L2 7Z" />
                        </svg>
                        <span className="truncate">{pair.from}</span>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.2" className="flex-shrink-0 text-muted">
                          <path d="M1 4h10M8 1.5L11 4L8 6.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="truncate">{pair.to}</span>
                      </div>
                      <span className="font-mono text-cyan flex-shrink-0 ml-2">{pair.freq}/s</span>
                    </div>

                    {/* Service schedule */}
                    {pair.services.length > 0 && (
                      <div className="ml-3 mt-0.5 mb-1">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-muted">
                              <th className="text-left font-normal py-0.5 pr-1">Jour</th>
                              <th className="text-left font-normal py-0.5 pr-1">Départ</th>
                              <th className="text-left font-normal py-0.5 pr-1">Arrivée</th>
                              <th className="text-left font-normal py-0.5">MAD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pair.services.map((s, j) => (
                              <tr key={j} className="text-text">
                                <td className="py-0.5 pr-1 font-medium">{s.dayDep}</td>
                                <td className="py-0.5 pr-1 font-mono text-cyan">{s.timeDep || '—'}</td>
                                <td className="py-0.5 pr-1 font-medium">{s.dayArr}</td>
                                <td className="py-0.5 font-mono text-cyan">{s.timeArr || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
