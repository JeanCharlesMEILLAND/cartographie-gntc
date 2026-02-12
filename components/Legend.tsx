'use client';

import { useState } from 'react';

export default function Legend() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      {/* Toggle button */}
      <button
        onClick={() => setVisible(!visible)}
        className="glass-panel rounded-md px-2 py-1 text-[10px] text-muted hover:text-blue transition-colors mb-1 ml-auto block"
      >
        {visible ? 'Masquer légende' : 'Légende'}
      </button>

      {visible && (
        <div className="glass-panel rounded-lg p-3">
          <div className="space-y-1.5">
            {/* Route intensity */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-5 h-[3px] rounded-full bg-orange flex-shrink-0" />
                <span className="text-muted">&gt;30 trains/sem</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-5 h-[2.5px] rounded-full bg-blue flex-shrink-0 opacity-65" />
                <span className="text-muted">16–30 trains/sem</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-5 h-[2px] rounded-full bg-blue flex-shrink-0 opacity-50" />
                <span className="text-muted">9–15 trains/sem</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-5 h-[1.5px] rounded-full bg-blue flex-shrink-0 opacity-20" />
                <span className="text-muted">1–8 trains/sem</span>
              </div>
            </div>

            <div className="border-t border-border pt-1.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan flex-shrink-0 border border-cyan" />
                <span className="text-muted">Plateforme France</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2.5 h-2.5 rounded-full bg-purple flex-shrink-0 border border-purple" />
                <span className="text-muted">Plateforme étrangère</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="w-3 h-3 rounded-full bg-cyan flex-shrink-0 border border-cyan marker-hub" />
                <span className="text-muted">Hub majeur (&gt;30/sem)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
