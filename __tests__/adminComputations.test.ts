import { describe, it, expect } from 'vitest';
import {
  getTopPlatforms,
  getOperatorComparison,
  buildAllPlatformStats,
  getOperatorPlatforms,
  groupServicesByRoute,
} from '@/lib/adminComputations';
import { AggregatedRoute, Service } from '@/lib/types';

const routes: AggregatedRoute[] = [
  { from: 'A', to: 'B', fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8, freq: 20, operators: ['Op1'] },
  { from: 'A', to: 'C', fromLat: 48.8, fromLon: 2.3, toLat: 43.3, toLon: 5.4, freq: 10, operators: ['Op1', 'Op2'] },
  { from: 'B', to: 'C', fromLat: 45.7, fromLon: 4.8, toLat: 43.3, toLon: 5.4, freq: 5, operators: ['Op2'] },
];

const services: Service[] = [
  { operator: 'Op1', from: 'A', to: 'B', dayDep: 'Lu', timeDep: '08:00', dayArr: 'Lu', timeArr: '12:00', acceptsCM: 'Oui', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' },
  { operator: 'Op1', from: 'A', to: 'B', dayDep: 'Me', timeDep: '08:00', dayArr: 'Me', timeArr: '12:00', acceptsCM: 'Oui', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' },
  { operator: 'Op1', from: 'A', to: 'C', dayDep: 'Ve', timeDep: '09:00', dayArr: 'Ve', timeArr: '15:00', acceptsCM: 'Oui', acceptsCont: 'Non', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' },
  { operator: 'Op2', from: 'A', to: 'C', dayDep: 'Ma', timeDep: '10:00', dayArr: 'Ma', timeArr: '16:00', acceptsCM: 'Non', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' },
  { operator: 'Op2', from: 'B', to: 'C', dayDep: 'Je', timeDep: '07:00', dayArr: 'Je', timeArr: '11:00', acceptsCM: 'Non', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' },
];

describe('getTopPlatforms', () => {
  it('returns platforms sorted by frequency', () => {
    const top = getTopPlatforms(routes);
    expect(top[0].site).toBe('A'); // A appears in 2 routes: 20 + 10 = 30
    expect(top[0].freq).toBe(30);
  });

  it('respects limit parameter', () => {
    const top = getTopPlatforms(routes, 2);
    expect(top).toHaveLength(2);
  });

  it('returns all platforms when limit exceeds count', () => {
    const top = getTopPlatforms(routes, 100);
    expect(top).toHaveLength(3); // A, B, C
  });
});

describe('getOperatorComparison', () => {
  it('returns all operators sorted by traffic', () => {
    const comparison = getOperatorComparison(routes, services);
    expect(comparison).toHaveLength(2);
    // Op1 has routes with freq 20+10=30, Op2 has 10+5=15
    expect(comparison[0].operator).toBe('Op1');
    expect(comparison[1].operator).toBe('Op2');
  });

  it('calculates correct stats per operator', () => {
    const comparison = getOperatorComparison(routes, services);
    const op1 = comparison.find((c) => c.operator === 'Op1')!;
    expect(op1.stats.routeCount).toBe(2); // A->B, A->C
    expect(op1.stats.serviceCount).toBe(3);
    expect(op1.stats.platforms).toContain('A');
    expect(op1.stats.platforms).toContain('B');
    expect(op1.stats.platforms).toContain('C');
  });
});

describe('buildAllPlatformStats', () => {
  it('builds stats for all platforms', () => {
    const stats = buildAllPlatformStats(routes, services);
    expect(stats.size).toBe(3); // A, B, C
  });

  it('calculates correct traffic volume', () => {
    const stats = buildAllPlatformStats(routes, services);
    const a = stats.get('A')!;
    expect(a.trainsPerWeek).toBe(30); // 20 (A->B) + 10 (A->C)
    expect(a.operators).toContain('Op1');
    expect(a.operators).toContain('Op2');
  });

  it('counts destinations correctly', () => {
    const stats = buildAllPlatformStats(routes, services);
    const a = stats.get('A')!;
    expect(a.destinationCount).toBe(2); // B and C
  });
});

describe('getOperatorPlatforms', () => {
  it('returns sorted platform list for operator', () => {
    const platforms = getOperatorPlatforms(services, 'Op1');
    expect(platforms).toEqual(['A', 'B', 'C']);
  });

  it('returns only relevant platforms', () => {
    const platforms = getOperatorPlatforms(services, 'Op2');
    expect(platforms).toEqual(['A', 'B', 'C']);
  });

  it('returns empty for unknown operator', () => {
    const platforms = getOperatorPlatforms(services, 'Unknown');
    expect(platforms).toEqual([]);
  });
});

describe('groupServicesByRoute', () => {
  it('groups services by from->to for an operator', () => {
    const groups = groupServicesByRoute(services, 'Op1');
    expect(groups).toHaveLength(2); // A->B and A->C
  });

  it('sorts groups by service count (most first)', () => {
    const groups = groupServicesByRoute(services, 'Op1');
    expect(groups[0].services.length).toBeGreaterThanOrEqual(groups[1].services.length);
  });

  it('sorts services within group by day order', () => {
    const groups = groupServicesByRoute(services, 'Op1');
    const abGroup = groups.find((g) => g.from === 'A' && g.to === 'B')!;
    expect(abGroup.services[0].dayDep).toBe('Lu');
    expect(abGroup.services[1].dayDep).toBe('Me');
  });
});
