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

function getRouteWeight(_freq: number) {
  return { weight: 3.5, opacity: 0.8 };
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

// ─── Platform-based trunk detection ────────────────────────────────────
// Instead of snapping coordinates to an arbitrary grid, we identify shared
// TRUNKS by detecting which known platforms each route passes near.
// Two routes sharing the same trunk (e.g. Lyon→Avignon) merge into one
// multicolored corridor with smooth original rail geometry.

/** Approximate distance in km (equirectangular — accurate enough for France) */
function approxDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const cosLat = Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  const dLon = (lon2 - lon1) * Math.PI / 180 * cosLat;
  return R * Math.sqrt(dLat * dLat + dLon * dLon);
}

// ── Union-Find for clustering nearby platforms into "metro areas" ──

class UnionFind {
  private parent = new Map<string, string>();

  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    let cur = x;
    while (cur !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: string, b: string) {
    this.parent.set(this.find(a), this.find(b));
  }
}

// ── Thresholds ──

const CLUSTER_RADIUS = 15; // km — merge platforms in the same metro area
const WAYPOINT_RADIUS = 8; // km — route must pass within this of a platform
const ENDPOINT_MARGIN = 3; // skip first/last N geometry points (avoid false positives near endpoints)

interface Corridor {
  points: [number, number][];
  operators: string[];
  freq: number;
  platforms: Set<string>;
  routePairs: Set<string>;
}

interface TrunkInfo {
  points: [number, number][];
  operators: Set<string>;
  freq: number;
  platforms: Set<string>;
  routePairs: Set<string>;
}

function buildCorridors(
  routes: AggregatedRoute[],
  railGeometries: Record<string, [number, number][]> | undefined,
  activeOperators: Set<string>
): Corridor[] {
  // ── Step 1: Extract all platforms from route endpoints ──
  const platMap = new Map<string, { lat: number; lon: number }>();
  for (const r of routes) {
    platMap.set(r.from, { lat: r.fromLat, lon: r.fromLon });
    platMap.set(r.to, { lat: r.toLat, lon: r.toLon });
  }
  const platList = Array.from(platMap.entries()).map(([name, pos]) => ({
    name, lat: pos.lat, lon: pos.lon,
  }));

  // ── Step 2: Cluster nearby platforms (e.g. Lyon-Vénissieux + Lyon-Guillotière) ──
  const uf = new UnionFind();
  for (let i = 0; i < platList.length; i++) {
    for (let j = i + 1; j < platList.length; j++) {
      if (approxDist(platList[i].lat, platList[i].lon, platList[j].lat, platList[j].lon) < CLUSTER_RADIUS) {
        uf.union(platList[i].name, platList[j].name);
      }
    }
  }

  // Build cluster → members map (for proximity detection)
  const clusterMembers = new Map<string, typeof platList>();
  for (const p of platList) {
    const c = uf.find(p.name);
    if (!clusterMembers.has(c)) clusterMembers.set(c, []);
    clusterMembers.get(c)!.push(p);
  }

  // ── Step 3 & 4: For each route, find waypoints and split into trunks ──
  const trunkMap = new Map<string, TrunkInfo>();

  for (const route of routes) {
    // Only include operators that are currently active in the sidebar
    const routeOps = route.operators.filter(op => activeOperators.has(op));
    if (routeOps.length === 0) continue;

    const points = getRoutePoints(route, railGeometries);
    const originCluster = uf.find(route.from);
    const destCluster = uf.find(route.to);
    const pairKey1 = `${route.from}||${route.to}`;
    const pairKey2 = `${route.to}||${route.from}`;

    // Find intermediate platform clusters this route's geometry passes near
    const waypoints: { cluster: string; pointIndex: number }[] = [];

    for (const [clusterId, members] of clusterMembers) {
      if (clusterId === originCluster || clusterId === destCluster) continue;

      let minDist = Infinity;
      let minIdx = -1;
      for (const member of members) {
        for (let i = ENDPOINT_MARGIN; i < points.length - ENDPOINT_MARGIN; i++) {
          const d = approxDist(points[i][0], points[i][1], member.lat, member.lon);
          if (d < minDist) {
            minDist = d;
            minIdx = i;
          }
        }
      }

      if (minDist < WAYPOINT_RADIUS) {
        waypoints.push({ cluster: clusterId, pointIndex: minIdx });
      }
    }

    // Sort by position along the route
    waypoints.sort((a, b) => a.pointIndex - b.pointIndex);

    // Remove waypoints too close together (within 5 geometry points)
    const filtered: typeof waypoints = [];
    for (const wp of waypoints) {
      if (filtered.length === 0 || wp.pointIndex - filtered[filtered.length - 1].pointIndex > 5) {
        filtered.push(wp);
      }
    }

    // Build stop list: origin → [intermediate waypoints] → destination
    const stops = [
      { cluster: originCluster, pointIndex: 0 },
      ...filtered,
      { cluster: destCluster, pointIndex: points.length - 1 },
    ];

    // Create trunk segments between consecutive stops
    for (let s = 0; s < stops.length - 1; s++) {
      const fromStop = stops[s];
      const toStop = stops[s + 1];

      // Ordered key so A→B and B→A match the same trunk
      const trunkKey = fromStop.cluster < toStop.cluster
        ? `${fromStop.cluster}||${toStop.cluster}`
        : `${toStop.cluster}||${fromStop.cluster}`;

      const segPoints = points.slice(fromStop.pointIndex, toStop.pointIndex + 1);
      if (segPoints.length < 2) continue;

      const existing = trunkMap.get(trunkKey);
      if (existing) {
        routeOps.forEach(op => existing.operators.add(op));
        existing.freq = Math.max(existing.freq, route.freq);
        existing.platforms.add(route.from);
        existing.platforms.add(route.to);
        existing.routePairs.add(pairKey1);
        existing.routePairs.add(pairKey2);
        // Keep the geometry with more detail
        if (segPoints.length > existing.points.length) {
          existing.points = segPoints;
        }
      } else {
        trunkMap.set(trunkKey, {
          points: segPoints,
          operators: new Set(routeOps),
          freq: route.freq,
          platforms: new Set([route.from, route.to]),
          routePairs: new Set([pairKey1, pairKey2]),
        });
      }
    }
  }

  // ── Step 5: Convert to corridors ──
  return Array.from(trunkMap.values()).map(trunk => ({
    points: trunk.points,
    operators: Array.from(trunk.operators),
    freq: trunk.freq,
    platforms: trunk.platforms,
    routePairs: trunk.routePairs,
  }));
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
  const { showRoutes, selectedPlatform, activeOperators, setSelectedCorridor } = useFilterStore();
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

    const handleClick = () => {
      setSelectedCorridor({
        operators: ops,
        platforms: Array.from(corridor.platforms),
        freq: corridor.freq,
      });
    };

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
          eventHandlers={{ click: handleClick }}
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
            eventHandlers={{ click: handleClick }}
          />
        );
      }
    }
  }

  return <>{elements}</>;
}
