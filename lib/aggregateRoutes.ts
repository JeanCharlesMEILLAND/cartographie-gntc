import { AggregatedRoute, RawFlux } from './types';
import { geocodePlatform } from './geocode';

export function aggregateRoutes(
  fluxes: RawFlux[]
): { routes: AggregatedRoute[]; unmatchedPlatforms: string[] } {
  const unmatched = new Set<string>();

  // Step 1: Group by operator + directed pair, count rows per group.
  // Each row = 1 departure day. If "Fréquence Hebdo" is filled, use it (take once).
  // If empty (e.g. Naviland Cargo), frequency = number of rows (departure days).
  const serviceGroups = new Map<string, {
    from: string;
    to: string;
    fromCoords: [number, number];
    toCoords: [number, number];
    operator: string;
    explicitFreq: number | null;
    rowCount: number;
  }>();

  for (const flux of fluxes) {
    const fromName = flux.plateformeExp.trim();
    const toName = flux.plateformeDest.trim();

    const fromCoords = geocodePlatform(fromName);
    const toCoords = geocodePlatform(toName);

    if (!fromCoords) unmatched.add(fromName);
    if (!toCoords) unmatched.add(toName);
    if (!fromCoords || !toCoords) continue;

    const serviceKey = `${flux.operateur?.trim() || ''}||${fromName}||${toName}`;
    const existing = serviceGroups.get(serviceKey);

    if (!existing) {
      serviceGroups.set(serviceKey, {
        from: fromName,
        to: toName,
        fromCoords,
        toCoords,
        operator: flux.operateur?.trim() || '',
        explicitFreq: flux.frequenceHebdo > 0 ? flux.frequenceHebdo : null,
        rowCount: 1,
      });
    } else {
      existing.rowCount++;
    }
  }

  // Build service map with correct frequency
  const serviceMap = new Map<string, {
    from: string;
    to: string;
    fromCoords: [number, number];
    toCoords: [number, number];
    operator: string;
    freq: number;
  }>();

  for (const [key, svc] of serviceGroups) {
    serviceMap.set(key, {
      from: svc.from,
      to: svc.to,
      fromCoords: svc.fromCoords,
      toCoords: svc.toCoords,
      operator: svc.operator,
      freq: svc.explicitFreq !== null ? svc.explicitFreq : svc.rowCount,
    });
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
