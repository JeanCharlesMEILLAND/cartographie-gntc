export default function KPICard({ value, label, color = 'text-cyan' }: {
  value: number | string;
  label: string;
  color?: string;
}) {
  return (
    <div className="glass-panel rounded-lg p-4 text-center min-w-[120px]">
      <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted mt-1">{label}</div>
    </div>
  );
}
