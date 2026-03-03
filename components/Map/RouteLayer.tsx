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

// Segment length per operator in pixels (visible at all zoom levels)
const SEG_LEN = 24;

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
      // Multi-operator: single fused multicolor line
      // Each operator gets alternating colored segments via dashArray + dashOffset
      const totalPattern = SEG_LEN * ops.length;

      for (let j = 0; j < ops.length; j++) {
        const color = getOperatorColor(ops[j]);
        const dashOffset = j * SEG_LEN;

        elements.push(
          <Polyline
            key={`${route.from}-${route.to}-${i}-op${j}`}
            positions={points}
            pathOptions={
              isSearchMatch
                ? {
                    color,
                    opacity: 1,
                    weight: weight + 2,
                    dashArray: `${SEG_LEN} ${totalPattern - SEG_LEN}`,
                    dashOffset: `${dashOffset}`,
                  }
                : {
                    color,
                    opacity: dimmed ? 0.08 : isConnected ? 1 : opacity,
                    weight: isConnected ? weight + 1.5 : dimmed ? 1 : weight,
                    dashArray: `${SEG_LEN} ${totalPattern - SEG_LEN}`,
                    dashOffset: `${dashOffset}`,
                  }
            }
          />
        );
      }
    }
  }

  return <>{elements}</>;
}
