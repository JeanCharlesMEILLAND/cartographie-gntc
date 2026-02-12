'use client';

import { useEffect, useState } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import type { FeatureCollection } from 'geojson';
import { fetchSNCFLayers } from './ITELayer';

const ELEC_COLORS: Record<string, string> = {
  '25000 volts alternatif': '#e74c3c',
  '1500 volts continu': '#3498db',
  '15000 volts 16 2/3 alternatif': '#f39c12',
  '3000 volts continu': '#2ecc71',
  '750 Volts continu': '#9b59b6',
};

const DEFAULT_COLOR = '#7f8c8d';

export default function ElectrificationLayer() {
  const showElectrification = useFilterStore((s) => s.showElectrification);
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (!showElectrification || data) return;
    fetchSNCFLayers().then((d) => {
      if (d?.electrification) setData(d.electrification);
    });
  }, [showElectrification, data]);

  if (!showElectrification || !data) return null;

  return (
    <>
      {data.features.map((f, i) => {
        const p = f.properties || {};
        const elec = p['elect'] || '';
        const color = ELEC_COLORS[elec] || DEFAULT_COLOR;
        const line = p['lib_ligne'] || '';

        // Use geo_shape if available (has LineString geometry), else use start/end coords
        let positions: [number, number][] = [];

        if (f.geometry?.type === 'LineString') {
          positions = (f.geometry as GeoJSON.LineString).coordinates.map(
            (c) => [c[1], c[0]] as [number, number]
          );
        } else if (p['c_geo_d'] && p['c_geo_f']) {
          positions = [
            [p['c_geo_d'].lat, p['c_geo_d'].lon],
            [p['c_geo_f'].lat, p['c_geo_f'].lon],
          ];
        } else if (p['y_d_wgs84'] && p['x_d_wgs84'] && p['y_f_wgs84'] && p['x_f_wgs84']) {
          positions = [
            [p['y_d_wgs84'], p['x_d_wgs84']],
            [p['y_f_wgs84'], p['x_f_wgs84']],
          ];
        }

        if (positions.length < 2) return null;

        return (
          <Polyline
            key={`elec-${i}`}
            positions={positions}
            pathOptions={{
              color,
              weight: 2,
              opacity: 0.7,
            }}
          >
            <Tooltip direction="top" opacity={0.95}>
              <div className="text-xs">
                <strong>{elec}</strong>
                {line && <div className="text-muted">{line}</div>}
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}
