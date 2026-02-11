'use client';

import { useFilterStore } from '@/store/useFilterStore';
import clsx from 'clsx';

export default function RailBadge() {
  const showRailway = useFilterStore((s) => s.showRailway);
  const railwayStyle = useFilterStore((s) => s.railwayStyle);

  if (!showRailway) return null;

  const styleLabels: Record<string, string> = {
    standard: 'Infrastructure',
    maxspeed: 'Vitesses max.',
    signals: 'Signalisation',
    electrification: 'Électrification',
  };

  return (
    <div
      className={clsx(
        'absolute top-[60px] right-4 z-[1000] glass-panel rounded-md px-3 py-1.5',
        'flex items-center gap-2'
      )}
    >
      <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
      <span className="text-xs text-text">
        Réseau ferré : <span className="text-cyan font-medium">{styleLabels[railwayStyle]}</span>
      </span>
    </div>
  );
}
