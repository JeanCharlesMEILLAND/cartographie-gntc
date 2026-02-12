export default function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[11px] bg-[rgba(10,15,30,0.6)] border border-border rounded px-2 py-1 text-text focus:outline-none focus:border-blue/50"
      >
        <option value="">Tous</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
