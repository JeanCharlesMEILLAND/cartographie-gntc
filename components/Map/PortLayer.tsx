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
        const name = p['NomEntCommunPort'] || p['LbEntCommunPort'] || p['NomPort'] || p['name'] || `Port ${i + 1}`;
        const commune = p['CommunePort'] || p['Commune'] || '';
        const type = p['TypePort'] || p['type'] || '';

        return (
          <CircleMarker
            key={`port-${i}`}
            center={[coords[1], coords[0]]}
            radius={5}
            pathOptions={{
              fillColor: '#0D47A1',
              color: '#1565C0',
              fillOpacity: 0.85,
              weight: 1.5,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div className="text-xs" style={{ maxWidth: 220, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                <strong className="block truncate" style={{ maxWidth: 220 }}>{name}</strong>
                {commune && <div className="text-muted truncate">{commune}</div>}
                {type && <div className="text-[10px] text-muted">{type}</div>}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
