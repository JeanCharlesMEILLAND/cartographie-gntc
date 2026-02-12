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
            font-size: 10px;
            font-weight: 600;
            text-shadow: 0 0 3px rgba(255,255,255,0.8), 0 0 6px rgba(255,255,255,0.5);
            white-space: nowrap;
            pointer-events: none;
          ">${platform.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -12],
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
