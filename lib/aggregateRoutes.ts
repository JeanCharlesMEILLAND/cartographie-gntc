import { AggregatedRoute, RawFlux } from './types';
import { geocodePlatform } from './geocode';

export function aggregateRoutes(
  fluxes: RawFlux[]
): { routes: AggregatedRoute[]; unmatchedPlatforms: string[] } {
  const unmatched = new Set<string>();

  // Step 1: Deduplicate by operator + directed pair → take freq once per service
  // Each row in Excel = 1 departure day. "Fréquence Hebdo" = total trains/week for that service.
  // So we take the frequency ONCE per (operator, from, to) group, not sum every row.
  const serviceMap = new Map<string, {
    from: string;
    to: string;
    fromCoords: [number, number];
    toCoords: [number, number];
    operator: string;
    freq: number;
  }>();

  for (const flux of fluxes) {
    const fromName = flux.plateformeExp.trim();
    const toName = flux.plateformeDest.trim();

    const fromCoords = geocodePlatform(fromName);
    const toCoords = geocodePlatform(toName);

    if (!fromCoords) unmatched.add(fromName);
    if (!toCoords) unmatched.add(toName);
    if (!fromCoords || !toCoords) continue;

    // Key by operator + directed pair (operator A→B is different from operator B→A)
    const serviceKey = `${flux.operateur?.trim() || ''}||${fromName}||${toName}`;
    const existing = serviceMap.get(serviceKey);

    if (!existing) {
      serviceMap.set(serviceKey, {
        from: fromName,
        to: toName,
        fromCoords,
        toCoords,
        operator: flux.operateur?.trim() || '',
        freq: flux.frequenceHebdo || 0,
      });
    }
    // If already exists, skip (same service, different departure day)
  }

  // Step 2: Aggregate by platform pair (both directions merged), summing across operators
  const routeMap = new Map<string, {
    from: string;
    to: string;
    fromCoords: [number, number];
    toCoords: [number, number];
    freq: number;
    operators: Set<string>;
  }>();

  for (const service of serviceMap.values()) {
    const key = [service.from, service.to].sort().join('||');
    const existing = routeMap.get(key);

    if (existing) {
      existing.freq += service.freq;
      if (service.operator) existing.operators.add(service.operator);
    } else {
      routeMap.set(key, {
        from: service.from,
        to: service.to,
        fromCoords: service.fromCoords,
        toCoords: service.toCoords,
        freq: service.freq,
        operators: new Set(service.operator ? [service.operator] : []),
      });
    }
  }

  const routes: AggregatedRoute[] = Array.from(routeMap.values()).map((r) => ({
    from: r.from,
    to: r.to,
    fromLat: r.fromCoords[0],
    fromLon: r.fromCoords[1],
    toLat: r.toCoords[0],
    toLon: r.toCoords[1],
    freq: r.freq,
    operators: Array.from(r.operators),
  }));

  return { routes, unmatchedPlatforms: Array.from(unmatched) };
}
