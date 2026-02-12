'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { AggregatedRoute, Platform } from '@/lib/types';
import { getBezierPoints } from '@/lib/bezier';
import { interpolateAlongPath } from '@/lib/trainClock';
import { getOperatorColor } from '@/lib/colors';

interface AnimatedFluxDotsProps {
  routes: AggregatedRoute[];
  platforms: Platform[];
  railGeometries?: Record<string, [number, number][]>;
}

interface DotData {
  routeIndex: number;
  operatorIndex: number;
  operator: string;
  from: string;
  to: string;
  freq: number;
  color: string;
  path: [number, number][];
  offset: number;     // [0..1] phase offset
  speed: number;      // cycle duration in ms
}

const BASE_CYCLE = 12000; // 12s for a full traversal at freq=1
const MAX_DOTS = 200; // Cap to prevent memory explosion with many routes

export default function AnimatedFluxDots({ routes, platforms, railGeometries }: AnimatedFluxDotsProps) {
  const animateFlux = useFilterStore((s) => s.animateFlux);
  const [progress, setProgress] = useState(0); // timestamp for animation

  // Build platform lookup
  const platformMap = useMemo(() => {
    const m = new Map<string, Platform>();
    for (const p of platforms) m.set(p.site, p);
    return m;
  }, [platforms]);

  // Pre-compute dot data for each route+operator combination
  const dots = useMemo<DotData[]>(() => {
    if (!animateFlux) return [];

    const result: DotData[] = [];

    for (let ri = 0; ri < routes.length; ri++) {
      const route = routes[ri];
      const fromP = platformMap.get(route.from);
      const toP = platformMap.get(route.to);
      if (!fromP || !toP) continue;

      // Get path
      const key1 = `${route.from}||${route.to}`;
      const key2 = `${route.to}||${route.from}`;
      const railPoints = railGeometries?.[key1] || railGeometries?.[key2];

      let path: [number, number][];
      if (railPoints && railPoints.length > 0) {
        path = [...railPoints];
        if (railGeometries?.[key1]) {
          path[0] = [fromP.lat, fromP.lon];
          path[path.length - 1] = [toP.lat, toP.lon];
        } else {
          path[0] = [toP.lat, toP.lon];
          path[path.length - 1] = [fromP.lat, fromP.lon];
          path.reverse();
        }
      } else {
        path = getBezierPoints(fromP.lat, fromP.lon, toP.lat, toP.lon);
      }

      // One dot per operator on this route
      const ops = route.operators;
      for (let oi = 0; oi < ops.length; oi++) {
        const op = ops[oi];
        // Speed: higher frequency = faster cycle
        const speed = BASE_CYCLE / (1 + Math.log(Math.max(route.freq, 1)) / 3);
        // Offset so operators don't overlap
        const offset = ops.length > 1 ? oi / ops.length : 0;

        result.push({
          routeIndex: ri,
          operatorIndex: oi,
          operator: op,
          from: route.from,
          to: route.to,
          freq: route.freq,
          color: getOperatorColor(op),
          path,
          offset,
          speed,
        });
      }
    }

    // Cap dots: keep highest-frequency routes first
    if (result.length > MAX_DOTS) {
      result.sort((a, b) => b.freq - a.freq);
      return result.slice(0, MAX_DOTS);
    }
    return result;
  }, [animateFlux, routes, platformMap, railGeometries]);

  // Animation loop
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!animateFlux || dots.length === 0) return;

    startRef.current = performance.now();

    function tick(now: number) {
      setProgress(now - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animateFlux, dots.length]);

  if (!animateFlux || dots.length === 0) return null;

  return (
    <>
      {dots.map((dot, i) => {
        // Compute progress [0..1] with ping-pong (go then return)
        const elapsed = progress;
        const phase = ((elapsed / dot.speed) + dot.offset) % 2;
        const t = phase <= 1 ? phase : 2 - phase; // ping-pong

        const [lat, lon] = interpolateAlongPath(dot.path, t);

        return (
          <CircleMarker
            key={`flux-${dot.routeIndex}-${dot.operatorIndex}`}
            center={[lat, lon]}
            radius={4}
            pathOptions={{
              fillColor: dot.color,
              color: '#ffffff',
              fillOpacity: 0.9,
              weight: 1.5,
              opacity: 0.8,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div className="text-xs">
                <strong>{dot.operator}</strong>
                <br />
                {dot.from} → {dot.to}
                <br />
                <span className="font-mono">{dot.freq} trains/sem</span>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
