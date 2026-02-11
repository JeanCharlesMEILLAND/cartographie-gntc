'use client';

import { CircleMarker, Tooltip } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { Platform, AggregatedRoute } from '@/lib/types';

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
  // Linear scale 6-16 for 0-200
  return 6 + (volume / 200) * 10;
}

export default function PlatformMarkers({ platforms, routes }: PlatformMarkersProps) {
  const { showPlatforms, setSelectedPlatform } = useFilterStore();

  if (!showPlatforms) return null;

  return (
    <>
      {platforms.map((platform) => {
        const volume = getTrainVolume(platform.site, routes);
        const size = getMarkerSize(volume);
        const isFrance = platform.pays?.toLowerCase() === 'france';
        const isHub = volume > 100;

        return (
          <CircleMarker
            key={platform.site}
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
        );
      })}
    </>
  );
}
