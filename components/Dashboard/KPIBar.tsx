'use client';

interface KPIBarProps {
  platformCount: number;
  routeCount: number;
  trainsPerWeek: number;
  operatorCount: number;
}

function KPIItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <span className="text-[11px] text-muted uppercase tracking-wider">{label}</span>
      <span className="text-sm font-mono font-bold text-cyan">{value}</span>
    </div>
  );
}

export default function KPIBar({ platformCount, routeCount, trainsPerWeek, operatorCount }: KPIBarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <KPIItem label="Sites" value={platformCount} />
      <div className="w-px h-4 bg-border" />
      <KPIItem label="Liaisons" value={routeCount} />
      <div className="w-px h-4 bg-border" />
      <KPIItem label="Trains/sem" value={trainsPerWeek} />
      <div className="w-px h-4 bg-border" />
      <KPIItem label="Opérateurs" value={operatorCount} />
    </div>
  );
}
