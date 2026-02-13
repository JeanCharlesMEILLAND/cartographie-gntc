import { TransportData, AggregatedRoute, Service } from './types';

export interface QualityIssue {
  type: 'duplicate' | 'orphan' | 'no-route' | 'high-freq' | 'no-coords' | 'no-service';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export function analyzeDataQuality(data: TransportData): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // 1. Duplicate routes (same from/to/operator)
  const routeKeys = new Map<string, number>();
  for (const r of data.routes) {
    for (const op of r.operators) {
      const key = `${r.from}||${r.to}||${op}`;
      routeKeys.set(key, (routeKeys.get(key) || 0) + 1);
    }
  }
  for (const [key, count] of routeKeys) {
    if (count > 1) {
      const [from, to, op] = key.split('||');
      issues.push({
        type: 'duplicate',
        severity: 'error',
        message: `Route en double : ${from} → ${to}`,
        details: `Opérateur ${op} apparaît ${count} fois`,
      });
    }
  }

  // 2. Duplicate services (same operator/from/to/dayDep/timeDep)
  const serviceKeys = new Map<string, number>();
  for (const s of data.services) {
    const key = `${s.operator}||${s.from}||${s.to}||${s.dayDep}||${s.timeDep}`;
    serviceKeys.set(key, (serviceKeys.get(key) || 0) + 1);
  }
  for (const [key, count] of serviceKeys) {
    if (count > 1) {
      const [op, from, to, day, time] = key.split('||');
      issues.push({
        type: 'duplicate',
        severity: 'error',
        message: `Service en double : ${op} ${from} → ${to}`,
        details: `${day} ${time} — ${count} occurrences`,
      });
    }
  }

  // 3. Orphan platforms (no route)
  const routeSites = new Set<string>();
  for (const r of data.routes) {
    routeSites.add(r.from);
    routeSites.add(r.to);
  }
  const orphans = data.platforms.filter((p) => !routeSites.has(p.site));
  if (orphans.length > 0) {
    issues.push({
      type: 'orphan',
      severity: 'warning',
      message: `${orphans.length} plateforme(s) sans liaison`,
      details: orphans.map((p) => p.site).slice(0, 10).join(', ') + (orphans.length > 10 ? '...' : ''),
    });
  }

  // 4. Operators without routes
  const routeOps = new Set<string>();
  for (const r of data.routes) r.operators.forEach((op) => routeOps.add(op));
  const serviceOnlyOps = data.operators.filter((op) => !routeOps.has(op));
  if (serviceOnlyOps.length > 0) {
    issues.push({
      type: 'no-route',
      severity: 'warning',
      message: `${serviceOnlyOps.length} opérateur(s) sans liaison`,
      details: serviceOnlyOps.join(', '),
    });
  }

  // 5. Routes without services
  const serviceRouteKeys = new Set<string>();
  for (const s of data.services) {
    serviceRouteKeys.add(`${s.from}||${s.to}||${s.operator}`);
    serviceRouteKeys.add(`${s.to}||${s.from}||${s.operator}`);
  }
  const routesNoService = data.routes.filter((r) =>
    !r.operators.some((op) => serviceRouteKeys.has(`${r.from}||${r.to}||${op}`))
  );
  if (routesNoService.length > 0) {
    issues.push({
      type: 'no-service',
      severity: 'info',
      message: `${routesNoService.length} liaison(s) sans service détaillé`,
      details: routesNoService.slice(0, 5).map((r) => `${r.from} → ${r.to}`).join(', ') + (routesNoService.length > 5 ? '...' : ''),
    });
  }

  // 6. Unusual frequencies (>70 trains/week on one route)
  const highFreq = data.routes.filter((r) => r.freq > 70);
  for (const r of highFreq) {
    issues.push({
      type: 'high-freq',
      severity: 'warning',
      message: `Fréquence élevée : ${r.from} → ${r.to}`,
      details: `${r.freq} trains/semaine — vérifier si correct`,
    });
  }

  // 7. Platforms without coordinates
  const noCoords = data.platforms.filter((p) => !p.lat || !p.lon);
  if (noCoords.length > 0) {
    issues.push({
      type: 'no-coords',
      severity: 'error',
      message: `${noCoords.length} plateforme(s) sans coordonnées`,
      details: noCoords.map((p) => p.site).slice(0, 10).join(', ') + (noCoords.length > 10 ? '...' : ''),
    });
  }

  return issues.sort((a, b) => {
    const sev = { error: 0, warning: 1, info: 2 };
    return sev[a.severity] - sev[b.severity];
  });
}
