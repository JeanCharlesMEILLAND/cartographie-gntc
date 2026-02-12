'use client';

import { CircleMarker, Tooltip, Marker, useMapEvents } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { Platform, AggregatedRoute } from '@/lib/types';
import L from 'leaflet';
import { useState } from 'react';

interface PlatformMarkersProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
}

function getTrainVolume(platformName: string, routes: AggregatedRoute[]): number {
  let total = 0;
  for (const r of routes) {
    if (r.from === platformName || r.to === platformName) {
      total += r.freq;
    }
  }
  return total;
}

function getMarkerSize(volume: number): number {
  if (volume <= 0) return 6;
  if (volume > 200) return 16;
  return 6 + (volume / 200) * 10;
}

export default function PlatformMarkers({ platforms, routes }: PlatformMarkersProps) {
  const { showPlatforms, setSelectedPlatform } = useFilterStore();
  const [zoom, setZoom] = useState(6);

  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });

  if (!showPlatforms) return null;

  return (
    <>
      {platforms.map((platform) => {
        const volume = getTrainVolume(platform.site, routes);
        const size = getMarkerSize(volume);
        const isFrance = platform.pays?.toLowerCase() === 'france';
        const isHub = volume > 30;

        // Name label (shown at zoom >= 7, or always for hubs at zoom >= 6)
        const showName = zoom >= 8 || (isHub && zoom >= 6);

        const labelIcon = showName ? L.divIcon({
          className: 'platform-label',
          html: `<span style="
            color: #d6ddf0;
            font-size: ${isHub ? '11px' : '9px'};
            font-weight: ${isHub ? '700' : '500'};
            text-shadow: 0 0 4px #060a14, 0 0 8px #060a14, 0 0 12px #060a14;
            white-space: nowrap;
            pointer-events: none;
          ">${platform.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -12],
        }) : null;

        return (
          <span key={platform.site}>
            <CircleMarker
              center={[platform.lat, platform.lon]}
              radius={size}
              pathOptions={{
                fillColor: isFrance ? '#38d9f5' : '#a78bfa',
                color: isFrance ? '#38d9f5' : '#a78bfa',
                fillOpacity: 0.7,
                weight: 2,
                className: isHub ? 'marker-hub' : undefined,
              }}
              eventHandlers={{
                click: () => setSelectedPlatform(platform.site),
              }}
            >
              <Tooltip direction="top" offset={[0, -size]} opacity={0.95}>
                <div className="text-xs">
                  <strong>{platform.site}</strong>
                  <br />
                  {platform.ville && <span>{platform.ville} — </span>}
                  <span className="font-mono">{volume} trains/sem</span>
                </div>
              </Tooltip>
            </CircleMarker>
            {showName && labelIcon && (
              <Marker
                position={[platform.lat, platform.lon]}
                icon={labelIcon}
                interactive={false}
              />
            )}
          </span>
        );
      })}
    </>
  );
}
