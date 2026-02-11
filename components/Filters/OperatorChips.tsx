'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { getOperatorColor } from '@/lib/colors';
import clsx from 'clsx';

export default function OperatorChips() {
  const { allOperators, activeOperators, toggleOperator, selectAllOperators, clearOperators } =
    useFilterStore();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          Opérateurs
        </label>
        <div className="flex gap-1">
          <button
            onClick={selectAllOperators}
            className="text-[10px] text-blue hover:text-cyan transition-colors"
          >
            Tous
          </button>
          <span className="text-[10px] text-muted">/</span>
          <button
            onClick={clearOperators}
            className="text-[10px] text-blue hover:text-cyan transition-colors"
          >
            Aucun
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto pr-1">
        {allOperators.map((op) => {
          const active = activeOperators.has(op);
          const color = getOperatorColor(op);
          return (
            <button
              key={op}
              onClick={() => toggleOperator(op)}
              className={clsx(
                'text-[11px] px-2 py-0.5 rounded-full border transition-all',
                active
                  ? 'text-white'
                  : 'text-muted border-border opacity-40 hover:opacity-70'
              )}
              style={
                active
                  ? {
                      backgroundColor: `${color}22`,
                      borderColor: `${color}88`,
                      color: color,
                    }
                  : undefined
              }
            >
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}
