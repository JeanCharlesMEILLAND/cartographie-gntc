'use client';

import { useMemo, useState } from 'react';
import { AggregatedRoute } from '@/lib/types';
import { computeCO2Stats, formatCO2 } from '@/lib/co2';

interface CO2BadgeProps {
  routes: AggregatedRoute[];
}

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

export default function CO2Badge({ routes }: CO2BadgeProps) {
  const stats = useMemo(() => computeCO2Stats(routes), [routes]);
  const [expanded, setExpanded] = useState(false);

  if (routes.length === 0) return null;

  // Equivalences parlantes
  const treesEquiv = Math.round(stats.co2SavedPerYear / 0.025); // 1 arbre absorbe ~25kg CO2/an
  const parisNYFlights = Math.round(stats.co2SavedPerYear / 1.75); // ~1.75t CO2/vol Paris-NY AR
  const carsEquiv = Math.round(stats.co2SavedPerYear / 2.3); // voiture moyenne ~2.3t CO2/an
  const earthLaps = (stats.kmAvoidedPerYear / 40_075).toFixed(1); // km tour de la terre

  return (
    <div
      className="glass-panel rounded-md px-3 py-2 max-w-[220px] cursor-pointer transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
          <path d="M6 1C3.24 1 1 3.24 1 6s2.24 5 5 5 5-2.24 5-5S8.76 1 6 1z" stroke="#7dc243" strokeWidth="1" />
          <path d="M4 6.5L5.5 8L8 4.5" stroke="#7dc243" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-semibold text-text">Bilan environnemental</span>
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="none" className={`ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-muted" />
        </svg>
      </div>

      {/* KPIs principaux — toujours visibles */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted">CO2 évité/an</span>
          <span className="font-mono text-[11px] font-bold text-cyan">{formatCO2(stats.co2SavedPerYear)}t</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted">Camions évités/an</span>
          <span className="font-mono text-[11px] font-bold text-blue">{formatNum(stats.trucksAvoidedPerYear)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted">Diesel économisé/an</span>
          <span className="font-mono text-[11px] font-bold text-orange">{(stats.dieselSavedPerYear / 1_000_000).toFixed(1)}M L</span>
        </div>
      </div>

      {/* Détail — visible si expanded */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-1.5">
          {/* Détail hebdo */}
          <div className="space-y-1">
            <span className="text-[8px] text-muted uppercase tracking-wider">Par semaine</span>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted">CO2 évité</span>
              <span className="font-mono text-[10px] font-semibold text-text">{stats.co2SavedPerWeek.toFixed(1)}t</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted">Camions évités</span>
              <span className="font-mono text-[10px] font-semibold text-text">{formatNum(stats.trucksAvoidedPerWeek)}</span>
            </div>
          </div>

          {/* Km routiers */}
          <div className="space-y-1">
            <span className="text-[8px] text-muted uppercase tracking-wider">Distance</span>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted">Km routiers évités/an</span>
              <span className="font-mono text-[10px] font-semibold text-text">{formatNum(stats.kmAvoidedPerYear)} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted">Tours de la Terre</span>
              <span className="font-mono text-[10px] font-semibold text-text">{earthLaps}x</span>
            </div>
          </div>

          {/* Equivalences */}
          <div className="space-y-1">
            <span className="text-[8px] text-muted uppercase tracking-wider">Équivalences</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted">Voitures retirées 1 an</span>
              <span className="font-mono text-[10px] font-semibold text-text">{formatNum(carsEquiv)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted">Vols Paris-NY évités</span>
              <span className="font-mono text-[10px] font-semibold text-text">{formatNum(parisNYFlights)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted">Arbres équivalents</span>
              <span className="font-mono text-[10px] font-semibold text-text">{formatNum(treesEquiv)}</span>
            </div>
          </div>

          {/* Hypothèses */}
          <div className="pt-1.5 border-t border-border">
            <span className="text-[8px] text-muted uppercase tracking-wider">Hypothèses de calcul</span>
            <div className="mt-1 text-[8px] text-muted leading-relaxed space-y-0.5">
              <div>Rail : 5,4 g CO2/t-km (ADEME 2024, traction élec.)</div>
              <div>Route : 68 g CO2/t-km (ADEME 2024, PL 40t)</div>
              <div>Charge moyenne : 20t/UTI, 30 UTI/train</div>
              <div>Distance routière : +30% vs vol d&apos;oiseau</div>
              <div>1 arbre = 25 kg CO2/an absorbé</div>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {!expanded && (
        <div className="mt-1.5 text-[8px] text-muted/60 text-center">
          Cliquer pour détails
        </div>
      )}
    </div>
  );
}
