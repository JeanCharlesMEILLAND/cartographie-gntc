'use client';

import { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { Platform, AggregatedRoute, Service } from '@/lib/types';

function MapClickHandler() {
  const setSelectedPlatform = useFilterStore((s) => s.setSelectedPlatform);
  const setSelectedCorridor = useFilterStore((s) => s.setSelectedCorridor);
  useMapEvents({
    click: () => {
      setSelectedPlatform(null);
      setSelectedCorridor(null);
    },
  });
  return null;
}

function CustomPanes() {
  const map = useMap();
  useEffect(() => {
    if (!map.getPane('portPane')) {
      const pane = map.createPane('portPane');
      pane.style.zIndex = '350'; // Below markerPane (600) so platforms stay clickable
    }
  }, [map]);
  return null;
}

function MapZoomHandler() {
  const map = useMap();
  const mapZoomTarget = useSearchStore((s) => s.mapZoomTarget);
  const setMapZoomTarget = useSearchStore((s) => s.setMapZoomTarget);

  useEffect(() => {
    if (mapZoomTarget) {
      map.flyTo([mapZoomTarget.lat, mapZoomTarget.lon], mapZoomTarget.zoom, { duration: 1.2 });
      setMapZoomTarget(null);
    }
  }, [mapZoomTarget, map, setMapZoomTarget]);

  return null;
}
import FranceBorder from './FranceBorder';
import RouteLayer from './RouteLayer';
import TrainMarkers from './TrainMarkers';
import WaterwayLayer from './WaterwayLayer';
import PortLayer from './PortLayer';
import PlatformMarkers from './PlatformMarkers';
import SearchRouteOverlay from './SearchRouteOverlay';
import 'leaflet/dist/leaflet.css';

interface MapInnerProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
  railGeometries?: Record<string, [number, number][]>;
  services?: Service[];
  allPlatforms?: Platform[];
}

const TILE_URLS: Record<string, string> = {
  'osm-dark': 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
  'osm': 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
  'carto-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  'carto-light': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  'voyager': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  'topo': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

// Tiles that need CSS darkening filter
const DARK_TILES = new Set(['osm-dark']);

export default function MapInner({ platforms, routes, railGeometries, services, allPlatforms }: MapInnerProps) {
  const tileStyle = useFilterStore((s) => s.tileStyle);

  const tileUrl = TILE_URLS[tileStyle] || TILE_URLS['carto-dark'];

  return (
    <LeafletMap
      center={[46.6, 2.8]}
      zoom={6}
      className="w-full h-full"
      preferCanvas={true}
      zoomControl={false}
      style={tileStyle === 'none' ? { background: '#f0f0f0' } : undefined}
    >
      {tileStyle !== 'none' && (
        <TileLayer
          key={tileStyle}
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          maxZoom={19}
          className={DARK_TILES.has(tileStyle) ? 'dark-tiles' : undefined}
        />
      )}
      <ZoomControl position="bottomright" />
      <MapClickHandler />
      <MapZoomHandler />
      <CustomPanes />
      <FranceBorder />
      <RouteLayer routes={routes} railGeometries={railGeometries} />
      <WaterwayLayer />
      <PortLayer />
      {services && allPlatforms && (
        <TrainMarkers services={services} platforms={allPlatforms} railGeometries={railGeometries} />
      )}
      <SearchRouteOverlay railGeometries={railGeometries} />
      <PlatformMarkers platforms={platforms} routes={routes} />
    </LeafletMap>
  );
}
