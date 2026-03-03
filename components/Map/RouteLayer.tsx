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

// ─── Grid-based corridor merging with original geometry ────────────────
// Routes on the same physical rail corridor merge into one visual line.
// A ~5km grid is used ONLY for matching; the rendered polyline uses
// the original smooth BRouter geometry.

const GRID = 0.05; // ~5.5 km — merges parallel tracks in the same corridor

function gridCell(pt: [number, number]): string {
  const gLat = Math.round(pt[0] / GRID) * GRID;
  const gLon = Math.round(pt[1] / GRID) * GRID;
  return `${gLat.toFixed(3)},${gLon.toFixed(3)}`;
}

function orderedKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

interface EdgeInfo {
  loCell: string;
  hiCell: string;
  points: [number, number][]; // original BRouter geometry, loCell→hiCell direction
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
  railGeometries: Record<string, [number, number][]> | undefined,
  activeOperators: Set<string>
): Corridor[] {
  const edgeMap = new Map<string, EdgeInfo>();

  for (const route of routes) {
    const routeOps = route.operators.filter(op => activeOperators.has(op));
    if (routeOps.length === 0) continue;

    const rawPoints = getRoutePoints(route, railGeometries);
    const pairKey1 = `${route.from}||${route.to}`;
    const pairKey2 = `${route.to}||${route.from}`;

    // Walk through raw geometry, detect grid-cell transitions
    let lastCell = gridCell(rawPoints[0]);
    let segStart = 0;

    for (let i = 1; i < rawPoints.length; i++) {
      const cell = gridCell(rawPoints[i]);
      if (cell !== lastCell) {
        const ek = orderedKey(lastCell, cell);
        const lo = lastCell < cell ? lastCell : cell;
        const hi = lastCell < cell ? cell : lastCell;

        // Extract original sub-path, canonical direction lo→hi
        let seg = rawPoints.slice(segStart, i + 1);
        if (lastCell > cell) seg = [...seg].reverse();

        const existing = edgeMap.get(ek);
        if (existing) {
          routeOps.forEach(op => existing.ops.add(op));
          existing.freq = Math.max(existing.freq, route.freq);
          existing.platforms.add(route.from);
          existing.platforms.add(route.to);
          existing.routePairs.add(pairKey1);
          existing.routePairs.add(pairKey2);
          if (seg.length > existing.points.length) {
            existing.points = seg;
          }
        } else {
          edgeMap.set(ek, {
            loCell: lo,
            hiCell: hi,
            points: seg,
            ops: new Set(routeOps),
            freq: route.freq,
            platforms: new Set([route.from, route.to]),
            routePairs: new Set([pairKey1, pairKey2]),
          });
        }

        segStart = i;
        lastCell = cell;
      }
    }
  }

  // ── Group edges by operator set, then chain into corridors ──

  const byOps = new Map<string, EdgeInfo[]>();
  for (const edge of edgeMap.values()) {
    const opsKey = Array.from(edge.ops).sort().join('||');
    if (!byOps.has(opsKey)) byOps.set(opsKey, []);
    byOps.get(opsKey)!.push(edge);
  }

  const corridors: Corridor[] = [];

  for (const [opsKey, groupEdges] of byOps) {
    const ops = opsKey.split('||');

    // Adjacency: cell → [{ neighborCell, edgeIdx }]
    const adj = new Map<string, { neighborCell: string; edgeIdx: number }[]>();
    for (let i = 0; i < groupEdges.length; i++) {
      const e = groupEdges[i];
      if (!adj.has(e.loCell)) adj.set(e.loCell, []);
      adj.get(e.loCell)!.push({ neighborCell: e.hiCell, edgeIdx: i });
      if (!adj.has(e.hiCell)) adj.set(e.hiCell, []);
      adj.get(e.hiCell)!.push({ neighborCell: e.loCell, edgeIdx: i });
    }

    const visited = new Set<number>();

    for (let startIdx = 0; startIdx < groupEdges.length; startIdx++) {
      if (visited.has(startIdx)) continue;
      visited.add(startIdx);

      const se = groupEdges[startIdx];
      let maxFreq = se.freq;
      const allPlatforms = new Set(se.platforms);
      const allRoutePairs = new Set(se.routePairs);

      // Chain links: ordered list of { edgeIdx, fromCell, toCell }
      type Link = { edgeIdx: number; fromCell: string; toCell: string };
      const chain: Link[] = [
        { edgeIdx: startIdx, fromCell: se.loCell, toCell: se.hiCell },
      ];

      // Extend forward from hiCell
      let cur = se.hiCell;
      while (true) {
        const neighbors = (adj.get(cur) || []).filter(n => !visited.has(n.edgeIdx));
        if (neighbors.length === 0) break;
        const next = neighbors[0];
        visited.add(next.edgeIdx);
        const ne = groupEdges[next.edgeIdx];
        maxFreq = Math.max(maxFreq, ne.freq);
        ne.platforms.forEach(p => allPlatforms.add(p));
        ne.routePairs.forEach(p => allRoutePairs.add(p));
        chain.push({ edgeIdx: next.edgeIdx, fromCell: cur, toCell: next.neighborCell });
        cur = next.neighborCell;
      }

      // Extend backward from loCell
      cur = se.loCell;
      while (true) {
        const neighbors = (adj.get(cur) || []).filter(n => !visited.has(n.edgeIdx));
        if (neighbors.length === 0) break;
        const next = neighbors[0];
        visited.add(next.edgeIdx);
        const ne = groupEdges[next.edgeIdx];
        maxFreq = Math.max(maxFreq, ne.freq);
        ne.platforms.forEach(p => allPlatforms.add(p));
        ne.routePairs.forEach(p => allRoutePairs.add(p));
        // Prepend: traversal goes from next.neighborCell → cur
        chain.unshift({ edgeIdx: next.edgeIdx, fromCell: next.neighborCell, toCell: cur });
        cur = next.neighborCell;
      }

      // ── Assemble corridor geometry from original BRouter sub-paths ──
      const corridorPoints: [number, number][] = [];
      for (const link of chain) {
        const e = groupEdges[link.edgeIdx];
        // Geometry stored in loCell→hiCell direction.
        // Reverse if traversal goes hiCell→loCell.
        const needReverse = link.fromCell === e.hiCell;
        const pts = needReverse ? [...e.points].reverse() : e.points;

        if (corridorPoints.length > 0) {
          corridorPoints.push(...pts.slice(1)); // skip junction duplicate
        } else {
          corridorPoints.push(...pts);
        }
      }

      corridors.push({
        points: corridorPoints,
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
  const { showRoutes, selectedPlatform, activeOperators } = useFilterStore();
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
    () => buildCorridors(routes, railGeometries, activeOperators),
    [routes, railGeometries, activeOperators]
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
