'use client';

import { Fragment } from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { useSearchStore } from '@/store/useSearchStore';
import { getBezierPoints } from '@/lib/bezier';
import { getOperatorColor } from '@/lib/colors';

interface SearchRouteOverlayProps {
  railGeometries?: Record<string, [number, number][]>;
}

function getPoints(
  from: string,
  to: string,
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  railGeometries?: Record<string, [number, number][]>
): [number, number][] {
  const key1 = `${from}||${to}`;
  const key2 = `${to}||${from}`;
  const railPoints = railGeometries?.[key1] || railGeometries?.[key2];

  if (railPoints && railPoints.length > 0) {
    const points: [number, number][] = [...railPoints];
    // Snap endpoints to platform positions
    if (railGeometries?.[key1]) {
      points[0] = [fromLat, fromLon];
      points[points.length - 1] = [toLat, toLon];
    } else {
      points[0] = [toLat, toLon];
      points[points.length - 1] = [fromLat, fromLon];
    }
    return points;
  }

  return getBezierPoints(fromLat, fromLon, toLat, toLon);
}

export default function SearchRouteOverlay({ railGeometries }: SearchRouteOverlayProps) {
  const { results, highlightedRouteIndex } = useSearchStore();

  if (highlightedRouteIndex === null || !results[highlightedRouteIndex]) return null;

  const route = results[highlightedRouteIndex];

  return (
    <>
      {route.legs.map((leg, i) => {
        const color = getOperatorColor(leg.operator);
        const points = getPoints(
          leg.from, leg.to,
          leg.fromLat, leg.fromLon,
          leg.toLat, leg.toLon,
          railGeometries
        );

        return (
          <Fragment key={i}>
            {/* Glow outline */}
            <Polyline
              positions={points}
              pathOptions={{
                color,
                weight: 12,
                opacity: 0.2,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main solid line */}
            <Polyline
              positions={points}
              pathOptions={{
                color,
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* From marker */}
            <CircleMarker
              center={[leg.fromLat, leg.fromLon]}
              radius={10}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: '#fff',
                weight: 3,
                opacity: 1,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -12]} className="search-tooltip">
                {leg.from}
              </Tooltip>
            </CircleMarker>
            {/* To marker */}
            <CircleMarker
              center={[leg.toLat, leg.toLon]}
              radius={10}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: '#fff',
                weight: 3,
                opacity: 1,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -12]} className="search-tooltip">
                {leg.to}
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </>
  );
}
