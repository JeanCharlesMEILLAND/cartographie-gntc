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

/** Interpolate a point at a given distance along the path */
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

/** Split a path into colored segments for multiple operators.
 *  Each operator gets alternating solid-colored sub-polylines. */
function splitPathForOperators(
  points: [number, number][],
  numOperators: number
): [number, number][][] {
  // Compute cumulative distances (in geographic coords — units don't matter, just ratios)
  const cumDist = [0];
  for (let i = 1; i < points.length; i++) {
    const dlat = points[i][0] - points[i - 1][0];
    const dlon = points[i][1] - points[i - 1][1];
    cumDist.push(cumDist[i - 1] + Math.sqrt(dlat * dlat + dlon * dlon));
  }
  const totalDist = cumDist[cumDist.length - 1];
  if (totalDist === 0) return [points.map(p => [...p] as [number, number])];

  // Create enough segments so each operator appears multiple times
  const segsPerOp = 5;
  const totalSegs = numOperators * segsPerOp;
  const segLen = totalDist / totalSegs;

  const segments: [number, number][][] = [];

  for (let s = 0; s < totalSegs; s++) {
    const startDist = s * segLen;
    const endDist = (s + 1) * segLen;
    const seg: [number, number][] = [];

    // Start point (interpolated)
    seg.push(interpolateAt(points, cumDist, startDist));

    // Include all original points within this segment
    for (let i = 0; i < points.length; i++) {
      if (cumDist[i] > startDist && cumDist[i] < endDist) {
        seg.push(points[i]);
      }
    }

    // End point (interpolated)
    seg.push(interpolateAt(points, cumDist, endDist));
    segments.push(seg);
  }

  return segments;
}

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

  if (!showRoutes) return null;

  const elements: React.ReactNode[] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const routeKey = `${route.from}||${route.to}`;

    const isSearchMatch = searchPairs ? searchPairs.has(routeKey) : false;
    if (searchPairs && !isSearchMatch) continue;

    const points = getRoutePoints(route, railGeometries);
    const { weight, opacity } = getRouteWeight(route.freq);

    const isConnected = selectedPlatform
      ? route.from === selectedPlatform || route.to === selectedPlatform
      : false;
    const dimmed = selectedPlatform && !isConnected;

    const ops = route.operators;

    if (ops.length <= 1) {
      // Single operator: solid line
      const color = getOperatorColor(ops[0] || 'unknown');
      elements.push(
        <Polyline
          key={`${route.from}-${route.to}-${i}`}
          positions={points}
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
      // Multi-operator: split path into solid colored segments
      const segments = splitPathForOperators(points, ops.length);
      const multiWeight = Math.max(weight + 1, 4);
      const multiOpacity = Math.max(opacity, 0.85);

      for (let s = 0; s < segments.length; s++) {
        const opIndex = s % ops.length;
        const color = getOperatorColor(ops[opIndex]);

        elements.push(
          <Polyline
            key={`${route.from}-${route.to}-${i}-s${s}`}
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
