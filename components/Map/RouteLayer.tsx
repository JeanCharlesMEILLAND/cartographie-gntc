'use client';

import { useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { AggregatedRoute } from '@/lib/types';
import { getBezierPoints } from '@cartographie/shared/utils';
import { getOperatorColor } from '@/lib/colors';

interface RouteLayerProps {
  routes: AggregatedRoute[];
  railGeometries?: Record<string, [number, number][]>;
}

function getRouteWeight(freq: number) {
  if (freq > 30) return { weight: 5, opacity: 0.9 };
  if (freq > 15) return { weight: 4, opacity: 0.85 };
  if (freq > 8) return { weight: 3.5, opacity: 0.75 };
  if (freq > 3) return { weight: 2.5, opacity: 0.65 };
  return { weight: 2, opacity: 0.5 };
}

function getRoutePoints(
  route: AggregatedRoute,
  railGeometries?: Record<string, [number, number][]>
): [number, number][] {
  const key1 = `${route.from}||${route.to}`;
  const key2 = `${route.to}||${route.from}`;
  const railPoints = railGeometries?.[key1] || railGeometries?.[key2];

  if (railPoints && railPoints.length > 0) {
    const points = [...railPoints] as [number, number][];
    points[0] = [route.fromLat, route.fromLon];
    points[points.length - 1] = [route.toLat, route.toLon];
    if (!railGeometries?.[key1] && railGeometries?.[key2]) {
      points[0] = [route.toLat, route.toLon];
      points[points.length - 1] = [route.fromLat, route.fromLon];
    }
    return points;
  }

  return getBezierPoints(route.fromLat, route.fromLon, route.toLat, route.toLon);
}

// ─── Grid-based corridor merging ────────────────────────────────────────
// Snap all route points to a ~5km grid so routes on the same rail corridor
// (even on parallel tracks) merge into a single visual line.

const GRID = 0.05; // ~5.5km grid cells

function snap(pt: [number, number]): [number, number] {
  return [
    Math.round(pt[0] / GRID) * GRID,
    Math.round(pt[1] / GRID) * GRID,
  ];
}

function gridKey(pt: [number, number]): string {
  const s = snap(pt);
  return `${s[0].toFixed(3)},${s[1].toFixed(3)}`;
}

/** Snap a full path to the grid, removing consecutive duplicates */
function snapPath(points: [number, number][]): [number, number][] {
  const result: [number, number][] = [];
  let lastKey = '';
  for (const pt of points) {
    const snapped = snap(pt);
    const key = `${snapped[0].toFixed(3)},${snapped[1].toFixed(3)}`;
    if (key !== lastKey) {
      result.push(snapped);
      lastKey = key;
    }
  }
  return result;
}

function makeEdgeKey(a: [number, number], b: [number, number]): string {
  const ka = gridKey(a), kb = gridKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

interface EdgeInfo {
  from: [number, number];
  to: [number, number];
  ops: Set<string>;
  freq: number;
  platforms: Set<string>;
  routePairs: Set<string>;
}

interface Corridor {
  points: [number, number][];
  operators: string[];
  freq: number;
  platforms: Set<string>;
  routePairs: Set<string>;
}

function buildCorridors(
  routes: AggregatedRoute[],
  railGeometries?: Record<string, [number, number][]>
): Corridor[] {
  const edgeMap = new Map<string, EdgeInfo>();

  for (const route of routes) {
    const rawPoints = getRoutePoints(route, railGeometries);
    const points = snapPath(rawPoints);
    const pairKey1 = `${route.from}||${route.to}`;
    const pairKey2 = `${route.to}||${route.from}`;

    for (let p = 0; p < points.length - 1; p++) {
      const key = makeEdgeKey(points[p], points[p + 1]);
      const existing = edgeMap.get(key);
      if (existing) {
        route.operators.forEach(op => existing.ops.add(op));
        existing.freq = Math.max(existing.freq, route.freq);
        existing.platforms.add(route.from);
        existing.platforms.add(route.to);
        existing.routePairs.add(pairKey1);
        existing.routePairs.add(pairKey2);
      } else {
        edgeMap.set(key, {
          from: points[p],
          to: points[p + 1],
          ops: new Set(route.operators),
          freq: route.freq,
          platforms: new Set([route.from, route.to]),
          routePairs: new Set([pairKey1, pairKey2]),
        });
      }
    }
  }

  // Group edges by operator set, then build chains
  const byOps = new Map<string, EdgeInfo[]>();
  for (const edge of edgeMap.values()) {
    const opsKey = Array.from(edge.ops).sort().join('||');
    if (!byOps.has(opsKey)) byOps.set(opsKey, []);
    byOps.get(opsKey)!.push(edge);
  }

  const corridors: Corridor[] = [];

  for (const [opsKey, groupEdges] of byOps) {
    const ops = opsKey.split('||');

    const adj = new Map<string, { node: string; pt: [number, number]; idx: number }[]>();
    for (let i = 0; i < groupEdges.length; i++) {
      const e = groupEdges[i];
      const fk = gridKey(e.from), tk = gridKey(e.to);
      if (!adj.has(fk)) adj.set(fk, []);
      adj.get(fk)!.push({ node: tk, pt: e.to, idx: i });
      if (!adj.has(tk)) adj.set(tk, []);
      adj.get(tk)!.push({ node: fk, pt: e.from, idx: i });
    }

    const visited = new Set<number>();

    for (let i = 0; i < groupEdges.length; i++) {
      if (visited.has(i)) continue;
      visited.add(i);

      const e = groupEdges[i];
      const fk = gridKey(e.from), tk = gridKey(e.to);
      let maxFreq = e.freq;
      const allPlatforms = new Set(e.platforms);
      const allRoutePairs = new Set(e.routePairs);

      const forward: [number, number][] = [];
      let cur = tk;
      while (true) {
        const neighbors = (adj.get(cur) || []).filter(n => !visited.has(n.idx));
        if (neighbors.length === 0) break;
        const next = neighbors[0];
        visited.add(next.idx);
        const ne = groupEdges[next.idx];
        maxFreq = Math.max(maxFreq, ne.freq);
        ne.platforms.forEach(p => allPlatforms.add(p));
        ne.routePairs.forEach(p => allRoutePairs.add(p));
        forward.push(next.pt);
        cur = next.node;
      }

      const backward: [number, number][] = [];
      cur = fk;
      while (true) {
        const neighbors = (adj.get(cur) || []).filter(n => !visited.has(n.idx));
        if (neighbors.length === 0) break;
        const next = neighbors[0];
        visited.add(next.idx);
        const ne = groupEdges[next.idx];
        maxFreq = Math.max(maxFreq, ne.freq);
        ne.platforms.forEach(p => allPlatforms.add(p));
        ne.routePairs.forEach(p => allRoutePairs.add(p));
        backward.push(next.pt);
        cur = next.node;
      }

      const chainPts: [number, number][] = [
        ...backward.reverse(),
        e.from,
        e.to,
        ...forward,
      ];

      corridors.push({
        points: chainPts,
        operators: ops,
        freq: maxFreq,
        platforms: allPlatforms,
        routePairs: allRoutePairs,
      });
    }
  }

  return corridors;
}

// ─── Path splitting for multicolor display ─────────────────────────────

function interpolateAt(
  points: [number, number][],
  cumDist: number[],
  target: number
): [number, number] {
  if (target <= 0) return points[0];
  const total = cumDist[cumDist.length - 1];
  if (target >= total) return points[points.length - 1];
  for (let i = 1; i < cumDist.length; i++) {
    if (cumDist[i] >= target) {
      const t = (target - cumDist[i - 1]) / (cumDist[i] - cumDist[i - 1]);
      return [
        points[i - 1][0] + t * (points[i][0] - points[i - 1][0]),
        points[i - 1][1] + t * (points[i][1] - points[i - 1][1]),
      ];
    }
  }
  return points[points.length - 1];
}

function splitPathForOperators(
  points: [number, number][],
  numOperators: number
): [number, number][][] {
  const cumDist = [0];
  for (let i = 1; i < points.length; i++) {
    const dlat = points[i][0] - points[i - 1][0];
    const dlon = points[i][1] - points[i - 1][1];
    cumDist.push(cumDist[i - 1] + Math.sqrt(dlat * dlat + dlon * dlon));
  }
  const totalDist = cumDist[cumDist.length - 1];
  if (totalDist === 0) return [points.map(p => [...p] as [number, number])];

  const segsPerOp = 5;
  const totalSegs = numOperators * segsPerOp;
  const segLen = totalDist / totalSegs;
  const segments: [number, number][][] = [];

  for (let s = 0; s < totalSegs; s++) {
    const startDist = s * segLen;
    const endDist = (s + 1) * segLen;
    const seg: [number, number][] = [];
    seg.push(interpolateAt(points, cumDist, startDist));
    for (let i = 0; i < points.length; i++) {
      if (cumDist[i] > startDist && cumDist[i] < endDist) {
        seg.push(points[i]);
      }
    }
    seg.push(interpolateAt(points, cumDist, endDist));
    segments.push(seg);
  }

  return segments;
}

// ─── Component ─────────────────────────────────────────────────────────

export default function RouteLayer({ routes, railGeometries }: RouteLayerProps) {
  const { showRoutes, selectedPlatform } = useFilterStore();
  const { results, highlightedRouteIndex } = useSearchStore();

  const searchActive = highlightedRouteIndex !== null && results.length > 0;
  const searchPairs = useMemo(() => {
    if (!searchActive) return null;
    const pairs = new Set<string>();
    const route = results[highlightedRouteIndex!];
    if (route) {
      for (const leg of route.legs) {
        pairs.add(`${leg.from}||${leg.to}`);
        pairs.add(`${leg.to}||${leg.from}`);
      }
    }
    return pairs;
  }, [searchActive, results, highlightedRouteIndex]);

  const corridors = useMemo(
    () => buildCorridors(routes, railGeometries),
    [routes, railGeometries]
  );

  if (!showRoutes) return null;

  const elements: React.ReactNode[] = [];

  for (let i = 0; i < corridors.length; i++) {
    const corridor = corridors[i];
    const { weight, opacity } = getRouteWeight(corridor.freq);

    const isSearchMatch = searchPairs
      ? [...corridor.routePairs].some(p => searchPairs.has(p))
      : false;
    if (searchPairs && !isSearchMatch) continue;

    const isConnected = selectedPlatform
      ? corridor.platforms.has(selectedPlatform)
      : false;
    const dimmed = selectedPlatform && !isConnected;

    const ops = corridor.operators;

    if (ops.length <= 1) {
      const color = getOperatorColor(ops[0] || 'unknown');
      elements.push(
        <Polyline
          key={`c${i}`}
          positions={corridor.points}
          pathOptions={
            isSearchMatch
              ? { color, opacity: 1, weight: weight + 2 }
              : {
                  color,
                  opacity: dimmed ? 0.08 : isConnected ? 1 : opacity,
                  weight: isConnected ? weight + 1.5 : dimmed ? 1 : weight,
                }
          }
        />
      );
    } else {
      const segments = splitPathForOperators(corridor.points, ops.length);
      const multiWeight = Math.max(weight + 1, 4);
      const multiOpacity = Math.max(opacity, 0.85);

      for (let s = 0; s < segments.length; s++) {
        const opIndex = s % ops.length;
        const color = getOperatorColor(ops[opIndex]);
        elements.push(
          <Polyline
            key={`c${i}-s${s}`}
            positions={segments[s]}
            pathOptions={
              isSearchMatch
                ? { color, opacity: 1, weight: multiWeight + 2 }
                : {
                    color,
                    opacity: dimmed ? 0.08 : isConnected ? 1 : multiOpacity,
                    weight: isConnected ? multiWeight + 1.5 : dimmed ? 1 : multiWeight,
                  }
            }
          />
        );
      }
    }
  }

  return <>{elements}</>;
}
