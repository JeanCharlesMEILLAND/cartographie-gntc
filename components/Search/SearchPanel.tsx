'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchStore, UTIType } from '@/store/useSearchStore';
import { Platform, Service, AggregatedRoute } from '@/lib/types';
import {
  findPlatformsAsync,
  findCitySuggestionsAsync,
  findRoutes,
  getTrainVolume,
  FoundRoute,
  RouteLeg,
  CitySuggestion,
} from '@/lib/routeFinder';
import { getOperatorColor } from '@/lib/colors';

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
    <div className="mt-1.5 rounded-md border border-border bg-[rgba(10,15,30,0.5)] p-1.5 space-y-0.5">
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
                  : 'text-muted hover:text-text hover:bg-[rgba(20,30,60,0.3)]'
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
    if (!value.trim() || value.length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await findCitySuggestionsAsync(value, platforms, 8);
      setSuggestions(results);
      setLoading(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, platforms, selectedCity]);

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
        <div className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-blue/30 rounded-md px-3 py-2 text-text flex items-center justify-between">
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
          className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:border-blue/50 transition-colors"
        />
      )}

      {/* City suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-md border border-border z-50 max-h-[280px] overflow-y-auto">
          {loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-[10px] text-muted animate-pulse">
              Recherche des villes proches...
            </div>
          )}
          {suggestions.map((city, i) => (
            <button
              key={`${city.city}-${city.lat}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleCitySelect(city);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                i === selectedIndex
                  ? 'bg-blue/20 text-text'
                  : 'text-text hover:bg-[rgba(20,30,60,0.5)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{city.city}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
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
          ))}
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

function RouteCard({
  route,
  index,
  isHighlighted,
  onHighlight,
}: {
  route: FoundRoute;
  index: number;
  isHighlighted: boolean;
  onHighlight: (i: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-md border transition-colors cursor-pointer ${
        isHighlighted
          ? 'border-cyan/50 bg-[rgba(56,217,245,0.08)]'
          : 'border-border hover:border-blue/30 bg-[rgba(10,15,30,0.4)]'
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
            {route.operators.map((op) => (
              <div
                key={op}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getOperatorColor(op) }}
                title={op}
              />
            ))}
          </div>
        </div>

        {/* Route path */}
        <div className="flex items-center gap-1 text-xs">
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

        {/* Operators */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {route.operators.map((op) => (
            <span
              key={op}
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${getOperatorColor(op)}20`,
                color: getOperatorColor(op),
              }}
            >
              {op}
            </span>
          ))}
        </div>
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
      const depSuggestions = await findPlatformsAsync(departureQuery, platforms, 5);
      depPlatforms = depSuggestions.map((s) => s.platform);
    }

    if (arrivalSelectedPlatforms.length > 0) {
      arrPlatforms = arrivalSelectedPlatforms;
    } else if (arrivalCitySuggestion) {
      arrPlatforms = arrivalCitySuggestion.platforms;
    } else {
      const arrSuggestions = await findPlatformsAsync(arrivalQuery, platforms, 5);
      arrPlatforms = arrSuggestions.map((s) => s.platform);
    }

    if (depPlatforms.length === 0 || arrPlatforms.length === 0) {
      setResults([]);
      setSearching(false);
      return;
    }

    const found = findRoutes(depPlatforms, arrPlatforms, platforms, services, selectedUTI);
    setResults(found);
    setSearching(false);
    // Auto-select first result to show on map
    if (found.length > 0) {
      setHighlightedRouteIndex(0);
    }
  }, [
    departureQuery, arrivalQuery, selectedUTI, platforms, services,
    departureSelectedPlatforms, arrivalSelectedPlatforms,
    departureCitySuggestion, arrivalCitySuggestion,
    setResults, setSearching, setHighlightedRouteIndex,
  ]);

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

  if (!searchOpen) return null;

  return (
    <div className="absolute top-[50px] right-0 bottom-0 z-[999] glass-panel w-[320px] sm:w-[360px] flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-blue uppercase tracking-wider">
          Planificateur
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

      {/* Search form */}
      <div className="p-3 space-y-3 border-b border-border">
        {/* Departure */}
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
            Ville de depart
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
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="text-muted hover:text-blue transition-colors p-1 rounded-md hover:bg-[rgba(20,30,60,0.5)]"
            title="Inverser"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3V13M5 13L2 10M5 13L8 10M11 13V3M11 3L8 6M11 3L14 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Arrival */}
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
            Ville d&apos;arrivee
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
          />
        </div>

        {/* UTI Filter */}
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block">
            Type de produit (optionnel)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {UTI_OPTIONS.map((uti) => {
              const active = selectedUTI.has(uti.key);
              return (
                <button
                  key={uti.key}
                  onClick={() => toggleUTI(uti.key)}
                  className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                    active
                      ? 'border-cyan/50 bg-cyan/10 text-cyan'
                      : 'border-border text-muted hover:text-text hover:border-blue/30'
                  }`}
                  title={uti.desc}
                >
                  {uti.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!departureQuery.trim() || !arrivalQuery.trim() || searching}
          className="w-full text-xs py-2 rounded-md bg-blue/20 text-blue hover:bg-blue/30 border border-blue/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          {searching ? 'Recherche...' : 'Rechercher un trajet'}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted uppercase tracking-wider">
                {results.length} itineraire{results.length > 1 ? 's' : ''} trouve{results.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearSearch}
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
              />
            ))}
          </>
        )}

        {results.length === 0 && !searching && departureQuery && arrivalQuery && (
          <div className="text-center py-8">
            <div className="text-muted text-xs">Aucun itineraire trouve</div>
            <div className="text-[10px] text-muted mt-1">
              Essayez d&apos;elargir votre recherche ou de modifier le type de produit
            </div>
          </div>
        )}

        {!departureQuery && !arrivalQuery && (
          <div className="text-center py-8">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2 text-muted">
              <path d="M6 16H26M26 16L20 10M26 16L20 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="text-xs text-muted">
              Saisissez une ville de depart et d&apos;arrivee pour trouver les itineraires disponibles
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
