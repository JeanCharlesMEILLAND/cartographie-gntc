'use client';

import { useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { AggregatedRoute } from '@/lib/types';
import { getBezierPoints } from '@/lib/bezier';
import { getOperatorColor } from '@/lib/colors';

interface RouteLayerProps {
  routes: AggregatedRoute[];
  railGeometries?: Record<string, [number, number][]>;
}

function getRouteStyle(freq: number, operator: string) {
  const color = getOperatorColor(operator);

  if (freq > 30) return { weight: 5, color, opacity: 0.9 };
  if (freq > 15) return { weight: 4, color, opacity: 0.85 };
  if (freq > 8) return { weight: 3.5, color, opacity: 0.75 };
  if (freq > 3) return { weight: 2.5, color, opacity: 0.65 };
  return { weight: 2, color, opacity: 0.5 };
}

export default function RouteLayer({ routes, railGeometries }: RouteLayerProps) {
  const { showRoutes, animateFlux, selectedPlatform } = useFilterStore();
  const { results, highlightedRouteIndex } = useSearchStore();

  // Build set of route pairs matching the search result
  const searchActive = highlightedRouteIndex !== null && results.length > 0;
  const searchPairs = useMemo(() => {
    if (!searchActive) return null;
    const pairs = new Set<string>();
    const route = results[highlightedRouteIndex!];
    if (route) {
      for (const leg of route.legs) {
        // Add both directions since AggregatedRoute can have from/to in either order
        pairs.add(`${leg.from}||${leg.to}`);
        pairs.add(`${leg.to}||${leg.from}`);
      }
    }
    return pairs;
  }, [searchActive, results, highlightedRouteIndex]);

  if (!showRoutes) return null;

  return (
    <>
      {routes.map((route, i) => {
        const routeKey = `${route.from}||${route.to}`;

        // In search mode: only show matching routes
        const isSearchMatch = searchPairs ? searchPairs.has(routeKey) : false;
        if (searchPairs && !isSearchMatch) return null;

        // Try rail geometry first (both key orders)
        const key1 = `${route.from}||${route.to}`;
        const key2 = `${route.to}||${route.from}`;
        const railPoints = railGeometries?.[key1] || railGeometries?.[key2];

        let points: [number, number][];
        if (railPoints && railPoints.length > 0) {
          points = [...railPoints];
          points[0] = [route.fromLat, route.fromLon];
          points[points.length - 1] = [route.toLat, route.toLon];
          if (!railGeometries?.[key1] && railGeometries?.[key2]) {
            points[0] = [route.toLat, route.toLon];
            points[points.length - 1] = [route.fromLat, route.fromLon];
          }
        } else {
          points = getBezierPoints(
            route.fromLat,
            route.fromLon,
            route.toLat,
            route.toLon
          );
        }

        const mainOp = route.operators[0] || 'unknown';
        const style = getRouteStyle(route.freq, mainOp);

        // In search mode: boost the matched route
        if (isSearchMatch) {
          return (
            <Polyline
              key={`${route.from}-${route.to}-${i}`}
              positions={points}
              pathOptions={{
                ...style,
                opacity: 1,
                weight: style.weight + 2,
              }}
            />
          );
        }

        // Normal mode: highlight connected routes when a platform is selected
        const isConnected = selectedPlatform
          ? route.from === selectedPlatform || route.to === selectedPlatform
          : false;
        const dimmed = selectedPlatform && !isConnected;

        return (
          <Polyline
            key={`${route.from}-${route.to}-${i}`}
            positions={points}
            pathOptions={{
              ...style,
              opacity: dimmed ? 0.08 : isConnected ? 1 : style.opacity,
              weight: isConnected ? style.weight + 1.5 : dimmed ? 1 : style.weight,
              dashArray: animateFlux ? '8 12' : undefined,
              className: animateFlux ? 'route-animated' : undefined,
            }}
          />
        );
      })}
    </>
  );
}
