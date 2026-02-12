'use client';

import { useMemo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { Service, Platform } from '@/lib/types';
import { dayTimeToMinutes, getTrainProgress, interpolateAlongPath } from '@/lib/trainClock';
import { getBezierPoints } from '@/lib/bezier';
import { getOperatorColor } from '@/lib/colors';

interface TrainMarkersProps {
  services: Service[];
  platforms: Platform[];
  railGeometries?: Record<string, [number, number][]>;
}

export default function TrainMarkers({ services, platforms, railGeometries }: TrainMarkersProps) {
  const { showClock, clockDay, clockTime } = useFilterStore();

  // Build platform lookup
  const platformMap = useMemo(() => {
    const m = new Map<string, Platform>();
    for (const p of platforms) m.set(p.site, p);
    return m;
  }, [platforms]);

  // Pre-compute departure/arrival minutes and path for each service
  const serviceData = useMemo(() => {
    return services.map((svc) => {
      const fromP = platformMap.get(svc.from);
      const toP = platformMap.get(svc.to);
      if (!fromP || !toP) return null;

      const depMin = dayTimeToMinutes(svc.dayDep, svc.timeDep);
      const arrMin = dayTimeToMinutes(svc.dayArr, svc.timeArr);

      // Get path (rail geometry or bezier)
      const key1 = `${svc.from}||${svc.to}`;
      const key2 = `${svc.to}||${svc.from}`;
      const railPoints = railGeometries?.[key1] || railGeometries?.[key2];

      let path: [number, number][];
      if (railPoints && railPoints.length > 0) {
        path = [...railPoints];
        // Snap endpoints to platform coords
        if (railGeometries?.[key1]) {
          path[0] = [fromP.lat, fromP.lon];
          path[path.length - 1] = [toP.lat, toP.lon];
        } else {
          // Reverse direction
          path[0] = [toP.lat, toP.lon];
          path[path.length - 1] = [fromP.lat, fromP.lon];
          path.reverse();
        }
      } else {
        path = getBezierPoints(fromP.lat, fromP.lon, toP.lat, toP.lon);
      }

      return { svc, depMin, arrMin, path };
    }).filter(Boolean) as { svc: Service; depMin: number; arrMin: number; path: [number, number][] }[];
  }, [services, platformMap, railGeometries]);

  // Compute active trains at current time
  const activeTrains = useMemo(() => {
    if (!showClock) return [];

    const dayIndex: Record<string, number> = { Lu: 0, Ma: 1, Me: 2, Je: 3, Ve: 4, Sa: 5, Di: 6 };
    const currentMinutes = (dayIndex[clockDay] ?? 0) * 24 * 60 + clockTime;

    const trains: { lat: number; lon: number; color: string; svc: Service }[] = [];

    for (const item of serviceData) {
      const progress = getTrainProgress(item.depMin, item.arrMin, currentMinutes);
      if (progress === null) continue;

      const [lat, lon] = interpolateAlongPath(item.path, progress);
      const color = getOperatorColor(item.svc.operator);
      trains.push({ lat, lon, color, svc: item.svc });
    }

    return trains;
  }, [showClock, clockDay, clockTime, serviceData]);

  if (!showClock || activeTrains.length === 0) return null;

  return (
    <>
      {activeTrains.map((train, i) => (
        <CircleMarker
          key={`train-${i}`}
          center={[train.lat, train.lon]}
          radius={5}
          pathOptions={{
            fillColor: train.color,
            color: '#ffffff',
            fillOpacity: 0.95,
            weight: 1.5,
            opacity: 0.9,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
            <div className="text-xs">
              <strong>{train.svc.operator}</strong>
              <br />
              {train.svc.from} → {train.svc.to}
              <br />
              <span className="font-mono">
                {train.svc.dayDep} {train.svc.timeDep} → {train.svc.dayArr} {train.svc.timeArr}
              </span>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
