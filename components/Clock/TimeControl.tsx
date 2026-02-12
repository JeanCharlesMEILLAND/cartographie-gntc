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

    // Sync immediately
    setClockTime(getCurrentTimeMinutes());

    const liveInterval = setInterval(() => {
      if (sliderInteracting.current) return;
      const store = useFilterStore.getState();
      if (!store.clockLive) return;
      store.setClockTime(getCurrentTimeMinutes());
      // Also update day if it changed (midnight)
      const currentDay = getCurrentDay();
      if (store.clockDay !== currentDay) {
        // Don't use setClockDay as it sets clockLive=false
        useFilterStore.setState({ clockDay: currentDay });
      }
    }, 30_000); // every 30 seconds

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

  // When user touches the slider, exit live mode
  const handleSliderChange = (value: number) => {
    sliderInteracting.current = true;
    useFilterStore.setState({ clockTime: value, clockLive: false, clockPlaying: false });
  };

  const handleSliderEnd = () => {
    sliderInteracting.current = false;
  };

  // When user changes day manually, exit live mode
  const handleDayChange = (day: string) => {
    setClockDay(day); // this already sets clockLive=false in the store
  };

  if (!showClock) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] glass-panel rounded-lg px-4 py-2.5 flex items-center gap-3 max-w-[720px] w-[95%] sm:w-auto">
      {/* Play/Pause (fast-forward) */}
      <button
        onClick={() => {
          setClockPlaying(!clockPlaying);
        }}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-border hover:border-blue/30 text-blue hover:text-cyan transition-colors"
        title={clockPlaying ? 'Pause' : 'Avance rapide'}
      >
        {clockPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="3" y="2" width="3" height="10" rx="0.5" />
            <rect x="8" y="2" width="3" height="10" rx="0.5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M2 1.5v11l5-5.5z" />
            <path d="M7 1.5v11l5-5.5z" />
          </svg>
        )}
      </button>

      {/* Day selector */}
      <div className="flex gap-0.5 flex-shrink-0">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => handleDayChange(d)}
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
              clockDay === d
                ? 'bg-blue text-white'
                : 'text-muted hover:text-text hover:bg-blue/5'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Time slider */}
      <div className="flex-1 min-w-[120px] flex items-center gap-2">
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
      <span className="font-mono text-sm font-bold text-text flex-shrink-0 w-[52px] text-center">
        {minutesToHHMM(clockTime)}
      </span>

      {/* Train count */}
      <span className="text-[10px] text-muted flex-shrink-0 hidden sm:block">
        <span className="font-mono font-bold text-cyan">{trainCount}</span> trains
      </span>

      {/* Live button */}
      <button
        onClick={handleLive}
        className={`flex items-center gap-1 text-[10px] font-medium transition-colors flex-shrink-0 px-1.5 py-0.5 rounded border ${
          clockLive
            ? 'border-red-400/50 bg-red-500/10 text-red-600'
            : 'border-border text-muted hover:text-blue hover:border-blue/30'
        }`}
        title="Temps réel"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${clockLive ? 'bg-red-500 animate-pulse' : 'bg-red-400/50'}`} />
        Live
      </button>

      {/* Close */}
      <button
        onClick={toggleClock}
        className="flex-shrink-0 text-muted hover:text-text transition-colors"
        title="Fermer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  );
}
