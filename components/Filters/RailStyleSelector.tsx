'use client';

import { useFilterStore } from '@/store/useFilterStore';

const STYLES = [
  { value: 'standard', label: 'Infrastructure' },
  { value: 'maxspeed', label: 'Vitesses max.' },
  { value: 'signals', label: 'Signalisation' },
  { value: 'electrification', label: 'Électrification' },
];

export default function RailStyleSelector() {
  const { railwayStyle, setRailwayStyle, showRailway } = useFilterStore();

  if (!showRailway) return null;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">
        Style réseau ferré
      </label>
      <select
        value={railwayStyle}
        onChange={(e) =>
          setRailwayStyle(
            e.target.value as 'standard' | 'maxspeed' | 'signals' | 'electrification'
          )
        }
        className="w-full bg-white border border-border text-text text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue"
      >
        {STYLES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
