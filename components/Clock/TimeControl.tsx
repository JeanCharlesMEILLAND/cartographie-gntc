'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { getCurrentDay, getCurrentTimeMinutes } from '@/lib/trainClock';

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

interface TimeControlProps {
  trainCount: number;
}

export default function TimeControl({ trainCount }: TimeControlProps) {
  const {
    showClock,
    clockDay,
    clockTime,
    clockPlaying,
    clockLive,
    toggleClock,
    setClockDay,
    setClockTime,
    setClockPlaying,
    setClockLive,
  } = useFilterStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sliderInteracting = useRef(false);

  // Live mode: update every 30s to match real time
  useEffect(() => {
    if (!showClock || !clockLive) return;
    setClockTime(getCurrentTimeMinutes());
    const liveInterval = setInterval(() => {
      if (sliderInteracting.current) return;
      const store = useFilterStore.getState();
      if (!store.clockLive) return;
      store.setClockTime(getCurrentTimeMinutes());
      const currentDay = getCurrentDay();
      if (store.clockDay !== currentDay) {
        useFilterStore.setState({ clockDay: currentDay });
      }
    }, 30_000);
    return () => clearInterval(liveInterval);
  }, [showClock, clockLive, setClockTime]);

  // Play/Pause animation (fast-forward mode)
  useEffect(() => {
    if (clockPlaying) {
      intervalRef.current = setInterval(() => {
        const store = useFilterStore.getState();
        let nextTime = store.clockTime + 1;
        let nextDay = store.clockDay;
        if (nextTime >= 1440) {
          nextTime = 0;
          const dayIdx = DAYS.indexOf(nextDay);
          nextDay = DAYS[(dayIdx + 1) % 7];
          useFilterStore.setState({ clockDay: nextDay });
        }
        store.setClockTime(nextTime);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockPlaying]);

  const handleLive = useCallback(() => {
    useFilterStore.setState({
      clockDay: getCurrentDay(),
      clockTime: getCurrentTimeMinutes(),
      clockLive: true,
      clockPlaying: false,
    });
  }, []);

  const handleSliderChange = (value: number) => {
    sliderInteracting.current = true;
    useFilterStore.setState({ clockTime: value, clockLive: false, clockPlaying: false });
  };

  const handleSliderEnd = () => {
    sliderInteracting.current = false;
  };

  const handleDayChange = (day: string) => {
    setClockDay(day);
  };

  if (!showClock) return null;

  return (
    <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[1001] glass-panel rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 sm:max-w-[720px] sm:w-auto">
      {/* Disclaimer */}
      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-orange">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] text-muted leading-tight">
          Simulation basée sur les horaires théoriques — ne reflète pas les retards ou annulations
        </span>
      </div>
      {/* Mobile: 2 rows / Desktop: 1 row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Row 1: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play/Pause */}
          <button
            onClick={() => setClockPlaying(!clockPlaying)}
            className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border border-border hover:border-blue/30 text-blue hover:text-cyan transition-colors"
            title={clockPlaying ? 'Pause' : 'Avance rapide'}
          >
            {clockPlaying ? (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                <rect x="3" y="2" width="3" height="10" rx="0.5" />
                <rect x="8" y="2" width="3" height="10" rx="0.5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 1.5v11l5-5.5z" />
                <path d="M7 1.5v11l5-5.5z" />
              </svg>
            )}
          </button>

          {/* Day selector */}
          <div className="flex gap-px sm:gap-0.5 flex-shrink-0">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => handleDayChange(d)}
                className={`px-1 sm:px-1.5 py-1 text-[9px] sm:text-[10px] font-medium rounded transition-colors min-w-[22px] sm:min-w-0 ${
                  clockDay === d
                    ? 'bg-blue text-white'
                    : 'text-muted hover:text-text hover:bg-blue/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Live button */}
          <button
            onClick={handleLive}
            className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-medium transition-colors flex-shrink-0 px-1.5 py-1 rounded border ${
              clockLive
                ? 'border-red-400/50 bg-red-500/10 text-red-600'
                : 'border-border text-muted hover:text-blue hover:border-blue/30'
            }`}
            title="Caler sur l'heure actuelle"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
              <circle cx="7" cy="7" r="5" />
              <path d="M7 4.5V7l2 1.5" />
            </svg>
            Maintenant
          </button>

          {/* Close */}
          <button
            onClick={toggleClock}
            className="flex-shrink-0 text-muted hover:text-text transition-colors ml-auto sm:ml-0"
            title="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>

        {/* Row 2: Slider + time + count */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          {/* Time slider */}
          <div className="flex-1 min-w-0 flex items-center">
            <input
              type="range"
              min={0}
              max={1439}
              value={clockTime}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              onMouseUp={handleSliderEnd}
              onTouchEnd={handleSliderEnd}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #587bbd ${(clockTime / 1439) * 100}%, #e2e5ea ${(clockTime / 1439) * 100}%)`,
              }}
            />
          </div>

          {/* Time display */}
          <span className="font-mono text-xs sm:text-sm font-bold text-text flex-shrink-0 w-[44px] sm:w-[52px] text-center">
            {minutesToHHMM(clockTime)}
          </span>

          {/* Train count */}
          <span className="text-[9px] sm:text-[10px] text-muted flex-shrink-0">
            <span className="font-mono font-bold text-cyan">{trainCount}</span> <span className="hidden sm:inline">trains</span>
          </span>
        </div>
      </div>
    </div>
  );
}
