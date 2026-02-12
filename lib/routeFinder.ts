import { Platform, Service, AggregatedRoute } from './types';
import { UTIType } from '@/store/useSearchStore';

export interface FoundRoute {
  type: 'direct' | 'transfer';
  legs: RouteLeg[];
  totalFreq: number;
  operators: string[];
}

export interface RouteLeg {
  from: string;
  to: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  operator: string;
  services: Service[];
  freq: number;
}

/** Haversine distance in km between two points */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Geocode a city name using Nominatim (OpenStreetMap) */
export async function geocodeCity(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=fr,be,lu,de,it,es,nl,ch`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export interface PlatformSuggestion {
  platform: Platform;
  distance: number | null; // km, null if matched by text
  matchType: 'text' | 'geo';
}

export interface CitySuggestion {
  city: string;
  lat: number;
  lon: number;
  pays: string;
  departement: string;
  platforms: Platform[];
  bestScore: number;
  distance: number | null; // km if geo-matched, null if text-matched
}

/** Find platforms near a geocoded location, sorted by distance */
export function findPlatformsByLocation(
  lat: number,
  lon: number,
  platforms: Platform[],
  maxResults = 5,
  maxDistanceKm = 150
): PlatformSuggestion[] {
  return platforms
    .map((p) => ({
      platform: p,
      distance: haversineKm(lat, lon, p.lat, p.lon),
      matchType: 'geo' as const,
    }))
    .filter((s) => s.distance <= maxDistanceKm)
    .sort((a, b) => a.distance! - b.distance!)
    .slice(0, maxResults);
}

/** Combined search: text matching first, then geocode fallback */
export async function findPlatformsAsync(
  query: string,
  platforms: Platform[],
  maxResults = 6
): Promise<PlatformSuggestion[]> {
  if (!query.trim() || query.length < 2) return [];

  // 1. Try text matching first — only keep results with a strong score
  const scored = platforms
    .map((p) => ({ platform: p, score: matchScore(query, p) }))
    .filter((s) => s.score >= 40) // Only strong matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  if (scored.length > 0) {
    return scored.map((s) => ({ platform: s.platform, distance: null, matchType: 'text' as const }));
  }

  // 2. Fallback: geocode the city and find nearest platforms by distance
  const coords = await geocodeCity(query);
  if (!coords) return [];

  return findPlatformsByLocation(coords.lat, coords.lon, platforms, maxResults);
}

/** Combined search grouped by city: text matching first, then geocode fallback */
export async function findCitySuggestionsAsync(
  query: string,
  platforms: Platform[],
  maxResults = 8
): Promise<CitySuggestion[]> {
  if (!query.trim() || query.length < 2) return [];

  // 1. Score every platform
  const scored = platforms
    .map((p) => ({ platform: p, score: matchScore(query, p) }))
    .filter((s) => s.score >= 40);

  if (scored.length > 0) {
    // Group by ville (normalized)
    const cityMap = new Map<string, { platforms: { platform: Platform; score: number }[] }>();
    for (const s of scored) {
      const key = (s.platform.ville || s.platform.site.split(' - ')[0]).toLowerCase().trim();
      if (!cityMap.has(key)) cityMap.set(key, { platforms: [] });
      cityMap.get(key)!.platforms.push(s);
    }

    // Also include nearby platforms that didn't match text but are within 15km
    // of a matched platform (handles agglomeration cases like Lyon/Venissieux/St Priest)
    const matchedPlatforms = scored.map((s) => s.platform);
    for (const p of platforms) {
      if (matchedPlatforms.some((mp) => mp.site === p.site)) continue; // already matched
      // Check if this platform is within 15km of any matched platform
      const nearestMatch = matchedPlatforms.find(
        (mp) => haversineKm(p.lat, p.lon, mp.lat, mp.lon) < 15
      );
      if (nearestMatch) {
        // Add to the group of the nearest match
        const nearKey = (nearestMatch.ville || nearestMatch.site.split(' - ')[0]).toLowerCase().trim();
        if (cityMap.has(nearKey)) {
          cityMap.get(nearKey)!.platforms.push({ platform: p, score: 0 });
        }
      }
    }

    const cities: CitySuggestion[] = [];
    for (const [, group] of cityMap) {
      const best = group.platforms.reduce((a, b) => (a.score > b.score ? a : b));
      const plats = group.platforms.map((g) => g.platform);
      cities.push({
        city: best.platform.ville || best.platform.site.split(' - ')[0],
        lat: plats[0].lat,
        lon: plats[0].lon,
        pays: plats[0].pays,
        departement: plats[0].departement,
        platforms: plats,
        bestScore: best.score,
        distance: null,
      });
    }

    cities.sort((a, b) => b.bestScore - a.bestScore);
    return cities.slice(0, maxResults);
  }

  // 2. Geocode fallback — group nearby platforms by ville within 50km
  const coords = await geocodeCity(query);
  if (!coords) return [];

  const nearby = platforms
    .map((p) => ({ platform: p, dist: haversineKm(coords.lat, coords.lon, p.lat, p.lon) }))
    .filter((s) => s.dist <= 50)
    .sort((a, b) => a.dist - b.dist);

  if (nearby.length === 0) {
    // Widen to 150km if nothing within 50km
    const wider = platforms
      .map((p) => ({ platform: p, dist: haversineKm(coords.lat, coords.lon, p.lat, p.lon) }))
      .filter((s) => s.dist <= 150)
      .sort((a, b) => a.dist - b.dist);
    return groupNearbyByCity(wider, maxResults);
  }

  return groupNearbyByCity(nearby, maxResults);
}

function groupNearbyByCity(
  nearby: { platform: Platform; dist: number }[],
  maxResults: number
): CitySuggestion[] {
  const cityMap = new Map<string, { platforms: Platform[]; minDist: number }>();
  for (const s of nearby) {
    const key = (s.platform.ville || s.platform.site.split(' - ')[0]).toLowerCase().trim();
    if (!cityMap.has(key)) cityMap.set(key, { platforms: [], minDist: s.dist });
    const group = cityMap.get(key)!;
    group.platforms.push(s.platform);
    if (s.dist < group.minDist) group.minDist = s.dist;
  }

  const cities: CitySuggestion[] = [];
  for (const [, group] of cityMap) {
    const first = group.platforms[0];
    cities.push({
      city: first.ville || first.site.split(' - ')[0],
      lat: first.lat,
      lon: first.lon,
      pays: first.pays,
      departement: first.departement,
      platforms: group.platforms,
      bestScore: 0,
      distance: Math.round(group.minDist),
    });
  }

  cities.sort((a, b) => a.distance! - b.distance!);
  return cities.slice(0, maxResults);
}

/** Normalize string: remove accents, lowercase, trim */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Tokenize a string into searchable words */
function tokenize(s: string): string[] {
  return normalize(s)
    .replace(/[-_()]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/** Score how well a query matches a platform (higher = better) */
function matchScore(query: string, platform: Platform): number {
  const qNorm = normalize(query);
  const qTokens = tokenize(query);

  // Exact match on ville
  if (normalize(platform.ville) === qNorm) return 100;

  // Exact match on site name
  if (normalize(platform.site) === qNorm) return 95;

  // Ville starts with query
  if (normalize(platform.ville).startsWith(qNorm)) return 80;

  // Site starts with query
  if (normalize(platform.site).startsWith(qNorm)) return 75;

  // Ville contains query
  if (normalize(platform.ville).includes(qNorm)) return 60;

  // Site contains query
  if (normalize(platform.site).includes(qNorm)) return 55;

  // Token matching — only count meaningful matches (tokens >= 3 chars)
  const siteTokens = tokenize(platform.site);
  const villeTokens = tokenize(platform.ville);
  const allTokens = [...siteTokens, ...villeTokens];

  let tokenScore = 0;
  for (const qt of qTokens) {
    if (qt.length < 3) continue; // Skip tiny query tokens
    for (const st of allTokens) {
      if (st.length < 3) continue; // Skip tiny platform tokens
      if (st === qt) {
        tokenScore += 30;
      } else if (st.startsWith(qt) || qt.startsWith(st)) {
        tokenScore += 15;
      }
      // No substring matching — too many false positives
    }
  }

  // Department match
  if (
    platform.departement &&
    normalize(platform.departement).includes(qNorm)
  )
    return 40;

  return tokenScore;
}

/** Find platforms matching a city query, sorted by relevance */
export function findPlatforms(
  query: string,
  platforms: Platform[],
  maxResults = 5
): Platform[] {
  if (!query.trim()) return [];

  const scored = platforms
    .map((p) => ({ platform: p, score: matchScore(query, p) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map((s) => s.platform);
}

/** Get unique city/ville suggestions for autocomplete */
export function getCitySuggestions(platforms: Platform[]): string[] {
  const cities = new Set<string>();
  for (const p of platforms) {
    if (p.ville) cities.add(p.ville);
    // Also add the site name for platforms like "Le Havre - LHTE"
    const siteCity = p.site.split(' - ')[0].split(' (')[0].trim();
    if (siteCity) cities.add(siteCity);
  }
  return Array.from(cities).sort();
}

/** Check if a service accepts the given UTI type */
function acceptsUTI(service: Service, uti: UTIType): boolean {
  const val = {
    cm: service.acceptsCM,
    cont: service.acceptsCont,
    semiPre: service.acceptsSemiPre,
    semiNon: service.acceptsSemiNon,
    p400: service.acceptsP400,
  }[uti];
  return val === 'Oui' || val === 'oui';
}

/** Check if a service accepts ALL selected UTI types */
function serviceAcceptsAllUTI(
  service: Service,
  utiFilter: Set<UTIType>
): boolean {
  if (utiFilter.size === 0) return true;
  for (const uti of utiFilter) {
    if (!acceptsUTI(service, uti)) return false;
  }
  return true;
}

/** Build a graph of services grouped by (operator, from, to) */
function buildServiceGraph(services: Service[]) {
  // Map: platformName -> list of { to, operator, services[] }
  const graph = new Map<
    string,
    Map<string, { operator: string; to: string; services: Service[] }>
  >();

  for (const s of services) {
    if (!graph.has(s.from)) graph.set(s.from, new Map());
    const edges = graph.get(s.from)!;
    const key = `${s.operator}||${s.to}`;
    if (!edges.has(key)) {
      edges.set(key, { operator: s.operator, to: s.to, services: [] });
    }
    edges.get(key)!.services.push(s);
  }

  return graph;
}

/** Find routes between departure and arrival platforms */
export function findRoutes(
  departurePlatforms: Platform[],
  arrivalPlatforms: Platform[],
  allPlatforms: Platform[],
  services: Service[],
  utiFilter: Set<UTIType>
): FoundRoute[] {
  const results: FoundRoute[] = [];
  const depSites = new Set(departurePlatforms.map((p) => p.site));
  const arrSites = new Set(arrivalPlatforms.map((p) => p.site));

  // Filter services by UTI if specified
  const filteredServices = utiFilter.size > 0
    ? services.filter((s) => serviceAcceptsAllUTI(s, utiFilter))
    : services;

  const graph = buildServiceGraph(filteredServices);

  // Platform lookup for coords
  const platformMap = new Map(allPlatforms.map((p) => [p.site, p]));

  // 1. Direct routes
  for (const depSite of depSites) {
    const edges = graph.get(depSite);
    if (!edges) continue;

    for (const edge of edges.values()) {
      if (arrSites.has(edge.to)) {
        const fromP = platformMap.get(depSite);
        const toP = platformMap.get(edge.to);
        if (!fromP || !toP) continue;

        results.push({
          type: 'direct',
          legs: [
            {
              from: depSite,
              to: edge.to,
              fromLat: fromP.lat,
              fromLon: fromP.lon,
              toLat: toP.lat,
              toLon: toP.lon,
              operator: edge.operator,
              services: edge.services,
              freq: edge.services.length,
            },
          ],
          totalFreq: edge.services.length,
          operators: [edge.operator],
        });
      }
    }
  }

  // 2. Transfer routes (1 hop)
  for (const depSite of depSites) {
    const firstEdges = graph.get(depSite);
    if (!firstEdges) continue;

    for (const firstEdge of firstEdges.values()) {
      // Skip if first leg already reaches destination
      if (arrSites.has(firstEdge.to)) continue;

      const transferSite = firstEdge.to;
      const secondEdges = graph.get(transferSite);
      if (!secondEdges) continue;

      for (const secondEdge of secondEdges.values()) {
        if (arrSites.has(secondEdge.to)) {
          const fromP = platformMap.get(depSite);
          const midP = platformMap.get(transferSite);
          const toP = platformMap.get(secondEdge.to);
          if (!fromP || !midP || !toP) continue;

          // Avoid going back to departure
          if (secondEdge.to === depSite) continue;

          results.push({
            type: 'transfer',
            legs: [
              {
                from: depSite,
                to: transferSite,
                fromLat: fromP.lat,
                fromLon: fromP.lon,
                toLat: midP.lat,
                toLon: midP.lon,
                operator: firstEdge.operator,
                services: firstEdge.services,
                freq: firstEdge.services.length,
              },
              {
                from: transferSite,
                to: secondEdge.to,
                fromLat: midP.lat,
                fromLon: midP.lon,
                toLat: toP.lat,
                toLon: toP.lon,
                operator: secondEdge.operator,
                services: secondEdge.services,
                freq: secondEdge.services.length,
              },
            ],
            totalFreq: Math.min(
              firstEdge.services.length,
              secondEdge.services.length
            ),
            operators: [
              ...new Set([firstEdge.operator, secondEdge.operator]),
            ],
          });
        }
      }
    }
  }

  // Compute detour ratio for transfer routes to penalize absurd paths
  // (e.g., Lyon → Belgium → Marseille instead of Lyon → Avignon → Marseille)
  const getDetourRatio = (route: FoundRoute): number => {
    if (route.type === 'direct') return 1;
    const firstLeg = route.legs[0];
    const lastLeg = route.legs[route.legs.length - 1];
    const directDist = haversineKm(firstLeg.fromLat, firstLeg.fromLon, lastLeg.toLat, lastLeg.toLon);
    if (directDist < 1) return 1;
    let totalDist = 0;
    for (const leg of route.legs) {
      totalDist += haversineKm(leg.fromLat, leg.fromLon, leg.toLat, leg.toLon);
    }
    return totalDist / directDist;
  };

  // Sort: direct first, then by detour ratio (lower = better), then by frequency
  results.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'direct' ? -1 : 1;
    if (a.type === 'transfer' && b.type === 'transfer') {
      const detourA = getDetourRatio(a);
      const detourB = getDetourRatio(b);
      // Significantly different detour → prefer shorter path
      if (Math.abs(detourA - detourB) > 0.5) return detourA - detourB;
    }
    return b.totalFreq - a.totalFreq;
  });

  // Deduplicate: keep best route per unique path
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.legs.map((l) => `${l.from}-${l.to}-${l.operator}`).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Get all cities directly reachable from a set of departure platforms */
export function getDirectDestinationCities(
  departureSites: Set<string>,
  services: Service[],
  allPlatforms: Platform[]
): CitySuggestion[] {
  // Count services per destination site
  const destSiteFreq = new Map<string, number>();
  for (const s of services) {
    if (departureSites.has(s.from) && !departureSites.has(s.to)) {
      destSiteFreq.set(s.to, (destSiteFreq.get(s.to) || 0) + 1);
    }
  }
  if (destSiteFreq.size === 0) return [];

  const platformMap = new Map(allPlatforms.map((p) => [p.site, p]));

  // Group by city
  const cityMap = new Map<string, { platforms: Platform[]; totalFreq: number }>();
  for (const [site, freq] of destSiteFreq) {
    const platform = platformMap.get(site);
    if (!platform) continue;
    const cityKey = (platform.ville || platform.site.split(' - ')[0]).toLowerCase().trim();
    if (!cityMap.has(cityKey)) cityMap.set(cityKey, { platforms: [], totalFreq: 0 });
    const group = cityMap.get(cityKey)!;
    group.platforms.push(platform);
    group.totalFreq += freq;
  }

  const results: CitySuggestion[] = [];
  for (const [, group] of cityMap) {
    const first = group.platforms[0];
    results.push({
      city: first.ville || first.site.split(' - ')[0],
      lat: first.lat,
      lon: first.lon,
      pays: first.pays,
      departement: first.departement,
      platforms: group.platforms,
      bestScore: group.totalFreq,
      distance: null,
    });
  }

  results.sort((a, b) => b.bestScore - a.bestScore);
  return results;
}

/** Compute weekly train volume for a platform from aggregated routes */
export function getTrainVolume(platformName: string, routes: AggregatedRoute[]): number {
  let total = 0;
  for (const r of routes) {
    if (r.from === platformName || r.to === platformName) {
      total += r.freq;
    }
  }
  return total;
}
