'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';
import { fetchWaterwayData } from './WaterwayLayer';

export default function PortLayer() {
  const showPorts = useFilterStore((s) => s.showPorts);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showPorts || geoData) return;
    fetchWaterwayData().then((d) => {
      if (d?.ports) setGeoData(d.ports);
    });
  }, [showPorts, geoData]);

  if (!showPorts || !geoData) return null;

  return (
    <>
      {geoData.features.map((f, i) => {
        const geom = f.geometry;
        if (!geom || geom.type !== 'Point') return null;
        const coords = (geom as GeoJSON.Point).coordinates;
        const p = f.properties || {};
        const name = p['NomPort'] || `Port ${i + 1}`;
        const commune = p['LbCommune'] || '';
        const nature = p['MnNaturePort'] || '';
        // Collect activities
        const activities: string[] = [];
        for (let j = 1; j <= 6; j++) {
          const act = p[`MnActivitePortuaire_${j}`];
          if (act) activities.push(act);
        }

        return (
          <CircleMarker
            key={`port-${i}`}
            center={[coords[1], coords[0]]}
            radius={5}
            pathOptions={{
              fillColor: nature === 'Fluvial' ? '#0D47A1' : nature === 'Fluvio-maritime' ? '#1565C0' : '#0277BD',
              color: '#fff',
              fillOpacity: 0.85,
              weight: 1.5,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div className="text-xs" style={{ maxWidth: 240, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                <strong className="block" style={{ maxWidth: 240 }}>{name}</strong>
                {commune && <div className="text-muted">{commune}</div>}
                {nature && <div className="text-[10px] text-muted">{nature}</div>}
                {activities.length > 0 && (
                  <div className="text-[10px] text-muted">{activities.join(', ')}</div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
