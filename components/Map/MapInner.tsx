'use client';

import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { useFilterStore } from '@/store/useFilterStore';
import { Platform, AggregatedRoute } from '@/lib/types';
import FranceBorder from './FranceBorder';
import RailwayOverlay from './RailwayOverlay';
import RouteLayer from './RouteLayer';
import PlatformMarkers from './PlatformMarkers';
import HubLabels from './HubLabels';
import 'leaflet/dist/leaflet.css';

interface MapInnerProps {
  platforms: Platform[];
  routes: AggregatedRoute[];
  majorHubs: Platform[];
  railGeometries?: Record<string, [number, number][]>;
}

const TILE_URLS: Record<string, string> = {
  'carto-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  'carto-light': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  'voyager': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  'osm': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  'topo': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

export default function MapInner({ platforms, routes, majorHubs, railGeometries }: MapInnerProps) {
  const tileStyle = useFilterStore((s) => s.tileStyle);

  const tileUrl = TILE_URLS[tileStyle] || TILE_URLS['carto-dark'];

  return (
    <LeafletMap
      center={[46.6, 2.8]}
      zoom={6}
      className="w-full h-full"
      preferCanvas={true}
      zoomControl={true}
    >
      <TileLayer
        key={tileStyle}
        url={tileUrl}
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        maxZoom={19}
      />
      <FranceBorder />
      <RailwayOverlay />
      <RouteLayer routes={routes} railGeometries={railGeometries} />
      <PlatformMarkers platforms={platforms} routes={routes} />
      <HubLabels platforms={majorHubs} />
    </LeafletMap>
  );
}
