import { Platform, AggregatedRoute, Service } from './types';

export const DAY_ORDER: Record<string, number> = { Lu: 1, Ma: 2, Me: 3, Je: 4, Ve: 5, Sa: 6, Di: 7 };

export interface PlatformStats {
  operators: string[];
  trainsPerWeek: number;
  destinationCount: number;
  serviceCount: number;
}

export interface OperatorDestination {
  dest: string;
  freq: number;
  services: Service[];
}

export interface OperatorBreakdownEntry {
  operator: string;
  destinations: OperatorDestination[];
  totalFreq: number;
  freqShare: number; // 0-1
}

export interface OperatorStats {
  platformCount: number;
  routeCount: number;
  trainsPerWeek: number;
  serviceCount: number;
  platforms: string[];
}

/** Build stats for every platform in the network */
export function buildAllPlatformStats(
  routes: AggregatedRoute[],
  services: Service[]
): Map<string, PlatformStats> {
  const stats = new Map<string, PlatformStats>();

  // Init from routes
  for (const r of routes) {
    for (const site of [r.from, r.to]) {
      if (!stats.has(site)) {
        stats.set(site, { operators: [], trainsPerWeek: 0, destinationCount: 0, serviceCount: 0 });
      }
      const s = stats.get(site)!;
      s.trainsPerWeek += r.freq;
      s.destinationCount++;
      for (const op of r.operators) {
        if (!s.operators.includes(op)) s.operators.push(op);
      }
    }
  }

  // Add service counts
  for (const svc of services) {
    for (const site of [svc.from, svc.to]) {
      const s = stats.get(site);
      if (s) s.serviceCount++;
    }
  }

  return stats;
}

/** Build per-operator breakdown for a single platform (same logic as InfoCard) */
export function buildPlatformOperatorBreakdown(
  platformSite: string,
  routes: AggregatedRoute[],
  services: Service[]
): OperatorBreakdownEntry[] {
  const connected = routes.filter(
    (r) => r.from === platformSite || r.to === platformSite
  );
  const totalFreq = connected.reduce((sum, r) => sum + r.freq, 0);

  const platformServices = services.filter(
    (s) => s.from === platformSite || s.to === platformSite
  );

  const operatorMap = new Map<string, OperatorDestination[]>();
  for (const r of connected) {
    const dest = r.from === platformSite ? r.to : r.from;
    for (const op of r.operators) {
      if (!operatorMap.has(op)) operatorMap.set(op, []);
      const destServices = platformServices
        .filter(
          (s) =>
            s.operator === op &&
            ((s.from === platformSite && s.to === dest) ||
              (s.to === platformSite && s.from === dest))
        )
        .sort((a, b) => (DAY_ORDER[a.dayDep] || 8) - (DAY_ORDER[b.dayDep] || 8));

      operatorMap.get(op)!.push({ dest, freq: r.freq, services: destServices });
    }
  }

  return [...operatorMap.entries()]
    .map(([op, dests]) => {
      const opTotal = dests.reduce((s, d) => s + d.freq, 0);
      return {
        operator: op,
        destinations: dests.sort((a, b) => b.freq - a.freq),
        totalFreq: opTotal,
        freqShare: totalFreq > 0 ? opTotal / totalFreq : 0,
      };
    })
    .sort((a, b) => b.totalFreq - a.totalFreq);
}

/** Build stats for a single operator */
export function buildOperatorStats(
  operator: string,
  routes: AggregatedRoute[],
  services: Service[]
): OperatorStats {
  const opServices = services.filter((s) => s.operator === operator);
  const opRoutes = routes.filter((r) => r.operators.includes(operator));
  const platforms = new Set<string>();
  for (const s of opServices) {
    platforms.add(s.from);
    platforms.add(s.to);
  }

  return {
    platformCount: platforms.size,
    routeCount: opRoutes.length,
    trainsPerWeek: opRoutes.reduce((sum, r) => sum + r.freq, 0),
    serviceCount: opServices.length,
    platforms: [...platforms].sort(),
  };
}

/** Get top N platforms by traffic volume */
export function getTopPlatforms(
  routes: AggregatedRoute[],
  limit = 10
): { site: string; freq: number }[] {
  const freqMap = new Map<string, number>();
  for (const r of routes) {
    freqMap.set(r.from, (freqMap.get(r.from) || 0) + r.freq);
    freqMap.set(r.to, (freqMap.get(r.to) || 0) + r.freq);
  }
  return [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([site, freq]) => ({ site, freq }));
}

/** Get comparison data for all operators */
export function getOperatorComparison(
  routes: AggregatedRoute[],
  services: Service[]
): { operator: string; stats: OperatorStats }[] {
  const operators = [...new Set(services.map((s) => s.operator))].sort();
  const totalFreq = routes.reduce((sum, r) => sum + r.freq, 0);

  return operators
    .map((op) => ({
      operator: op,
      stats: buildOperatorStats(op, routes, services),
    }))
    .sort((a, b) => b.stats.trainsPerWeek - a.stats.trainsPerWeek);
}

/** Group services by route (from→to) for a given operator */
export function groupServicesByRoute(
  services: Service[],
  operator: string
): { route: string; from: string; to: string; services: Service[] }[] {
  const opServices = services.filter((s) => s.operator === operator);
  const groups = new Map<string, { from: string; to: string; services: Service[] }>();

  for (const s of opServices) {
    const key = `${s.from}||${s.to}`;
    if (!groups.has(key)) groups.set(key, { from: s.from, to: s.to, services: [] });
    groups.get(key)!.services.push(s);
  }

  // Sort services within each group by day
  for (const g of groups.values()) {
    g.services.sort((a, b) => (DAY_ORDER[a.dayDep] || 8) - (DAY_ORDER[b.dayDep] || 8));
  }

  return [...groups.entries()]
    .map(([key, g]) => ({ route: key, ...g }))
    .sort((a, b) => b.services.length - a.services.length);
}

/** Get set of platform sites served by an operator */
export function getOperatorPlatforms(
  services: Service[],
  operator: string
): string[] {
  const platforms = new Set<string>();
  for (const s of services) {
    if (s.operator === operator) {
      platforms.add(s.from);
      platforms.add(s.to);
    }
  }
  return [...platforms].sort();
}
