'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';
import { fetchWaterwayData } from './WaterwayLayer';

const NATURE_COLORS: Record<string, string> = {
  'Fluvial': '#0D47A1',
  'Fluvio-maritime': '#1565C0',
  'Maritime': '#0277BD',
};

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
        const gestion = p['MnModeGestionPort'] || '';
        const zone = p['NomZonePortuaire'] || '';
        const hasCommerce = (() => {
          for (let j = 1; j <= 6; j++) {
            if (p[`MnActivitePortuaire_${j}`] === 'Commerce') return true;
          }
          return false;
        })();
        const fillColor = NATURE_COLORS[nature] || NATURE_COLORS['Maritime'];

        return (
          <CircleMarker
            key={`port-${p['CdPort'] || i}`}
            center={[coords[1], coords[0]]}
            radius={6}
            pathOptions={{
              fillColor,
              color: '#FFD54F',
              fillOpacity: 0.95,
              weight: 2,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs" style={{ maxWidth: 260, minWidth: 160 }}>
                {/* Port name */}
                <strong className="text-[13px] leading-tight block" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: 230 }}>
                  {name}
                </strong>

                {/* Commune */}
                {commune && (
                  <div className="text-[10px] opacity-70 mb-1">
                    {commune}
                  </div>
                )}

                {/* Nature badge */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {nature && (
                    <span
                      className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded font-medium text-white"
                      style={{ backgroundColor: fillColor }}
                    >
                      {nature}
                    </span>
                  )}
                  {hasCommerce && (
                    <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Commerce / Fret
                    </span>
                  )}
                </div>

                {/* Management + Zone */}
                {(gestion || zone) && (
                  <div className="border-t pt-1" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                    {gestion && gestion !== 'Inconnu' && (
                      <div className="text-[10px] opacity-60">
                        <span className="font-medium">Gestion</span> : {gestion}
                      </div>
                    )}
                    {zone && zone !== name && (
                      <div className="text-[10px] opacity-60">
                        <span className="font-medium">Zone</span> : {zone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
