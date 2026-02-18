'use client';

import { CircleMarker, Tooltip, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { Platform, AggregatedRoute } from '@/lib/types';
import { getOperatorColor } from '@/lib/colors';

import L from 'leaflet';
import { useMemo, useState } from 'react';

interface PlatformMarkersProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
}

function getMarkerSize(volume: number): number {
  if (volume <= 0) return 8;
  if (volume > 200) return 18;
  return 8 + (volume / 200) * 10;
}

function estimateLabelWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.58 + 12;
}

const LABEL_H = 16;
const GAP = 3;

// Candidate offsets: [anchorX, anchorY] relative to the marker pixel position
// We try above, right, below-right, below, left, above-left, etc.
const OFFSETS: [number, number][] = [
  [0, -16],      // above (default)
  [14, -8],      // top-right
  [16, 4],       // right
  [10, 16],      // bottom-right
  [0, 18],       // below
  [-14, -8],     // top-left (anchor = label right edge)
  [-16, 4],      // left
  [-10, 16],     // bottom-left
];

interface PlacedRect { x: number; y: number; w: number; h: number }

function findBestOffset(
  px: number,
  py: number,
  labelW: number,
  placed: PlacedRect[],
): [number, number] {
  for (const [ox, oy] of OFFSETS) {
    // For left-side offsets (negative ox), anchor the right edge of the label
    const lx = ox < 0 ? px + ox - labelW : px + ox;
    const ly = py + oy;

    const collides = placed.some((r) =>
      !(lx + labelW + GAP < r.x || lx > r.x + r.w + GAP ||
        ly + LABEL_H + GAP < r.y || ly > r.y + r.h + GAP)
    );
    if (!collides) return [ox, oy];
  }
  // All collide — return default (above), label will overlap but at least shows
  return OFFSETS[0];
}

export default function PlatformMarkers({ platforms, routes }: PlatformMarkersProps) {
  const leafletMap = useMap();
  const { showPlatforms, selectedPlatform, setSelectedPlatform } = useFilterStore();
  const { results, highlightedRouteIndex, departureCitySuggestion, arrivalCitySuggestion } = useSearchStore();
  const [zoom, setZoom] = useState(leafletMap.getZoom());

  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
    moveend: () => setZoom(leafletMap.getZoom()),
  });

  // Single-pass volume computation — O(routes) instead of O(platforms × routes)
  const platformVolumes = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of routes) {
      m.set(r.from, (m.get(r.from) || 0) + r.freq);
      m.set(r.to, (m.get(r.to) || 0) + r.freq);
    }
    return m;
  }, [routes]);

  // Per-platform: unique operators and liaison count
  const platformMeta = useMemo(() => {
    const ops = new Map<string, Set<string>>();
    const liaisons = new Map<string, number>();
    for (const r of routes) {
      if (!ops.has(r.from)) ops.set(r.from, new Set());
      if (!ops.has(r.to)) ops.set(r.to, new Set());
      for (const o of r.operators) {
        ops.get(r.from)!.add(o);
        ops.get(r.to)!.add(o);
      }
      liaisons.set(r.from, (liaisons.get(r.from) || 0) + 1);
      liaisons.set(r.to, (liaisons.get(r.to) || 0) + 1);
    }
    return { ops, liaisons };
  }, [routes]);

  const searchActive = highlightedRouteIndex !== null && results.length > 0;
  const searchSites = useMemo(() => {
    if (!searchActive) return null;
    const sites = new Set<string>();
    const route = results[highlightedRouteIndex!];
    if (route) {
      for (const leg of route.legs) { sites.add(leg.from); sites.add(leg.to); }
    }
    return sites;
  }, [searchActive, results, highlightedRouteIndex]);

  const previewSites = useMemo(() => {
    if (searchActive) return null;
    const sites = new Set<string>();
    if (departureCitySuggestion) departureCitySuggestion.platforms.forEach((p) => sites.add(p.site));
    if (arrivalCitySuggestion) arrivalCitySuggestion.platforms.forEach((p) => sites.add(p.site));
    return sites.size > 0 ? sites : null;
  }, [searchActive, departureCitySuggestion, arrivalCitySuggestion]);

  if (!showPlatforms) return null;

  const connectedSites = new Set<string>();
  if (selectedPlatform) {
    connectedSites.add(selectedPlatform);
    for (const r of routes) {
      if (r.from === selectedPlatform) connectedSites.add(r.to);
      if (r.to === selectedPlatform) connectedSites.add(r.from);
    }
  }

  // --- Label placement with collision avoidance ---
  const visiblePlatforms = platforms.filter((p) => !searchSites || searchSites.has(p.site));

  // Sort by priority (selected > preview > highest volume first)
  const sorted = [...visiblePlatforms].sort((a, b) => {
    const aPri = (a.site === selectedPlatform ? 1e6 : 0) + (previewSites?.has(a.site) ? 5e5 : 0);
    const bPri = (b.site === selectedPlatform ? 1e6 : 0) + (previewSites?.has(b.site) ? 5e5 : 0);
    return (bPri + (platformVolumes.get(b.site) || 0)) - (aPri + (platformVolumes.get(a.site) || 0));
  });

  const placedRects: PlacedRect[] = [];
  const labelPlacements = new Map<string, [number, number]>(); // site → [anchorX, anchorY]

  for (const platform of sorted) {
    const volume = platformVolumes.get(platform.site) || 0;
    const isHub = volume > 30;
    const isBigHub = volume > 80;
    const isPreview = previewSites?.has(platform.site) ?? false;
    const isSelected = platform.site === selectedPlatform;
    const isHighlighted = selectedPlatform ? connectedSites.has(platform.site) : true;

    const wantsLabel = isSelected || isPreview
      || (selectedPlatform ? isHighlighted && zoom >= 6 : false)
      || (!selectedPlatform && (zoom >= 9 || (isHub && zoom >= 7) || (isBigHub && zoom >= 6)));

    if (!wantsLabel) continue;

    const point = leafletMap.latLngToContainerPoint([platform.lat, platform.lon]);
    const fontSize = isBigHub || isSelected ? 10 : isHub ? 9 : 8;
    const labelW = estimateLabelWidth(platform.site, fontSize);

    const [ox, oy] = findBestOffset(point.x, point.y, labelW, placedRects);
    const lx = ox < 0 ? point.x + ox - labelW : point.x + ox;
    const ly = point.y + oy;
    placedRects.push({ x: lx, y: ly, w: labelW, h: LABEL_H });
    labelPlacements.set(platform.site, [ox, oy]);
  }

  return (
    <>
      {visiblePlatforms.map((platform) => {
        const volume = platformVolumes.get(platform.site) || 0;
        const size = getMarkerSize(volume);
        const isFrance = platform.pays?.toLowerCase() === 'france';
        const isHub = volume > 30;
        const isBigHub = volume > 80;
        const isPreview = previewSites?.has(platform.site) ?? false;
        const isHighlighted = selectedPlatform ? connectedSites.has(platform.site) : true;
        const isSelected = platform.site === selectedPlatform;
        const dimmed = selectedPlatform && !isHighlighted;

        const placement = labelPlacements.get(platform.site);
        const showName = !!placement;

        const labelIcon = showName ? L.divIcon({
          className: 'platform-label',
          html: `<span style="
            color: ${isSelected ? '#fff' : '#2b2b2b'};
            background: ${isSelected ? '#587bbd' : 'rgba(255,255,255,0.9)'};
            padding: 1px 5px;
            border-radius: 3px;
            font-size: ${isBigHub || isSelected ? '10px' : isHub ? '9px' : '8px'};
            font-weight: ${isBigHub || isSelected ? '700' : '600'};
            white-space: nowrap;
            pointer-events: none;
            opacity: ${isHighlighted ? '1' : '0.25'};
            border: 1px solid ${isSelected ? '#587bbd' : 'rgba(88,123,189,0.2)'};
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            line-height: 1.4;
          ">${platform.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [-(placement?.[0] || 0), -(placement?.[1] || 0)],
        }) : null;

        return (
          <span key={platform.site}>
            <CircleMarker
              center={[platform.lat, platform.lon]}
              radius={isPreview ? size + 2 : isSelected ? size + 3 : size}
              pathOptions={{
                fillColor: isPreview ? '#7dc243' : (isFrance ? '#587bbd' : '#a78bfa'),
                color: isPreview ? '#7dc243' : isSelected ? '#ffffff' : (isFrance ? '#587bbd' : '#a78bfa'),
                fillOpacity: isPreview ? 0.9 : dimmed ? 0.15 : 0.7,
                weight: isPreview ? 3 : isSelected ? 3 : 2,
                opacity: isPreview ? 1 : dimmed ? 0.2 : 1,
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
                {(() => {
                  const operators = platformMeta.ops.get(platform.site);
                  const liaisons = platformMeta.liaisons.get(platform.site) || 0;
                  const opList = operators ? [...operators] : [];
                  return (
                    <div className="text-xs min-w-[160px]">
                      <strong className="text-[13px]">{platform.site}</strong>
                      {platform.ville && (
                        <div className="text-[10px] opacity-70 mb-1.5">
                          {platform.ville}{platform.pays ? ` — ${platform.pays}` : ''}
                        </div>
                      )}
                      <div className="flex gap-3 py-1.5 border-t border-gray-200 mb-1.5" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                        <div className="text-center">
                          <div className="font-mono font-bold text-[13px]" style={{ color: '#38d9f5' }}>{volume}</div>
                          <div className="text-[9px] opacity-60">trains/sem</div>
                        </div>
                        <div className="text-center">
                          <div className="font-mono font-bold text-[13px]" style={{ color: '#587bbd' }}>{liaisons}</div>
                          <div className="text-[9px] opacity-60">liaisons</div>
                        </div>
                        <div className="text-center">
                          <div className="font-mono font-bold text-[13px]" style={{ color: '#a78bfa' }}>{opList.length}</div>
                          <div className="text-[9px] opacity-60">opérateurs</div>
                        </div>
                      </div>
                      {opList.length > 0 && (
                        <div className="space-y-0.5 mb-1.5">
                          {opList.slice(0, 4).map((op) => (
                            <div key={op} className="flex items-center gap-1.5">
                              <span
                                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getOperatorColor(op) }}
                              />
                              <span className="text-[10px] truncate">{op}</span>
                            </div>
                          ))}
                          {opList.length > 4 && (
                            <div className="text-[10px] opacity-60 ml-3.5">
                              +{opList.length - 4} autre{opList.length - 4 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-[9px] opacity-50 text-center pt-1 border-t" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                        Cliquer pour voir les détails
                      </div>
                    </div>
                  );
                })()}
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
