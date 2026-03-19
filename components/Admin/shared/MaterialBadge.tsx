export default function MaterialBadge({ label, value }: { label: string; value: string }) {
  if (!value || value === 'Non' || value === 'Non communiqué' || value === 'non communiqué') return null;
  const isOui = value === 'Oui' || value === 'oui';
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-[rgba(56,217,245,0.1)] text-cyan border border-cyan/20">
      {label}{!isOui && `: ${value}`}
    </span>
  );
}

/** Compact dot indicator for table columns */
export function MaterialDot({ value }: { value: string }) {
  if (!value || value === 'Non' || value === 'Non communiqué' || value === 'non communiqué') {
    return <span className="text-[9px] text-muted/40">—</span>;
  }
  return (
    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title={value} />
  );
}
