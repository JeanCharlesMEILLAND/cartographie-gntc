'use client';

import { Marker, useMapEvents } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { Platform } from '@/lib/types';
import L from 'leaflet';
import { useState } from 'react';

interface HubLabelsProps {
  platforms: Platform[];
}

export default function HubLabels({ platforms }: HubLabelsProps) {
  const showLabels = useFilterStore((s) => s.showLabels);
  const [zoom, setZoom] = useState(6);

  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });

  if (!showLabels || zoom < 5) return null;

  return (
    <>
      {platforms.map((platform) => {
        const icon = L.divIcon({
          className: 'hub-label',
          html: `<span style="
            color: #2b2b2b;
            background: rgba(255,255,255,0.88);
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 600;
            white-space: nowrap;
            pointer-events: none;
            border: 1px solid rgba(88,123,189,0.2);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            line-height: 1.4;
          ">${platform.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -14],
        });

        return (
          <Marker
            key={`label-${platform.site}`}
            position={[platform.lat, platform.lon]}
            icon={icon}
            interactive={false}
          />
        );
      })}
    </>
  );
}
