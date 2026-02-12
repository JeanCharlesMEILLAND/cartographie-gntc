'use client';

interface KPIBarProps {
  platformCount: number;
  routeCount: number;
  trainsPerWeek: number;
  operatorCount: number;
  selectedPlatform?: string | null;
}

function KPIItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider">{label}</span>
      <span className="text-xs sm:text-sm font-mono font-bold text-cyan">{value}</span>
    </div>
  );
}

export default function KPIBar({ platformCount, routeCount, trainsPerWeek, operatorCount, selectedPlatform }: KPIBarProps) {
  return (
    <div className="hidden sm:flex items-center gap-0.5">
      {selectedPlatform && (
        <>
          <div className="flex items-center px-2 py-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-text truncate max-w-[120px]">
              {selectedPlatform}
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
        </>
      )}
      <KPIItem label={selectedPlatform ? 'Destinations' : 'Sites'} value={platformCount} />
      <div className="w-px h-4 bg-border" />
      <KPIItem label="Liaisons" value={routeCount} />
      <div className="w-px h-4 bg-border" />
      <KPIItem label="Trains/sem" value={trainsPerWeek} />
      <div className="w-px h-4 bg-border" />
      <KPIItem label="Opérateurs" value={operatorCount} />
    </div>
  );
}
