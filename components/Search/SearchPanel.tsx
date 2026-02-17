'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchStore, UTIType } from '@/store/useSearchStore';
import { Platform, Service, AggregatedRoute } from '@/lib/types';
import {
  findPlatformsAsync,
  findCitySuggestionsAsync,
  getDirectDestinationCities,
  findRoutes,
  getTrainVolume,
  geocodeCity,
  haversineKm,
  FoundRoute,
  RouteLeg,
  CitySuggestion,
} from '@/lib/routeFinder';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorContact, hasContact, getOperatorLogo } from '@/lib/operatorContacts';
import { CO2_RAIL, CO2_ROAD, AVG_LOAD_TONNES, ROAD_FACTOR } from '@/lib/co2';

interface SearchPanelProps {
  platforms: Platform[];
  services: Service[];
  routes: AggregatedRoute[];
}

const UTI_OPTIONS: { key: UTIType; label: string; desc: string }[] = [
  { key: 'cm', label: 'CM', desc: 'Caisses mobiles' },
  { key: 'cont', label: 'Cont.', desc: 'Conteneurs' },
  { key: 'semiPre', label: 'Semi P', desc: 'Semi-remorques préhensibles' },
  { key: 'semiNon', label: 'Semi NP', desc: 'Semi-remorques non-préhensibles' },
  { key: 'p400', label: 'P400', desc: 'Semi-remorque P400' },
];

const DAY_ORDER: Record<string, number> = { Lu: 1, Ma: 2, Me: 3, Je: 4, Ve: 5, Sa: 6, Di: 7 };

function PlatformPicker({
  city,
  routes,
  selectedPlatforms,
  onPlatformsChange,
}: {
  city: CitySuggestion;
  routes: AggregatedRoute[];
  selectedPlatforms: Platform[];
  onPlatformsChange: (p: Platform[]) => void;
}) {
  const allSelected = selectedPlatforms.length === city.platforms.length;

  const toggleAll = () => {
    onPlatformsChange(allSelected ? [] : [...city.platforms]);
  };

  const toggleOne = (platform: Platform) => {
    const isSelected = selectedPlatforms.some((p) => p.site === platform.site);
    if (isSelected) {
      onPlatformsChange(selectedPlatforms.filter((p) => p.site !== platform.site));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="mt-1.5 rounded-md border border-border bg-blue/5 p-1.5 space-y-0.5">
      <button
        onClick={toggleAll}
        className={`w-full text-left text-[10px] px-2 py-1 rounded transition-colors ${
          allSelected ? 'text-cyan bg-cyan/10' : 'text-muted hover:text-text'
        }`}
      >
        Toutes les plateformes ({city.platforms.length})
      </button>
      <div className="border-t border-border/50 pt-0.5 space-y-0.5">
        {city.platforms.map((platform) => {
          const volume = getTrainVolume(platform.site, routes);
          const isSelected = selectedPlatforms.some((p) => p.site === platform.site);
          return (
            <button
              key={platform.site}
              onClick={() => toggleOne(platform)}
              className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                isSelected
                  ? 'bg-blue/10 text-text'
                  : 'text-muted hover:text-text hover:bg-blue/5'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isSelected ? 'bg-cyan' : 'bg-muted/30'
                  }`}
                />
                <span className="truncate">{platform.site}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-[9px] text-muted truncate max-w-[100px]">
                  {platform.exploitant}
                </span>
                {volume > 0 && (
                  <span className="text-[10px] font-mono text-cyan whitespace-nowrap">{volume} t/sem</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CityInput({
  value,
  onChange,
  placeholder,
  platforms,
  routes,
  selectedCity,
  onCitySelect,
  selectedPlatforms,
  onPlatformsChange,
  directDestinations,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  platforms: Platform[];
  routes: AggregatedRoute[];
  selectedCity: CitySuggestion | null;
  onCitySelect: (c: CitySuggestion | null) => void;
  selectedPlatforms: Platform[];
  onPlatformsChange: (p: Platform[]) => void;
  directDestinations?: CitySuggestion[];
}) {
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced async search for city suggestions
  useEffect(() => {
    // Don't search if a city is already selected
    if (selectedCity) {
      setSuggestions([]);
      return;
    }
    // No text: show direct destinations if available
    if (!value.trim() || value.length < 2) {
      if (directDestinations && directDestinations.length > 0) {
        setSuggestions(directDestinations);
      } else {
        setSuggestions([]);
      }
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await findCitySuggestionsAsync(value, platforms, 8);
      // Sort direct destinations first when typing
      if (directDestinations && directDestinations.length > 0) {
        const directKeys = new Set(directDestinations.map((d) => d.city.toLowerCase().trim()));
        const direct = results.filter((r) => directKeys.has(r.city.toLowerCase().trim()));
        const other = results.filter((r) => !directKeys.has(r.city.toLowerCase().trim()));
        setSuggestions([...direct, ...other]);
      } else {
        setSuggestions(results);
      }
      setLoading(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, platforms, selectedCity, directDestinations]);

  const showSuggestions = focused && !selectedCity && (suggestions.length > 0 || loading);

  const handleCitySelect = useCallback(
    (city: CitySuggestion) => {
      onCitySelect(city);
      onChange(city.city);
      // Auto-select all platforms
      onPlatformsChange([...city.platforms]);
      setFocused(false);
      setSelectedIndex(-1);
      setSuggestions([]);
    },
    [onChange, onCitySelect, onPlatformsChange]
  );

  const handleClearCity = () => {
    onCitySelect(null);
    onPlatformsChange([]);
    onChange('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedCity && e.key === 'Escape') {
      handleClearCity();
      return;
    }
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleCitySelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  return (
    <div className="relative">
      {/* State A: City selected — show chip */}
      {selectedCity ? (
        <div className="w-full text-xs bg-white border border-blue/30 rounded-md px-3 py-2 text-text flex items-center justify-between">
          <span className="truncate">
            <span className="font-medium">{selectedCity.city}</span>
            <span className="text-muted ml-1.5 text-[10px]">
              {selectedCity.platforms.length} plateforme
              {selectedCity.platforms.length > 1 ? 's' : ''}
            </span>
          </span>
          <button
            onClick={handleClearCity}
            className="text-muted hover:text-text ml-2 flex-shrink-0 p-0.5"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 2L8 8M2 8L8 2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        /* State B: No city selected — show input */
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-xs bg-white border border-border rounded-md px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:border-blue/50 transition-colors"
        />
      )}

      {/* City suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-md border border-border z-50 max-h-[280px] overflow-y-auto">
          {directDestinations && directDestinations.length > 0 && (!value.trim() || value.length < 2) && (
            <div className="px-3 py-1.5 text-[9px] text-muted uppercase tracking-wider border-b border-border/50">
              Destinations directes ({directDestinations.length})
            </div>
          )}
          {loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-[10px] text-muted animate-pulse">
              Recherche des villes proches...
            </div>
          )}
          {suggestions.map((city, i) => {
            const isDirect = directDestinations?.some(
              (d) => d.city.toLowerCase().trim() === city.city.toLowerCase().trim()
            );
            return (
              <button
                key={`${city.city}-${city.lat}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCitySelect(city);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  i === selectedIndex
                    ? 'bg-blue/20 text-text'
                    : 'text-text hover:bg-blue/8'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{city.city}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDirect && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">
                        Direct
                      </span>
                    )}
                    <span className="text-[10px] text-muted">
                      {city.platforms.length} plateforme
                      {city.platforms.length > 1 ? 's' : ''}
                    </span>
                    {city.distance !== null && (
                      <span className="text-[10px] font-mono text-cyan">
                        {city.distance} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-muted">
                  {city.departement ? `${city.departement} - ` : ''}
                  {city.pays || ''}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Platform picker — shown when city is selected and has multiple platforms */}
      {selectedCity && selectedCity.platforms.length > 1 && (
        <PlatformPicker
          city={selectedCity}
          routes={routes}
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={onPlatformsChange}
        />
      )}
    </div>
  );
}

function LegDetail({ leg }: { leg: RouteLeg }) {
  const color = getOperatorColor(leg.operator);
  const sorted = [...leg.services].sort(
    (a, b) => (DAY_ORDER[a.dayDep] || 8) - (DAY_ORDER[b.dayDep] || 8)
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-semibold text-text">{leg.operator}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted ml-3.5">
        <span className="text-text">{leg.from}</span>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="flex-shrink-0">
          <path d="M1 4H9M9 4L6 1M9 4L6 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-text">{leg.to}</span>
      </div>
      {sorted.length > 0 && (
        <table className="w-full text-[10px] ml-3.5">
          <thead>
            <tr className="text-muted">
              <th className="text-left font-normal py-0.5 pr-1">Jour</th>
              <th className="text-left font-normal py-0.5 pr-1">HLR</th>
              <th className="text-left font-normal py-0.5 pr-1">Arr.</th>
              <th className="text-left font-normal py-0.5">MAD</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 5).map((s, j) => (
              <tr key={j} className="text-text">
                <td className="py-0.5 pr-1">{s.dayDep}</td>
                <td className="py-0.5 pr-1 font-mono text-cyan">{s.timeDep || '—'}</td>
                <td className="py-0.5 pr-1">{s.dayArr}</td>
                <td className="py-0.5 font-mono text-cyan">{s.timeArr || '—'}</td>
              </tr>
            ))}
            {sorted.length > 5 && (
              <tr>
                <td colSpan={4} className="text-[9px] text-muted py-0.5">
                  +{sorted.length - 5} autres départs
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** Pre/post road routing info */
interface RoadRouting {
  originCity: string;
  originLat: number;
  originLon: number;
  destCity: string;
  destLat: number;
  destLon: number;
}

/** Road segment display (truck icon + city → platform + distance) */
function RoadSegment({ from, to, distKm }: { from: string; to: string; distKm: number }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-orange-400">
        <rect x="1" y="4" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" />
        <path d="M9 6H11.5L13 8V10H9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="11.5" r="1" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="11" cy="11.5" r="1" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      <span className="truncate">
        <span className="text-text">{from}</span>
        {' → '}
        <span className="text-text">{to}</span>
      </span>
      <span className="font-mono text-orange-400 flex-shrink-0">{distKm} km</span>
    </div>
  );
}

function RouteCard({
  route,
  index,
  isHighlighted,
  onHighlight,
  roadRouting,
}: {
  route: FoundRoute;
  index: number;
  isHighlighted: boolean;
  onHighlight: (i: number | null) => void;
  roadRouting?: RoadRouting | null;
}) {
  const [expanded, setExpanded] = useState(false);

  // Calculate pre/post routing distances
  const firstLeg = route.legs[0];
  const lastLeg = route.legs[route.legs.length - 1];

  const preRoutingDist = roadRouting
    ? Math.round(haversineKm(roadRouting.originLat, roadRouting.originLon, firstLeg.fromLat, firstLeg.fromLon))
    : 0;
  const postRoutingDist = roadRouting
    ? Math.round(haversineKm(roadRouting.destLat, roadRouting.destLon, lastLeg.toLat, lastLeg.toLon))
    : 0;

  const showPreRouting = preRoutingDist > 5;
  const showPostRouting = postRoutingDist > 5;

  return (
    <div
      className={`rounded-md border transition-colors cursor-pointer ${
        isHighlighted
          ? 'border-cyan/50 bg-[rgba(56,217,245,0.08)]'
          : 'border-border hover:border-blue/30 bg-blue/5'
      }`}
      onClick={() => onHighlight(isHighlighted ? null : index)}
    >
      {/* Summary */}
      <div className="p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                route.type === 'direct'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-orange-500/20 text-orange-400'
              }`}
            >
              {route.type === 'direct' ? 'Direct' : 'Correspondance'}
            </span>
            <span className="text-[10px] font-mono text-cyan">{route.totalFreq} t/sem</span>
          </div>
          <div className="flex items-center gap-1">
            {route.operators.map((op) => {
              const logo = getOperatorLogo(op);
              return logo ? (
                <img key={op} src={logo} alt={op} title={op} className="w-4 h-4 rounded-sm object-contain" />
              ) : (
                <div
                  key={op}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getOperatorColor(op) }}
                  title={op}
                />
              );
            })}
          </div>
        </div>

        {/* Full route path with pre/post routing */}
        <div className="space-y-1">
          {/* Pre-routing: truck from origin to departure platform */}
          {showPreRouting && roadRouting && (
            <RoadSegment from={roadRouting.originCity} to={firstLeg.from} distKm={preRoutingDist} />
          )}

          {/* Rail legs */}
          <div className="flex items-center gap-1 text-xs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-cyan">
              <rect x="3" y="1" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1" />
              <line x1="3" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="5" cy="13" r="0.8" fill="currentColor" />
              <circle cx="9" cy="13" r="0.8" fill="currentColor" />
              <line x1="5" y1="11" x2="5" y2="13" stroke="currentColor" strokeWidth="0.8" />
              <line x1="9" y1="11" x2="9" y2="13" stroke="currentColor" strokeWidth="0.8" />
            </svg>
            {route.legs.map((leg, i) => (
              <div key={i} className="flex items-center gap-1 min-w-0">
                {i === 0 && (
                  <span className="text-text font-medium truncate">{leg.from}</span>
                )}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="flex-shrink-0">
                  <path d="M1 4H11M11 4L8 1M11 4L8 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: getOperatorColor(leg.operator) }} />
                </svg>
                <span className="text-text font-medium truncate">{leg.to}</span>
              </div>
            ))}
          </div>

          {/* Post-routing: truck from arrival platform to destination */}
          {showPostRouting && roadRouting && (
            <RoadSegment from={lastLeg.to} to={roadRouting.destCity} distKm={postRoutingDist} />
          )}
        </div>

        {/* Operators */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {route.operators.map((op) => {
            const logo = getOperatorLogo(op);
            return (
              <span
                key={op}
                className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{
                  backgroundColor: `${getOperatorColor(op)}20`,
                  color: getOperatorColor(op),
                }}
              >
                {logo && <img src={logo} alt="" className="w-3 h-3 rounded-sm object-contain" />}
                {op}
              </span>
            );
          })}
        </div>

        {/* CO2 comparison: combined transport vs full road */}
        {roadRouting && (() => {
          // Rail distance (sum of all legs)
          const railKm = route.legs.reduce((sum, l) => sum + haversineKm(l.fromLat, l.fromLon, l.toLat, l.toLon), 0);
          // Full road distance: origin → destination (haversine × road factor)
          const fullRoadKm = haversineKm(roadRouting.originLat, roadRouting.originLon, roadRouting.destLat, roadRouting.destLon) * ROAD_FACTOR;
          // Combined: road pre + rail + road post (per UTI = 20t)
          const co2Combined = Math.round(
            (preRoutingDist * ROAD_FACTOR * AVG_LOAD_TONNES * CO2_ROAD +
             railKm * AVG_LOAD_TONNES * CO2_RAIL +
             postRoutingDist * ROAD_FACTOR * AVG_LOAD_TONNES * CO2_ROAD) / 1000
          );
          // Full road (per UTI = 20t)
          const co2FullRoad = Math.round((fullRoadKm * AVG_LOAD_TONNES * CO2_ROAD) / 1000);
          const savingsPercent = co2FullRoad > 0 ? Math.round((1 - co2Combined / co2FullRoad) * 100) : 0;
          const savingsKg = co2FullRoad - co2Combined;
          // Energy savings: diesel saved in liters (road diesel per km vs electric rail)
          const dieselFullRoad = Math.round(fullRoadKm * 0.32); // ~0.32 L/km for a 40t truck
          const dieselCombined = Math.round((preRoutingDist * ROAD_FACTOR + postRoutingDist * ROAD_FACTOR) * 0.32);
          const dieselSaved = dieselFullRoad - dieselCombined;

          if (co2FullRoad <= 0) return null;

          const barWidth = Math.max(5, Math.round((co2Combined / co2FullRoad) * 100));

          return (
            <div className="mt-2 rounded-md border border-green-500/20 bg-green-500/5 p-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                  <path d="M6 1C3 1 2 4 2 6C2 8 4 11 6 11C8 11 10 8 10 6C10 4 9 1 6 1Z" stroke="currentColor" strokeWidth="1" />
                  <path d="M6 4V7M4.5 5.5L6 7L7.5 5.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                -{savingsPercent}% CO₂ vs tout routier
              </div>
              {/* Visual bars */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-muted w-[52px] flex-shrink-0">Routier</span>
                  <div className="flex-1 h-3 rounded-full bg-red-500/15 relative overflow-hidden">
                    <div className="h-full rounded-full bg-red-400/60" style={{ width: '100%' }} />
                  </div>
                  <span className="font-mono text-red-400 w-[46px] text-right flex-shrink-0">{co2FullRoad} kg</span>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-muted w-[52px] flex-shrink-0">Combiné</span>
                  <div className="flex-1 h-3 rounded-full bg-green-500/15 relative overflow-hidden">
                    <div className="h-full rounded-full bg-green-400/60" style={{ width: `${barWidth}%` }} />
                  </div>
                  <span className="font-mono text-green-400 w-[46px] text-right flex-shrink-0">{co2Combined} kg</span>
                </div>
              </div>
              <div className="text-[9px] text-muted">
                Économie : <span className="text-green-400 font-medium">{savingsKg} kg CO₂</span> et <span className="text-green-400 font-medium">{dieselSaved} L</span> de diesel par envoi (20t)
              </div>
            </div>
          );
        })()}

        {/* Operator contacts */}
        {route.operators.some(hasContact) && (
          <div className="mt-2 space-y-1 border-t border-border/50 pt-1.5">
            {route.operators.filter(hasContact).map((op) => {
              const c = getOperatorContact(op)!;
              const color = getOperatorColor(op);
              return (
                <div key={op} className="flex items-center gap-2 text-[10px]">
                  {c.logo ? (
                    <img src={c.logo} alt="" className="w-3.5 h-3.5 rounded-sm object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  )}
                  <span className="text-muted truncate">{op}</span>
                  {c.email && (
                    <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors flex-shrink-0">
                      email
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors flex-shrink-0">
                      tel
                    </a>
                  )}
                  {c.website && (
                    <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors flex-shrink-0">
                      web
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expand button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="w-full text-[10px] text-muted hover:text-blue py-1 border-t border-border transition-colors"
      >
        {expanded ? 'Masquer les horaires' : 'Voir les horaires'}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-2 border-t border-border pt-2">
          {route.legs.map((leg, i) => (
            <div key={i}>
              {route.legs.length > 1 && (
                <div className="text-[9px] text-muted mb-1">
                  Troncon {i + 1}
                </div>
              )}
              <LegDetail leg={leg} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPanel({ platforms, services, routes }: SearchPanelProps) {
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [roadRouting, setRoadRouting] = useState<RoadRouting | null>(null);
  const {
    searchOpen,
    setSearchOpen,
    departureQuery,
    arrivalQuery,
    selectedUTI,
    departureCitySuggestion,
    arrivalCitySuggestion,
    departureSelectedPlatforms,
    arrivalSelectedPlatforms,
    results,
    searching,
    highlightedRouteIndex,
    setDepartureQuery,
    setArrivalQuery,
    toggleUTI,
    setDepartureCitySuggestion,
    setArrivalCitySuggestion,
    setDepartureSelectedPlatforms,
    setArrivalSelectedPlatforms,
    setResults,
    setSearching,
    setHighlightedRouteIndex,
    clearSearch,
  } = useSearchStore();

  // Compute direct destinations when departure is selected
  const directDestinations = useMemo(() => {
    if (departureSelectedPlatforms.length === 0) return [];
    const depSites = new Set(departureSelectedPlatforms.map((p) => p.site));
    return getDirectDestinationCities(depSites, services, platforms);
  }, [departureSelectedPlatforms, services, platforms]);

  // Compute which UTI types are available from selected departure platforms
  const availableUTI = useMemo(() => {
    const available = new Set<UTIType>();
    if (departureSelectedPlatforms.length === 0 && !departureCitySuggestion) {
      // No departure selected — all UTI available (don't restrict)
      return null;
    }
    const depSites = new Set(
      departureSelectedPlatforms.length > 0
        ? departureSelectedPlatforms.map((p) => p.site)
        : departureCitySuggestion?.platforms.map((p) => p.site) || []
    );
    for (const svc of services) {
      if (!depSites.has(svc.from) && !depSites.has(svc.to)) continue;
      if (svc.acceptsCM === 'Oui' || svc.acceptsCM === 'oui') available.add('cm');
      if (svc.acceptsCont === 'Oui' || svc.acceptsCont === 'oui') available.add('cont');
      if (svc.acceptsSemiPre === 'Oui' || svc.acceptsSemiPre === 'oui') available.add('semiPre');
      if (svc.acceptsSemiNon === 'Oui' || svc.acceptsSemiNon === 'oui') available.add('semiNon');
      if (svc.acceptsP400 === 'Oui' || svc.acceptsP400 === 'oui') available.add('p400');
    }
    return available;
  }, [departureSelectedPlatforms, departureCitySuggestion, services]);

  const handleSearch = useCallback(async () => {
    if (!departureQuery.trim() || !arrivalQuery.trim()) return;

    setSearching(true);
    setHighlightedRouteIndex(null);

    // Use pre-selected platforms if available, otherwise fall back to text search
    let depPlatforms: Platform[];
    let arrPlatforms: Platform[];

    if (departureSelectedPlatforms.length > 0) {
      depPlatforms = departureSelectedPlatforms;
    } else if (departureCitySuggestion) {
      depPlatforms = departureCitySuggestion.platforms;
    } else {
      const depSuggestions = await findPlatformsAsync(departureQuery, platforms, 5, services);
      depPlatforms = depSuggestions.map((s) => s.platform);
    }

    if (arrivalSelectedPlatforms.length > 0) {
      arrPlatforms = arrivalSelectedPlatforms;
    } else if (arrivalCitySuggestion) {
      arrPlatforms = arrivalCitySuggestion.platforms;
    } else {
      const arrSuggestions = await findPlatformsAsync(arrivalQuery, platforms, 5, services);
      arrPlatforms = arrSuggestions.map((s) => s.platform);
    }

    if (depPlatforms.length === 0 || arrPlatforms.length === 0) {
      setResults([]);
      setSearching(false);
      return;
    }

    // Geocode origin/destination cities for pre/post routing display
    const [originGeo, destGeo] = await Promise.all([
      geocodeCity(departureQuery),
      geocodeCity(arrivalQuery),
    ]);
    if (originGeo && destGeo) {
      setRoadRouting({
        originCity: departureCitySuggestion?.city || departureQuery,
        originLat: originGeo.lat,
        originLon: originGeo.lon,
        destCity: arrivalCitySuggestion?.city || arrivalQuery,
        destLat: destGeo.lat,
        destLon: destGeo.lon,
      });
    } else {
      setRoadRouting(null);
    }

    const found = findRoutes(depPlatforms, arrPlatforms, platforms, services, selectedUTI);
    setResults(found);
    setSearching(false);
    // Auto-select first result and collapse form to maximize result space
    if (found.length > 0) {
      setHighlightedRouteIndex(0);
      setFormCollapsed(true);
    }
  }, [
    departureQuery, arrivalQuery, selectedUTI, platforms, services,
    departureSelectedPlatforms, arrivalSelectedPlatforms,
    departureCitySuggestion, arrivalCitySuggestion,
    setResults, setSearching, setHighlightedRouteIndex,
  ]);

  // Auto re-search when UTI filter changes (if a search was already done)
  const hasSearched = useRef(false);
  useEffect(() => {
    if (hasSearched.current && departureQuery.trim() && arrivalQuery.trim()) {
      handleSearch();
    }
  }, [selectedUTI]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track that a manual search was triggered
  const originalHandleSearch = handleSearch;
  const wrappedHandleSearch = useCallback(async () => {
    hasSearched.current = true;
    await originalHandleSearch();
  }, [originalHandleSearch]);

  // Swap departure/arrival (including city selections)
  const handleSwap = () => {
    const depQ = departureQuery;
    const depCity = departureCitySuggestion;
    const depPlats = departureSelectedPlatforms;

    setDepartureQuery(arrivalQuery);
    setDepartureCitySuggestion(arrivalCitySuggestion);
    setDepartureSelectedPlatforms(arrivalSelectedPlatforms);

    setArrivalQuery(depQ);
    setArrivalCitySuggestion(depCity);
    setArrivalSelectedPlatforms(depPlats);
  };

  // Reset form collapse state when panel reopens with no results
  useEffect(() => {
    if (searchOpen && results.length === 0) {
      setFormCollapsed(false);
    }
  }, [searchOpen, results.length]);

  if (!searchOpen) return null;

  return (
    <div className="absolute top-[50px] right-0 bottom-0 z-[999] glass-panel w-[320px] sm:w-[360px] flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-display font-bold gntc-gradient">
          Trouver un transport
        </h2>
        <button
          onClick={() => setSearchOpen(false)}
          className="text-muted hover:text-text transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Collapsed form summary — shown when results are displayed */}
      {formCollapsed && results.length > 0 ? (
        <div className="px-3 py-2 border-b border-border">
          <button
            onClick={() => setFormCollapsed(false)}
            className="w-full flex items-center gap-2 text-left group"
          >
            <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs">
              <span className="font-medium text-text truncate">{departureQuery || '?'}</span>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="flex-shrink-0 text-muted">
                <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium text-text truncate">{arrivalQuery || '?'}</span>
            </div>
            <span className="text-[10px] text-muted group-hover:text-blue transition-colors flex-shrink-0">
              Modifier
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 text-muted group-hover:text-blue transition-colors">
              <path d="M9 2.5L10 3.5L4.5 9H3.5V8L9 2.5Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {selectedUTI.size > 0 && (
            <div className="flex gap-1 mt-1">
              {UTI_OPTIONS.filter((u) => selectedUTI.has(u.key)).map((u) => (
                <span key={u.key} className="text-[9px] px-1.5 py-0.5 rounded border border-cyan/30 text-cyan bg-cyan/5">{u.label}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Full search form — takes all space when no results */
        <div className={`p-3 pb-2 space-y-2.5 overflow-y-auto ${results.length > 0 ? 'border-b border-border' : 'flex-1'}`}>
          {!results.length && (
            <p className="text-[10px] text-muted leading-snug">
              Indiquez votre point de départ et d&apos;arrivée pour découvrir les solutions disponibles.
            </p>
          )}

          {/* Departure */}
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
              D&apos;où partent vos marchandises ?
            </label>
            <CityInput
              value={departureQuery}
              onChange={setDepartureQuery}
              placeholder="Ex: Lyon, Marseille, Paris..."
              platforms={platforms}
              routes={routes}
              selectedCity={departureCitySuggestion}
              onCitySelect={setDepartureCitySuggestion}
              selectedPlatforms={departureSelectedPlatforms}
              onPlatformsChange={setDepartureSelectedPlatforms}
            />
          </div>

          {/* Swap button */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwap}
              className="text-muted hover:text-blue transition-colors p-1 rounded-md hover:bg-blue/8"
              title="Inverser"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M5 3V13M5 13L2 10M5 13L8 10M11 13V3M11 3L8 6M11 3L14 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Arrival */}
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
              Où doivent-elles arriver ?
            </label>
            <CityInput
              value={arrivalQuery}
              onChange={setArrivalQuery}
              placeholder="Ex: Bordeaux, Lille, Fos..."
              platforms={platforms}
              routes={routes}
              selectedCity={arrivalCitySuggestion}
              onCitySelect={setArrivalCitySuggestion}
              selectedPlatforms={arrivalSelectedPlatforms}
              onPlatformsChange={setArrivalSelectedPlatforms}
              directDestinations={directDestinations}
            />
          </div>

          {/* UTI Filter */}
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
              Type de chargement (optionnel)
            </label>
            <div className="flex flex-wrap gap-1">
              {UTI_OPTIONS.map((uti) => {
                const active = selectedUTI.has(uti.key);
                const disabled = availableUTI !== null && !availableUTI.has(uti.key);
                return (
                  <button
                    key={uti.key}
                    onClick={() => !disabled && toggleUTI(uti.key)}
                    disabled={disabled}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                      disabled
                        ? 'border-border/50 text-muted/40 cursor-not-allowed line-through'
                        : active
                          ? 'border-cyan/50 bg-cyan/10 text-cyan'
                          : 'border-border text-muted hover:text-text hover:border-blue/30'
                    }`}
                    title={disabled ? `${uti.desc} — non disponible sur cette liaison` : uti.desc}
                  >
                    {uti.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search button — inside form when no results */}
          <button
            onClick={wrappedHandleSearch}
            disabled={!departureQuery.trim() || !arrivalQuery.trim() || searching}
            className="w-full text-xs py-2 rounded-lg gntc-gradient-bg text-white font-semibold transition-all hover:shadow-md hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
          >
            {searching ? 'Recherche en cours...' : 'Trouver les solutions disponibles'}
          </button>
        </div>
      )}

      {/* Results — only shown when there are results */}
      {results.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted uppercase tracking-wider">
              {results.length} solution{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { clearSearch(); setFormCollapsed(false); setRoadRouting(null); }}
              className="text-[10px] text-muted hover:text-orange transition-colors"
            >
              Effacer
            </button>
          </div>
          {results.map((route, i) => (
            <RouteCard
              key={i}
              route={route}
              index={i}
              isHighlighted={highlightedRouteIndex === i}
              onHighlight={setHighlightedRouteIndex}
              roadRouting={roadRouting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
