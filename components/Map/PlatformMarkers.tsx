'use client';

import { CircleMarker, Tooltip, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
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
const HUB_CLUSTER_ZOOM = 10;

// Hub name overrides: maps ville → displayed hub name
const HUB_NAME_OVERRIDES: Record<string, string> = {
  'Marck': 'Calais',
  'Fenouillet': 'Toulouse',
  'Bègles': 'Bordeaux',
  'Antwerp': 'Anvers',
  'Bonneuil-sur-Marne': 'Valanton/Bonneuil',
  'Bonneuil-sur-marne': 'Valanton/Bonneuil',
  'Bonneuil': 'Valanton/Bonneuil',
  'Valenton': 'Valanton/Bonneuil',
};

// Forced hub groups: platforms matching these patterns merge into one hub
const FORCED_HUB_GROUPS: { name: string; match: (site: string) => boolean }[] = [
  {
    name: 'Marseille',
    match: (site) =>
      /^(Marseille|Fos|EUROFOS|Port de Marseille|Terminal.*(Miramas|Provence))/i.test(site),
  },
];

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

  // --- Spider offset: nudge co-located platforms so they're all clickable ---
  const spiderOffsets = useMemo(() => {
    const offsets = new Map<string, [number, number]>();
    // Group platforms by approximate position (within ~2km)
    const grid = new Map<string, Platform[]>();
    for (const p of platforms) {
      const key = `${(p.lat * 100) | 0},${(p.lon * 100) | 0}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(p);
    }
    for (const group of grid.values()) {
      if (group.length <= 1) continue;
      const step = 0.008; // ~0.9km offset between co-located platforms
      for (let i = 0; i < group.length; i++) {
        const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
        offsets.set(group[i].site, [
          Math.cos(angle) * step,
          Math.sin(angle) * step,
        ]);
      }
    }
    return offsets;
  }, [platforms]);

  // --- Hub clusters: group co-located platforms for low-zoom display ---
  const hubClusters = useMemo(() => {
    // Step 1: Identify platforms belonging to forced hubs
    const forcedPlatforms = new Map<string, Platform[]>();
    const forcedSites = new Set<string>();

    for (const hub of FORCED_HUB_GROUPS) {
      const matching = platforms.filter(p => hub.match(p.site));
      if (matching.length >= 1) {
        forcedPlatforms.set(hub.name, matching);
        for (const p of matching) forcedSites.add(p.site);
      }
    }

    // Step 2: Normal grid-based clustering (excluding forced hub platforms)
    const grid = new Map<string, Platform[]>();
    for (const p of platforms) {
      if (forcedSites.has(p.site)) continue;
      const key = `${(p.lat * 100) | 0},${(p.lon * 100) | 0}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(p);
    }

    const normalClusters = Array.from(grid.entries())
      .filter(([, group]) => group.length >= 2)
      .map(([key, group]) => {
        const lat = group.reduce((s, p) => s + p.lat, 0) / group.length;
        const lon = group.reduce((s, p) => s + p.lon, 0) / group.length;
        const vc = new Map<string, number>();
        for (const p of group) vc.set(p.ville || '', (vc.get(p.ville || '') || 0) + 1);
        let ville = [...vc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Hub';
        // Apply name overrides
        if (HUB_NAME_OVERRIDES[ville]) ville = HUB_NAME_OVERRIDES[ville];
        return { key, lat, lon, ville, platforms: group };
      });

    // Step 3: Create forced hub entries
    const forcedClusters = Array.from(forcedPlatforms.entries()).map(([name, group]) => {
      const lat = group.reduce((s, p) => s + p.lat, 0) / group.length;
      const lon = group.reduce((s, p) => s + p.lon, 0) / group.length;
      return { key: `forced-${name}`, lat, lon, ville: name, platforms: group };
    });

    return [...normalClusters, ...forcedClusters];
  }, [platforms]);

  const clusteredSites = useMemo(() => {
    const s = new Set<string>();
    for (const c of hubClusters) for (const p of c.platforms) s.add(p.site);
    return s;
  }, [hubClusters]);

  // Map each platform site to its hub name (for "vers X" labels)
  const siteToHub = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of hubClusters) {
      for (const p of c.platforms) m.set(p.site, c.ville);
    }
    return m;
  }, [hubClusters]);

  const showClusters = zoom < HUB_CLUSTER_ZOOM;

  // --- Label placement with collision avoidance ---
  const visiblePlatforms = platforms.filter((p) => !searchSites || searchSites.has(p.site));
  const renderPlatforms = showClusters
    ? visiblePlatforms.filter(p => !clusteredSites.has(p.site))
    : visiblePlatforms;

  // Sort by priority (selected > preview > highest volume first)
  const sorted = [...renderPlatforms].sort((a, b) => {
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
      {renderPlatforms.map((platform) => {
        const volume = platformVolumes.get(platform.site) || 0;
        const size = getMarkerSize(volume);
        const isFrance = platform.pays?.toLowerCase() === 'france';
        const isHub = volume > 30;
        const isBigHub = volume > 80;
        const isPreview = previewSites?.has(platform.site) ?? false;
        const isHighlighted = selectedPlatform ? connectedSites.has(platform.site) : true;
        const isSelected = platform.site === selectedPlatform;
        const dimmed = selectedPlatform && !isHighlighted;

        // Apply spider offset for co-located platforms
        const offset = spiderOffsets.get(platform.site);
        const markerLat = platform.lat + (offset ? offset[0] : 0);
        const markerLon = platform.lon + (offset ? offset[1] : 0);

        const placement = labelPlacements.get(platform.site);
        const showName = !!placement;

        const labelIcon = showName ? L.divIcon({
          className: 'platform-label',
          html: `<span style="
            color: ${isSelected ? '#fff' : '#2b2b2b'};
            background: ${isSelected ? '#67978f' : 'rgba(255,255,255,0.9)'};
            padding: 1px 5px;
            border-radius: 3px;
            font-size: ${isBigHub || isSelected ? '10px' : isHub ? '9px' : '8px'};
            font-weight: ${isBigHub || isSelected ? '700' : '600'};
            white-space: nowrap;
            pointer-events: none;
            opacity: ${isHighlighted ? '1' : '0.25'};
            border: 1px solid ${isSelected ? '#67978f' : 'rgba(103,151,143,0.2)'};
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            line-height: 1.4;
          ">${platform.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [-(placement?.[0] || 0), -(placement?.[1] || 0)],
        }) : null;

        return (
          <span key={platform.site}>
            <CircleMarker
              center={[markerLat, markerLon]}
              radius={isPreview ? size + 2 : isSelected ? size + 3 : size}
              pathOptions={{
                fillColor: isPreview ? '#7dc243' : (isFrance ? '#67978f' : '#a78bfa'),
                color: isPreview ? '#7dc243' : isSelected ? '#ffffff' : (isFrance ? '#67978f' : '#a78bfa'),
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
                          <div className="font-mono font-bold text-[13px]" style={{ color: '#67978f' }}>{liaisons}</div>
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
                position={[markerLat, markerLon]}
                icon={labelIcon}
                interactive={false}
              />
            )}
          </span>
        );
      })}

      {/* Hub cluster markers at low zoom */}
      {showClusters && hubClusters.map((cluster) => {
        const clusterVisible = cluster.platforms.filter(p =>
          !searchSites || searchSites.has(p.site)
        );
        if (clusterVisible.length === 0) return null;

        const totalVolume = clusterVisible.reduce(
          (s, p) => s + (platformVolumes.get(p.site) || 0), 0
        );
        const isAnyConnected = selectedPlatform
          ? cluster.platforms.some(p => connectedSites.has(p.site))
          : false;
        const dimmed = selectedPlatform && !isAnyConnected;

        const clusterIcon = L.divIcon({
          className: '',
          html: `<div style="
            width: 28px; height: 28px;
            border-radius: 50%;
            background: ${dimmed ? 'rgba(125,194,67,0.3)' : '#7dc243'};
            border: 2px solid rgba(255,255,255,${dimmed ? '0.3' : '0.9'});
            color: white; font-weight: 700; font-size: 12px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          ">${clusterVisible.length}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const sortedCluster = [...clusterVisible].sort(
          (a, b) => (platformVolumes.get(b.site) || 0) - (platformVolumes.get(a.site) || 0)
        );

        return (
          <span key={`hub-${cluster.key}`}>
            <Marker position={[cluster.lat, cluster.lon]} icon={clusterIcon}>
              <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
                <div className="text-xs">
                  <strong>Hub {cluster.ville}</strong>
                  <div className="text-[10px] opacity-70">
                    {clusterVisible.length} plateformes · {totalVolume} trains/sem
                  </div>
                </div>
              </Tooltip>
              <Popup maxWidth={320} minWidth={260}>
                <div style={{ fontFamily: 'inherit' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    Hub {cluster.ville}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
                    {clusterVisible.length} plateformes · {totalVolume} trains/sem
                  </div>

                  {/* Destinations "vers X" */}
                  {(() => {
                    const hubSites = new Set(cluster.platforms.map(p => p.site));
                    const destFreq = new Map<string, number>();
                    for (const p of cluster.platforms) {
                      for (const r of routes) {
                        let dest: string | null = null;
                        if (r.from === p.site && !hubSites.has(r.to)) dest = r.to;
                        if (r.to === p.site && !hubSites.has(r.from)) dest = r.from;
                        if (dest) {
                          const hubName = siteToHub.get(dest) || dest.split(' - ')[0].split(' (')[0].trim();
                          destFreq.set(hubName, (destFreq.get(hubName) || 0) + r.freq);
                        }
                      }
                    }
                    const sortedDests = [...destFreq.entries()].sort((a, b) => b[1] - a[1]);
                    if (sortedDests.length === 0) return null;
                    return (
                      <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(103,151,143,0.08)', borderRadius: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#67978f', marginBottom: 4 }}>
                          Destinations
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 8px' }}>
                          {sortedDests.slice(0, 12).map(([name, freq]) => (
                            <span key={name} style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap' }}>
                              vers {name} <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#38d9f5' }}>({freq}/s)</span>
                            </span>
                          ))}
                          {sortedDests.length > 12 && (
                            <span style={{ fontSize: 9, color: '#888' }}>+{sortedDests.length - 12} autres</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {sortedCluster.map((p) => {
                      const vol = platformVolumes.get(p.site) || 0;
                      const ops = platformMeta.ops.get(p.site);
                      const opList = ops ? [...ops] : [];
                      const liaisons = platformMeta.liaisons.get(p.site) || 0;
                      return (
                        <div
                          key={p.site}
                          onClick={() => {
                            setSelectedPlatform(p.site);
                            leafletMap.closePopup();
                          }}
                          style={{
                            padding: '6px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '1px solid #e5e5e5',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{p.site}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#38d9f5' }}>
                              {vol} t/s
                            </span>
                            <span style={{ fontSize: 10, color: '#888' }}>
                              {liaisons} liaison{liaisons > 1 ? 's' : ''}
                            </span>
                            <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                              {opList.slice(0, 5).map((op) => (
                                <span
                                  key={op}
                                  style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    display: 'inline-block',
                                    backgroundColor: getOperatorColor(op),
                                  }}
                                  title={op}
                                />
                              ))}
                              {opList.length > 5 && (
                                <span style={{ fontSize: 9, color: '#888' }}>+{opList.length - 5}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Hub label */}
            {zoom >= 7 && (
              <Marker
                position={[cluster.lat, cluster.lon]}
                icon={L.divIcon({
                  className: '',
                  html: `<span style="
                    color: #2b2b2b;
                    background: rgba(255,255,255,0.92);
                    padding: 1px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-weight: 700;
                    white-space: nowrap;
                    pointer-events: none;
                    border: 1px solid rgba(125,194,67,0.3);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                  ">Hub ${cluster.ville}</span>`,
                  iconSize: [0, 0],
                  iconAnchor: [0, 22],
                })}
                interactive={false}
              />
            )}
          </span>
        );
      })}
    </>
  );
}
