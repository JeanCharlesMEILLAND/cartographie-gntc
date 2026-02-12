'use client';

import { Polyline } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { AggregatedRoute } from '@/lib/types';
import { getBezierPoints } from '@/lib/bezier';
import { getOperatorColor } from '@/lib/colors';

interface RouteLayerProps {
  routes: AggregatedRoute[];
  railGeometries?: Record<string, [number, number][]>;
}

function getRouteStyle(freq: number, operator: string) {
  const color = freq > 30 ? '#f59e42' : getOperatorColor(operator);

  if (freq > 30) return { weight: 5, color, opacity: 0.9 };
  if (freq > 15) return { weight: 4, color: getOperatorColor(operator), opacity: 0.85 };
  if (freq > 8) return { weight: 3.5, color: getOperatorColor(operator), opacity: 0.75 };
  if (freq > 3) return { weight: 2.5, color: getOperatorColor(operator), opacity: 0.65 };
  return { weight: 2, color: getOperatorColor(operator), opacity: 0.5 };
}

export default function RouteLayer({ routes, railGeometries }: RouteLayerProps) {
  const { showRoutes, animateFlux } = useFilterStore();

  if (!showRoutes) return null;

  return (
    <>
      {routes.map((route, i) => {
        // Try rail geometry first (both key orders)
        const key1 = `${route.from}||${route.to}`;
        const key2 = `${route.to}||${route.from}`;
        let railPoints = railGeometries?.[key1] || railGeometries?.[key2];

        let points: [number, number][];
        if (railPoints && railPoints.length > 0) {
          // Snap first/last points to the platform marker positions
          // so the route visually connects to the blue dot
          points = [...railPoints];
          points[0] = [route.fromLat, route.fromLon];
          points[points.length - 1] = [route.toLat, route.toLon];
          // If key2 matched, the direction is reversed
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

        return (
          <Polyline
            key={`${route.from}-${route.to}-${i}`}
            positions={points}
            pathOptions={{
              ...style,
              dashArray: animateFlux ? '8 12' : undefined,
              className: animateFlux ? 'route-animated' : undefined,
            }}
          />
        );
      })}
    </>
  );
}
