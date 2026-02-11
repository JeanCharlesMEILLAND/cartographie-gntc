'use client';

export default function Legend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] glass-panel rounded-lg p-3">
      <h4 className="text-[10px] text-muted uppercase tracking-wider mb-2">
        Légende
      </h4>
      <div className="space-y-1.5">
        {/* Route intensity */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-5 h-[3px] rounded-full bg-orange flex-shrink-0" />
            <span className="text-muted">&gt;80 trains/sem</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-5 h-[2.5px] rounded-full bg-blue flex-shrink-0 opacity-65" />
            <span className="text-muted">31–80 trains/sem</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-5 h-[2px] rounded-full bg-blue flex-shrink-0 opacity-40" />
            <span className="text-muted">11–30 trains/sem</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-5 h-[1.5px] rounded-full bg-blue flex-shrink-0 opacity-20" />
            <span className="text-muted">1–10 trains/sem</span>
          </div>
        </div>

        <div className="border-t border-border pt-1.5 space-y-0.5">
          {/* Markers */}
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
            <span className="text-muted">Hub majeur (&gt;100/sem)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
