'use client';

import { useFilterStore } from '@/store/useFilterStore';

const TILES = [
  { value: 'carto-dark', label: 'CartoDB Dark' },
  { value: 'carto-light', label: 'CartoDB Positron' },
  { value: 'voyager', label: 'CartoDB Voyager' },
  { value: 'osm', label: 'OpenStreetMap' },
  { value: 'topo', label: 'OpenTopoMap' },
];

export default function TileSelector() {
  const { tileStyle, setTileStyle } = useFilterStore();

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">
        Fond de carte
      </label>
      <select
        value={tileStyle}
        onChange={(e) => setTileStyle(e.target.value)}
        className="w-full bg-[rgba(20,30,60,0.6)] border border-border text-text text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue"
      >
        {TILES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
