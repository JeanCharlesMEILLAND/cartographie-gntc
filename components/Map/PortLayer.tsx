'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';
import { fetchWaterwayData } from './WaterwayLayer';

// Nature badge colors
const NATURE_STYLES: Record<string, { fill: string; label: string; icon: string }> = {
  'Fluvial': { fill: '#0D47A1', label: 'Fluvial', icon: '~' },
  'Fluvio-maritime': { fill: '#1565C0', label: 'Fluvio-maritime', icon: '~' },
  'Maritime': { fill: '#0277BD', label: 'Maritime', icon: '~' },
};

function getNatureStyle(nature: string) {
  return NATURE_STYLES[nature] || NATURE_STYLES['Maritime'];
}

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

        // Collect all activities
        const activities: string[] = [];
        for (let j = 1; j <= 6; j++) {
          const act = p[`MnActivitePortuaire_${j}`];
          if (act) activities.push(act);
        }

        const style = getNatureStyle(nature);

        // Larger marker for ports with Commerce (freight) activity
        const radius = hasCommerce ? 6 : 4.5;

        return (
          <CircleMarker
            key={`port-${p['CdPort'] || i}`}
            center={[coords[1], coords[0]]}
            radius={radius}
            pathOptions={{
              fillColor: style.fill,
              color: hasCommerce ? '#FFD54F' : '#fff',
              fillOpacity: hasCommerce ? 0.95 : 0.75,
              weight: hasCommerce ? 2 : 1.5,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs" style={{ maxWidth: 260, minWidth: 160 }}>
                {/* Port name */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <strong className="text-[13px] leading-tight" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: 220 }}>
                    {name}
                  </strong>
                </div>

                {/* Commune */}
                {commune && (
                  <div className="text-[10px] opacity-70 mb-1">
                    {commune}
                  </div>
                )}

                {/* Info badges */}
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {nature && (
                    <span
                      className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded font-medium text-white"
                      style={{ backgroundColor: style.fill }}
                    >
                      {nature}
                    </span>
                  )}
                  {hasCommerce && (
                    <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Fret
                    </span>
                  )}
                </div>

                {/* Activities */}
                {activities.length > 0 && (
                  <div className="border-t border-gray-200 pt-1 mb-1" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                    <div className="text-[9px] font-semibold opacity-60 uppercase tracking-wider mb-0.5">
                      Activites
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activities.map((act, j) => (
                        <span
                          key={j}
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: act === 'Commerce' ? 'rgba(255,213,79,0.15)' : 'rgba(128,128,128,0.1)',
                            color: act === 'Commerce' ? '#FFD54F' : 'inherit',
                          }}
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Management + Zone */}
                {(gestion || zone) && (
                  <div className="border-t border-gray-200 pt-1" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
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
