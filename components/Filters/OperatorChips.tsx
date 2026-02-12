'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorLogo } from '@/lib/operatorContacts';
import clsx from 'clsx';

export default function OperatorChips() {
  const { allOperators, activeOperators, visibleOperators, selectedPlatformOperators, toggleOperator, selectAllOperators, clearOperators } =
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
      <div className="flex flex-wrap gap-1 max-h-[320px] overflow-y-auto pr-1">
        {allOperators.map((op) => {
          const active = activeOperators.has(op);
          const hasRoutes = visibleOperators.has(op);
          // When a platform is selected, highlight only operators serving it
          const servesSelected = selectedPlatformOperators
            ? selectedPlatformOperators.has(op)
            : true;
          const highlighted = hasRoutes && servesSelected;
          const color = getOperatorColor(op);
          return (
            <button
              key={op}
              onClick={() => toggleOperator(op)}
              className={clsx(
                'text-[11px] px-2 py-0.5 rounded-full border transition-all',
                active && highlighted
                  ? ''
                  : active && !highlighted
                    ? 'opacity-30'
                    : 'text-muted border-border opacity-40 hover:opacity-70'
              )}
              style={
                active
                  ? {
                      backgroundColor: highlighted ? `${color}22` : `${color}0a`,
                      borderColor: highlighted ? `${color}88` : `${color}33`,
                      color: highlighted ? color : `${color}66`,
                    }
                  : undefined
              }
            >
              {getOperatorLogo(op) && (
                <img src={getOperatorLogo(op)!} alt="" className="w-3.5 h-3.5 rounded-sm object-contain inline-block mr-1 -mt-px" />
              )}
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}
