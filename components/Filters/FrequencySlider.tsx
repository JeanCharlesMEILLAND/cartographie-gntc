'use client';

import { useFilterStore } from '@/store/useFilterStore';

export default function FrequencySlider() {
  const { minFrequency, setMinFrequency } = useFilterStore();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          Fréquence min.
        </label>
        <span className="text-xs font-mono text-cyan">{minFrequency}/sem</span>
      </div>
      <input
        type="range"
        min={0}
        max={50}
        step={1}
        value={minFrequency}
        onChange={(e) => setMinFrequency(Number(e.target.value))}
        className="w-full h-1.5 bg-[rgba(20,30,60,0.6)] rounded-lg appearance-none cursor-pointer accent-blue"
        style={{ direction: 'rtl' }}
      />
      <div className="flex justify-between text-[10px] text-muted">
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>
    </div>
  );
}
