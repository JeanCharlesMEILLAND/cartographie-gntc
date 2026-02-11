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
  const color = freq > 150 ? '#f59e42' : getOperatorColor(operator);

  if (freq > 150) return { weight: 4, color, opacity: 0.8 };
  if (freq > 80) return { weight: 3, color: getOperatorColor(operator), opacity: 0.6 };
  if (freq > 30) return { weight: 2.5, color: getOperatorColor(operator), opacity: 0.45 };
  if (freq > 10) return { weight: 1.8, color: getOperatorColor(operator), opacity: 0.3 };
  return { weight: 1.2, color: getOperatorColor(operator), opacity: 0.18 };
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
        const railPoints = railGeometries?.[key1] || railGeometries?.[key2];

        const points = railPoints || getBezierPoints(
          route.fromLat,
          route.fromLon,
          route.toLat,
          route.toLon
        );

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
