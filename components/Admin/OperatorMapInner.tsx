'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Platform, AggregatedRoute, Service } from '@/lib/types';
import { getBezierPoints } from '@/lib/bezier';
import { getOperatorColor } from '@/lib/colors';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  platforms: Platform[];
  routes: AggregatedRoute[];
  services: Service[];
  operator: string;
  highlightedSite?: string | null;
  onSiteSelect?: (site: string | null) => void;
  extraRailGeometries?: Record<string, [number, number][]>;
}

// Same weight scale as main map RouteLayer
function getRouteStyle(freq: number, color: string) {
  if (freq > 30) return { weight: 5, color, opacity: 0.9 };
  if (freq > 15) return { weight: 4, color, opacity: 0.85 };
  if (freq > 8) return { weight: 3.5, color, opacity: 0.75 };
  if (freq > 3) return { weight: 2.5, color, opacity: 0.65 };
  return { weight: 2, color, opacity: 0.5 };
}

// Same marker sizing as main map PlatformMarkers
function getMarkerSize(volume: number): number {
  if (volume <= 0) return 8;
  if (volume > 200) return 18;
  return 8 + (volume / 200) * 10;
}

// ── Label collision avoidance (same pattern as PlatformMarkers.tsx) ──
function estimateLabelWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.58 + 12;
}

const LABEL_H = 16;
const LABEL_GAP = 3;
const LABEL_OFFSETS: [number, number][] = [
  [0, -16], [14, -8], [16, 4], [10, 16],
  [0, 18], [-14, -8], [-16, 4], [-10, 16],
];

interface PlacedRect { x: number; y: number; w: number; h: number }

function findBestOffset(px: number, py: number, labelW: number, placed: PlacedRect[]): [number, number] {
  for (const [ox, oy] of LABEL_OFFSETS) {
    const lx = ox < 0 ? px + ox - labelW : px + ox;
    const ly = py + oy;
    const collides = placed.some((r) =>
      !(lx + labelW + LABEL_GAP < r.x || lx > r.x + r.w + LABEL_GAP ||
        ly + LABEL_H + LABEL_GAP < r.y || ly > r.y + r.h + LABEL_GAP)
    );
    if (!collides) return [ox, oy];
  }
  return LABEL_OFFSETS[0];
}

function SiteLabels({ platforms, selectedSite, selectedDestinations, siteVolumes, color }: {
  platforms: Platform[];
  selectedSite: string | null;
  selectedDestinations: string[];
  siteVolumes: Map<string, number>;
  color: string;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const labelPlacements = useMemo(() => {
    const placements = new Map<string, [number, number]>();
    const placedRects: PlacedRect[] = [];

    // Trier : sélectionné d'abord, puis gros volumes
    const sorted = [...platforms].sort((a, b) => {
      if (a.site === selectedSite) return -1;
      if (b.site === selectedSite) return 1;
      return (siteVolumes.get(b.site) || 0) - (siteVolumes.get(a.site) || 0);
    });

    for (const p of sorted) {
      const isSelected = p.site === selectedSite;
      const isConnected = selectedSite ? selectedDestinations.includes(p.site) || p.site === selectedSite : false;
      const volume = siteVolumes.get(p.site) || 0;

      // Toujours afficher si sélectionné/connecté, sinon selon le zoom
      const show = isSelected || isConnected
        || (volume > 80 && zoom >= 5)
        || (volume > 30 && zoom >= 6)
        || (volume > 0 && zoom >= 7)
        || zoom >= 8;
      if (!show) continue;

      const point = map.latLngToContainerPoint([p.lat, p.lon]);
      const fontSize = isSelected ? 10 : volume > 80 ? 9 : 8;
      const labelW = estimateLabelWidth(p.site, fontSize);
      const [ox, oy] = findBestOffset(point.x, point.y, labelW, placedRects);
      const lx = ox < 0 ? point.x + ox - labelW : point.x + ox;
      placedRects.push({ x: lx, y: point.y + oy, w: labelW, h: LABEL_H });
      placements.set(p.site, [ox, oy]);
    }
    return placements;
  }, [platforms, selectedSite, selectedDestinations, siteVolumes, zoom, map]);

  return (
    <>
      {platforms.map((p) => {
        const placement = labelPlacements.get(p.site);
        if (!placement) return null;
        const isSelected = p.site === selectedSite;
        const isConnected = selectedSite ? selectedDestinations.includes(p.site) || p.site === selectedSite : false;
        const dimmed = selectedSite && !isConnected;
        const volume = siteVolumes.get(p.site) || 0;

        const icon = L.divIcon({
          className: 'platform-label',
          html: `<span style="
            color: ${isSelected ? '#fff' : '#2b2b2b'};
            background: ${isSelected ? color : 'rgba(255,255,255,0.9)'};
            padding: 1px 5px;
            border-radius: 3px;
            font-size: ${isSelected ? '10px' : volume > 80 ? '9px' : '8px'};
            font-weight: ${isSelected ? '700' : '600'};
            white-space: nowrap;
            pointer-events: none;
            opacity: ${dimmed ? '0.25' : '1'};
            border: 1px solid ${isSelected ? color : 'rgba(88,123,189,0.2)'};
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            line-height: 1.4;
          ">${p.site}</span>`,
          iconSize: [0, 0],
          iconAnchor: [-(placement[0]), -(placement[1])],
        });

        return (
          <Marker
            key={`label-${p.site}`}
            position={[p.lat, p.lon]}
            icon={icon}
            interactive={false}
          />
        );
      })}
    </>
  );
}

function AutoFitBounds({ platforms }: { platforms: Platform[] }) {
  const map = useMap();

  useMemo(() => {
    if (platforms.length === 0) return;
    const bounds = L.latLngBounds(platforms.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
  }, [platforms, map]);

  return null;
}

export default function OperatorMapInner({ platforms, routes, services, operator, highlightedSite, onSiteSelect, extraRailGeometries }: Props) {
  const color = getOperatorColor(operator);
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedSite = highlightedSite !== undefined ? highlightedSite : internalSelected;
  const setSelectedSite = onSiteSelect || setInternalSelected;
  const [baseRailGeometries, setBaseRailGeometries] = useState<Record<string, [number, number][]>>({});
  const [railLoaded, setRailLoaded] = useState(false);

  // Load rail geometries (same as main map page.tsx)
  useEffect(() => {
    fetch('/rail-geometries.json')
      .then((res) => res.json())
      .then((data) => { setBaseRailGeometries(data); setRailLoaded(true); })
      .catch(() => { setRailLoaded(true); /* fallback to bezier */ });
  }, []);

  // Merge base + extra geometries
  const railGeometries = useMemo(
    () => ({ ...baseRailGeometries, ...extraRailGeometries }),
    [baseRailGeometries, extraRailGeometries]
  );

  // Get platforms where this operator is active
  const operatorSites = useMemo(() => {
    const sites = new Set<string>();
    for (const s of services) {
      if (s.operator === operator) {
        sites.add(s.from);
        sites.add(s.to);
      }
    }
    return sites;
  }, [services, operator]);

  const operatorPlatforms = useMemo(
    () => platforms.filter((p) => operatorSites.has(p.site)),
    [platforms, operatorSites]
  );

  // Get routes where this operator is involved
  const operatorRoutes = useMemo(
    () => routes.filter((r) => r.operators.includes(operator)),
    [routes, operator]
  );

  // Compute volume per site for this operator
  const siteVolumes = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of services) {
      if (s.operator === operator) {
        m.set(s.from, (m.get(s.from) || 0) + 1);
        m.set(s.to, (m.get(s.to) || 0) + 1);
      }
    }
    return m;
  }, [services, operator]);

  // Destinations from selected site
  const selectedDestinations = useMemo(() => {
    if (!selectedSite) return [];
    return services
      .filter((s) => s.operator === operator && s.from === selectedSite)
      .reduce((acc, s) => {
        if (!acc.includes(s.to)) acc.push(s.to);
        return acc;
      }, [] as string[]);
  }, [services, operator, selectedSite]);

  if (operatorPlatforms.length === 0) {
    return (
      <div className="glass-panel rounded-lg p-4 text-center text-xs text-muted">
        Aucune plateforme géolocalisée pour cet opérateur.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg overflow-hidden h-full">
      <MapContainer
        center={[46.6, 2.8]}
        zoom={6}
        className="w-full h-full"
        preferCanvas={true}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* OSM France dark — same as main map default */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          maxZoom={19}
          className="dark-tiles"
        />
        <AutoFitBounds platforms={operatorPlatforms} />

        {/* Routes — same rendering logic as RouteLayer.tsx (wait for rail geometries to avoid bezier flash) */}
        {railLoaded && operatorRoutes.map((route, i) => {
          // Try rail geometry first (both key orders) — exact same logic as RouteLayer
          const key1 = `${route.from}||${route.to}`;
          const key2 = `${route.to}||${route.from}`;
          const railPoints = railGeometries[key1] || railGeometries[key2];

          let points: [number, number][];
          if (railPoints && railPoints.length > 0) {
            points = [...railPoints];
            // Snap endpoints to actual platform coordinates
            points[0] = [route.fromLat, route.fromLon];
            points[points.length - 1] = [route.toLat, route.toLon];
            // If we used the reversed key, swap endpoints
            if (!railGeometries[key1] && railGeometries[key2]) {
              points[0] = [route.toLat, route.toLon];
              points[points.length - 1] = [route.fromLat, route.fromLon];
            }
          } else {
            // Fallback to bezier curves
            points = getBezierPoints(
              route.fromLat,
              route.fromLon,
              route.toLat,
              route.toLon
            );
          }

          const style = getRouteStyle(route.freq, color);

          const isConnected = selectedSite
            ? route.from === selectedSite || route.to === selectedSite
            : false;
          const dimmed = selectedSite && !isConnected;

          return (
            <Polyline
              key={`${route.from}-${route.to}-${i}`}
              positions={points}
              pathOptions={{
                ...style,
                opacity: dimmed ? 0.08 : isConnected ? 1 : style.opacity,
                weight: isConnected ? style.weight + 1.5 : dimmed ? 1 : style.weight,
              }}
            />
          );
        })}

        {/* Platform markers — same styling as PlatformMarkers.tsx */}
        {operatorPlatforms.map((platform) => {
          const volume = siteVolumes.get(platform.site) || 0;
          const size = getMarkerSize(volume);
          const isFrance = platform.pays?.toLowerCase() === 'france';
          const isSelected = platform.site === selectedSite;
          const isConnectedDest = selectedSite ? selectedDestinations.includes(platform.site) || platform.site === selectedSite : false;
          const dimmed = selectedSite && !isConnectedDest;

          // Same colors as main map: France = #587bbd, International = #a78bfa
          const markerColor = isFrance ? '#587bbd' : '#a78bfa';

          return (
            <CircleMarker
              key={platform.site}
              center={[platform.lat, platform.lon]}
              radius={isSelected ? size + 3 : size}
              pathOptions={{
                fillColor: markerColor,
                color: isSelected ? '#ffffff' : markerColor,
                fillOpacity: dimmed ? 0.15 : 0.7,
                weight: isSelected ? 3 : 2,
                opacity: dimmed ? 0.2 : 1,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setSelectedSite(isSelected ? null : platform.site);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -size]} opacity={0.95}>
                <div className="text-xs">
                  <strong>{platform.site}</strong>
                  <br />
                  {platform.ville && <span>{platform.ville}</span>}
                  {platform.pays !== 'France' && <span> — {platform.pays}</span>}
                  <br />
                  <span className="font-mono" style={{ color }}>{volume} trains/sem</span>
                  {isSelected && selectedDestinations.length > 0 && (
                    <>
                      <br />
                      <span style={{ color: '#8893a7' }}>
                        → {selectedDestinations.join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Labels de noms de sites */}
        <SiteLabels
          platforms={operatorPlatforms}
          selectedSite={selectedSite}
          selectedDestinations={selectedDestinations}
          siteVolumes={siteVolumes}
          color={color}
        />
      </MapContainer>

      {/* Legend bar — dark theme to match */}
      <div className="bg-bg/90 backdrop-blur-sm border-t border-border px-3 py-1.5 flex items-center gap-4 text-[10px] text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{operatorPlatforms.length} site{operatorPlatforms.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
          <span>{operatorRoutes.length} liaison{operatorRoutes.length > 1 ? 's' : ''}</span>
        </div>
        {selectedSite && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-medium text-text">{selectedSite}</span>
            <span>→ {selectedDestinations.length} destination{selectedDestinations.length > 1 ? 's' : ''}</span>
            <button onClick={() => setSelectedSite(null)} className="text-muted hover:text-text ml-1">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
