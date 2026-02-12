'use client';

import { CircleMarker, Tooltip, Marker, useMapEvents } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { Platform, AggregatedRoute } from '@/lib/types';
import L from 'leaflet';
import { useMemo, useState } from 'react';

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
  if (volume <= 0) return 8;
  if (volume > 200) return 18;
  return 8 + (volume / 200) * 10;
}

export default function PlatformMarkers({ platforms, routes }: PlatformMarkersProps) {
  const { showPlatforms, selectedPlatform, setSelectedPlatform } = useFilterStore();
  const { results, highlightedRouteIndex } = useSearchStore();
  const [zoom, setZoom] = useState(6);

  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });

  if (!showPlatforms) return null;

  // Search mode: only show platforms involved in the highlighted search result
  const searchActive = highlightedRouteIndex !== null && results.length > 0;
  const searchSites = useMemo(() => {
    if (!searchActive) return null;
    const sites = new Set<string>();
    const route = results[highlightedRouteIndex!];
    if (route) {
      for (const leg of route.legs) {
        sites.add(leg.from);
        sites.add(leg.to);
      }
    }
    return sites;
  }, [searchActive, results, highlightedRouteIndex]);

  // If a platform is selected, find connected platform names
  const connectedSites = new Set<string>();
  if (selectedPlatform) {
    connectedSites.add(selectedPlatform);
    for (const r of routes) {
      if (r.from === selectedPlatform) connectedSites.add(r.to);
      if (r.to === selectedPlatform) connectedSites.add(r.from);
    }
  }

  return (
    <>
      {platforms.filter((p) => !searchSites || searchSites.has(p.site)).map((platform) => {
        const volume = getTrainVolume(platform.site, routes);
        const size = getMarkerSize(volume);
        const isFrance = platform.pays?.toLowerCase() === 'france';
        const isHub = volume > 30;
        const isBigHub = volume > 80;

        // Is this platform highlighted (selected or connected)?
        const isHighlighted = selectedPlatform
          ? connectedSites.has(platform.site)
          : true;
        const isSelected = platform.site === selectedPlatform;

        // When a platform is selected, only show labels for connected platforms
        // Otherwise: big hubs at zoom >= 6, hubs at zoom >= 7, all at zoom >= 8
        const showName = selectedPlatform
          ? isHighlighted && zoom >= 6
          : zoom >= 8 || (isHub && zoom >= 7) || (isBigHub && zoom >= 6);

        const labelIcon = showName ? L.divIcon({
          className: 'platform-label',
          html: `<span style="
            color: ${isSelected ? '#38d9f5' : '#d6ddf0'};
            font-size: ${isBigHub || isSelected ? '11px' : isHub ? '10px' : '9px'};
            font-weight: ${isBigHub || isSelected ? '700' : '500'};
            text-shadow: 0 0 4px #060a14, 0 0 8px #060a14, 0 0 12px #060a14;
            white-space: nowrap;
            pointer-events: none;
            opacity: ${isHighlighted ? '1' : '0.3'};
          ">${platform.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -12],
        }) : null;

        const dimmed = selectedPlatform && !isHighlighted;

        return (
          <span key={platform.site}>
            <CircleMarker
              center={[platform.lat, platform.lon]}
              radius={isSelected ? size + 3 : size}
              pathOptions={{
                fillColor: isFrance ? '#38d9f5' : '#a78bfa',
                color: isSelected ? '#ffffff' : (isFrance ? '#38d9f5' : '#a78bfa'),
                fillOpacity: dimmed ? 0.15 : 0.7,
                weight: isSelected ? 3 : 2,
                opacity: dimmed ? 0.2 : 1,
                className: isHub ? 'marker-hub' : undefined,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setSelectedPlatform(platform.site);
                },
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
