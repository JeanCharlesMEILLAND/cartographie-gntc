'use client';

import { Fragment, useMemo } from 'react';
import L from 'leaflet';
import { Polyline, CircleMarker, Marker, Tooltip } from 'react-leaflet';
import { useSearchStore } from '@/store/useSearchStore';
import { getBezierPoints } from '@cartographie/shared/utils';
import { getOperatorColor } from '@/lib/colors';
import { haversineKm } from '@/lib/routeFinder';

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

const ROAD_COLOR = '#F59E0B'; // amber/orange for road segments
const ROAD_MIN_DISTANCE = 5; // km — don't show road segment if < 5km

/** Find midpoint of a polyline path */
function getMidpoint(positions: [number, number][]): [number, number] {
  if (positions.length === 0) return [0, 0];
  if (positions.length === 1) return positions[0];
  const mid = Math.floor(positions.length / 2);
  return positions[mid];
}

/** Truck icon for road segments */
function createTruckIcon() {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="
      width:28px;height:28px;
      background:#F59E0B;
      border:2px solid #fff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 3h15v13H1z"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg></div>`,
  });
}

export default function SearchRouteOverlay({ railGeometries }: SearchRouteOverlayProps) {
  const truckIcon = useMemo(() => createTruckIcon(), []);
  const { results, highlightedRouteIndex, roadRouting } = useSearchStore();

  if (highlightedRouteIndex === null || !results[highlightedRouteIndex]) return null;

  const route = results[highlightedRouteIndex];
  const firstLeg = route.legs[0];
  const lastLeg = route.legs[route.legs.length - 1];

  // Calculate road distances
  const preRoutingDist = roadRouting
    ? haversineKm(roadRouting.originLat, roadRouting.originLon, firstLeg.fromLat, firstLeg.fromLon)
    : 0;
  const postRoutingDist = roadRouting
    ? haversineKm(roadRouting.destLat, roadRouting.destLon, lastLeg.toLat, lastLeg.toLon)
    : 0;

  const showPreRouting = preRoutingDist > ROAD_MIN_DISTANCE;
  const showPostRouting = postRoutingDist > ROAD_MIN_DISTANCE;

  return (
    <>
      {/* Pre-routing: road from origin city to departure platform */}
      {showPreRouting && roadRouting && (() => {
        const prePositions: [number, number][] = roadRouting.preRouteGeometry && roadRouting.preRouteGeometry.length > 0
          ? roadRouting.preRouteGeometry
          : [[roadRouting.originLat, roadRouting.originLon], [firstLeg.fromLat, firstLeg.fromLon]];
        return (
          <Fragment>
            {/* Glow */}
            <Polyline
              positions={prePositions}
              pathOptions={{
                color: ROAD_COLOR,
                weight: 10,
                opacity: 0.15,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Dashed road line */}
            <Polyline
              positions={prePositions}
              pathOptions={{
                color: ROAD_COLOR,
                weight: 4,
                opacity: 0.9,
                dashArray: '10, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Truck icon at midpoint */}
            <Marker position={getMidpoint(prePositions)} icon={truckIcon} interactive={false} />
            {/* Origin city marker */}
            <CircleMarker
              center={[roadRouting.originLat, roadRouting.originLon]}
              radius={8}
              pathOptions={{
                fillColor: ROAD_COLOR,
                fillOpacity: 0.9,
                color: '#fff',
                weight: 3,
                opacity: 1,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]} className="search-tooltip">
                {roadRouting.originCity} ({Math.round(preRoutingDist)} km)
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })()}

      {/* Rail legs */}
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

      {/* Post-routing: road from arrival platform to destination city */}
      {showPostRouting && roadRouting && (() => {
        const postPositions: [number, number][] = roadRouting.postRouteGeometry && roadRouting.postRouteGeometry.length > 0
          ? roadRouting.postRouteGeometry
          : [[lastLeg.toLat, lastLeg.toLon], [roadRouting.destLat, roadRouting.destLon]];
        return (
          <Fragment>
            {/* Glow */}
            <Polyline
              positions={postPositions}
              pathOptions={{
                color: ROAD_COLOR,
                weight: 10,
                opacity: 0.15,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Dashed road line */}
            <Polyline
              positions={postPositions}
              pathOptions={{
                color: ROAD_COLOR,
                weight: 4,
                opacity: 0.9,
                dashArray: '10, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Truck icon at midpoint */}
            <Marker position={getMidpoint(postPositions)} icon={truckIcon} interactive={false} />
            {/* Destination city marker */}
            <CircleMarker
              center={[roadRouting.destLat, roadRouting.destLon]}
              radius={8}
              pathOptions={{
                fillColor: ROAD_COLOR,
                fillOpacity: 0.9,
                color: '#fff',
                weight: 3,
                opacity: 1,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]} className="search-tooltip">
                {roadRouting.destCity} ({Math.round(postRoutingDist)} km)
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })()}
    </>
  );
}
