'use client';

import { useFilterStore } from '@/store/useFilterStore';

const options = [
  { value: 'all', label: 'Tous les pays' },
  { value: 'france', label: 'France uniquement' },
  { value: 'international', label: 'International' },
] as const;

export default function CountryFilter() {
  const { country, setCountry } = useFilterStore();

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">
        Pays
      </label>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value as 'all' | 'france' | 'international')}
        className="w-full bg-white border border-border text-text text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
