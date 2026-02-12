'use client';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
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
}

function getRouteStyle(freq: number, color: string) {
  if (freq > 30) return { weight: 4, color, opacity: 0.9 };
  if (freq > 15) return { weight: 3.5, color, opacity: 0.85 };
  if (freq > 8) return { weight: 3, color, opacity: 0.75 };
  if (freq > 3) return { weight: 2.5, color, opacity: 0.65 };
  return { weight: 2, color, opacity: 0.5 };
}

function AutoFitBounds({ platforms }: { platforms: Platform[] }) {
  const map = useMap();

  useMemo(() => {
    if (platforms.length === 0) return;
    const bounds = L.latLngBounds(platforms.map((p) => [p.lat, p.lon]));
    // Pad a bit so markers aren't on the edge
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
  }, [platforms, map]);

  return null;
}

export default function OperatorMapInner({ platforms, routes, services, operator }: Props) {
  const color = getOperatorColor(operator);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

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
    <div className="glass-panel rounded-lg overflow-hidden" style={{ height: 400 }}>
      <MapContainer
        center={[46.6, 2.8]}
        zoom={6}
        className="w-full h-full"
        preferCanvas={true}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />
        <AutoFitBounds platforms={operatorPlatforms} />

        {/* Routes */}
        {operatorRoutes.map((route, i) => {
          const points = getBezierPoints(
            route.fromLat,
            route.fromLon,
            route.toLat,
            route.toLon
          );
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
                opacity: dimmed ? 0.15 : isConnected ? 1 : style.opacity,
                weight: isConnected ? style.weight + 1.5 : dimmed ? 1 : style.weight,
              }}
            />
          );
        })}

        {/* Platform markers */}
        {operatorPlatforms.map((platform) => {
          const volume = siteVolumes.get(platform.site) || 0;
          const isSelected = platform.site === selectedSite;
          const isConnectedDest = selectedSite ? selectedDestinations.includes(platform.site) || platform.site === selectedSite : false;
          const dimmed = selectedSite && !isConnectedDest;

          // Size based on volume
          const radius = Math.max(5, Math.min(14, 5 + (volume / 20) * 4));

          return (
            <CircleMarker
              key={platform.site}
              center={[platform.lat, platform.lon]}
              radius={isSelected ? radius + 3 : radius}
              pathOptions={{
                fillColor: color,
                color: isSelected ? '#ffffff' : color,
                fillOpacity: dimmed ? 0.2 : 0.8,
                weight: isSelected ? 3 : 2,
                opacity: dimmed ? 0.3 : 1,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setSelectedSite(isSelected ? null : platform.site);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                <div style={{ fontSize: 11 }}>
                  <strong>{platform.site}</strong>
                  <br />
                  {platform.ville && <span>{platform.ville}</span>}
                  {platform.pays !== 'France' && <span> — {platform.pays}</span>}
                  <br />
                  <span style={{ fontFamily: 'monospace', color }}>{volume} trains/sem</span>
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
      </MapContainer>

      {/* Legend bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-border px-3 py-1.5 flex items-center gap-4 text-[10px] text-muted z-[1000]" style={{ position: 'relative' }}>
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
