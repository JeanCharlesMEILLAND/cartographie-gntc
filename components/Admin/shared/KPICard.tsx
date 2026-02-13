import { ReactNode } from 'react';

export default function KPICard({ value, label, sublabel, color = 'text-cyan', icon }: {
  value: number | string;
  label: string;
  sublabel?: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="glass-panel rounded-lg p-4 min-w-[130px] flex items-start gap-3">
      {icon && (
        <div className={`${color} opacity-60 mt-0.5 flex-shrink-0`}>{icon}</div>
      )}
      <div>
        <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
        <div className="text-[10px] text-muted mt-0.5">{label}</div>
        {sublabel && <div className="text-[9px] text-muted/60">{sublabel}</div>}
      </div>
    </div>
  );
}
