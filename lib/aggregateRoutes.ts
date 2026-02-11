import { AggregatedRoute, RawFlux } from './types';
import { geocodePlatform } from './geocode';

export function aggregateRoutes(
  fluxes: RawFlux[]
): { routes: AggregatedRoute[]; unmatchedPlatforms: string[] } {
  const routeMap = new Map<string, {
    from: string;
    to: string;
    fromCoords: [number, number];
    toCoords: [number, number];
    freq: number;
    operators: Set<string>;
  }>();

  const unmatched = new Set<string>();

  for (const flux of fluxes) {
    const fromName = flux.plateformeExp.trim();
    const toName = flux.plateformeDest.trim();

    const fromCoords = geocodePlatform(fromName);
    const toCoords = geocodePlatform(toName);

    if (!fromCoords) unmatched.add(fromName);
    if (!toCoords) unmatched.add(toName);
    if (!fromCoords || !toCoords) continue;

    const key = [fromName, toName].sort().join('||');
    const existing = routeMap.get(key);

    if (existing) {
      existing.freq += flux.frequenceHebdo || 0;
      if (flux.operateur) existing.operators.add(flux.operateur.trim());
    } else {
      routeMap.set(key, {
        from: fromName,
        to: toName,
        fromCoords,
        toCoords,
        freq: flux.frequenceHebdo || 0,
        operators: new Set(flux.operateur ? [flux.operateur.trim()] : []),
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
