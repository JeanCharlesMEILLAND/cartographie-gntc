'use client';

import { Polyline } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { AggregatedRoute } from '@/lib/types';
import { getBezierPoints } from '@/lib/bezier';
import { getOperatorColor } from '@/lib/colors';

interface RouteLayerProps {
  routes: AggregatedRoute[];
}

function getRouteStyle(freq: number, operator: string) {
  const color = freq > 80 ? '#f59e42' : getOperatorColor(operator);

  if (freq > 80) return { weight: 4, color, opacity: 0.85 };
  if (freq > 30) return { weight: 3, color, opacity: 0.65 };
  if (freq > 10) return { weight: 2, color, opacity: 0.4 };
  return { weight: 1.2, color, opacity: 0.2 };
}

export default function RouteLayer({ routes }: RouteLayerProps) {
  const { showRoutes, animateFlux } = useFilterStore();

  if (!showRoutes) return null;

  return (
    <>
      {routes.map((route, i) => {
        const points = getBezierPoints(
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
