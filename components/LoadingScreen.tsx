'use client';

interface LoadingScreenProps {
  progress: number;
  step: string;
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  progress,
  step,
  title = 'Transport Combiné',
  subtitle = 'OTC / GNTC',
}: LoadingScreenProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg">
      {/* Animated network graph */}
      <svg width="340" height="160" viewBox="0 0 340 160" fill="none" className="mb-6">
        {/* Track lines - draw themselves */}
        <path d="M 30,100 C 60,100 80,60 120,60" className="loading-track" stroke="#587bbd" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 120,60 C 160,60 180,100 220,100" className="loading-track loading-track-2" stroke="#587bbd" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 220,100 C 260,100 280,60 310,60" className="loading-track loading-track-3" stroke="#587bbd" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 120,60 L 170,30" className="loading-track loading-track-4" stroke="#587bbd" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M 220,100 L 260,130" className="loading-track loading-track-5" stroke="#8b6db5" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />

        {/* Platform nodes - pop in */}
        <circle cx="30" cy="100" r="0" fill="#7dc243" className="loading-node loading-node-1" />
        <circle cx="120" cy="60" r="0" fill="#7dc243" className="loading-node loading-node-2" />
        <circle cx="220" cy="100" r="0" fill="#7dc243" className="loading-node loading-node-3" />
        <circle cx="310" cy="60" r="0" fill="#7dc243" className="loading-node loading-node-4" />
        <circle cx="170" cy="30" r="0" fill="#8b6db5" className="loading-node loading-node-5" />
        <circle cx="260" cy="130" r="0" fill="#8b6db5" className="loading-node loading-node-6" />

        {/* Hub pulse on main node */}
        <circle cx="120" cy="60" r="4.5" fill="none" stroke="#7dc243" strokeWidth="1" className="loading-pulse" />
        <circle cx="220" cy="100" r="4.5" fill="none" stroke="#7dc243" strokeWidth="1" className="loading-pulse" style={{ animationDelay: '2s' }} />

        {/* Moving train dot */}
        <circle r="4" fill="#587bbd" stroke="#fff" strokeWidth="1.5" className="loading-train" />
      </svg>

      {/* Logo + Text */}
      <div className="text-center">
        <img src="/favicon-192x192.png" alt="" className="w-16 h-16 mx-auto mb-3 rounded-xl loading-title" />
        <h1 className="text-xl font-display font-bold gntc-gradient loading-title mb-1">
          {title}
        </h1>
        <p className="text-xs text-muted loading-subtitle">
          {subtitle}
        </p>
      </div>

      {/* Progress bar + percentage */}
      <div className="mt-6 w-52 loading-bar-container">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted">{step}</span>
          <span className="text-[11px] font-mono font-bold gntc-gradient">{progress}%</span>
        </div>
        <div className="w-full h-[4px] rounded-full bg-[rgba(88,123,189,0.12)] overflow-hidden">
          <div
            className="h-full rounded-full gntc-gradient-bg transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
