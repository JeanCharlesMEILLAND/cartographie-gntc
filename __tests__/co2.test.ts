import { describe, it, expect } from 'vitest';
import { computeCO2Stats, computeRouteCO2, formatCO2 } from '@/lib/co2';
import { AggregatedRoute } from '@/lib/types';

describe('computeCO2Stats', () => {
  it('returns zeros for empty routes', () => {
    const stats = computeCO2Stats([]);
    expect(stats.co2SavedPerWeek).toBe(0);
    expect(stats.co2SavedPerYear).toBe(0);
    expect(stats.trucksAvoidedPerWeek).toBe(0);
    expect(stats.dieselSavedPerYear).toBe(0);
    expect(stats.kmAvoidedPerYear).toBe(0);
  });

  it('calculates positive savings for a route', () => {
    const routes: AggregatedRoute[] = [{
      from: 'Paris', to: 'Lyon',
      fromLat: 48.856, fromLon: 2.352,
      toLat: 45.764, toLon: 4.835,
      freq: 10,
      operators: ['Op1'],
    }];
    const stats = computeCO2Stats(routes);
    expect(stats.co2SavedPerWeek).toBeGreaterThan(0);
    expect(stats.co2SavedPerYear).toBeCloseTo(stats.co2SavedPerWeek * 52, 1);
    expect(stats.trucksAvoidedPerWeek).toBe(300); // 10 trains * 30 UTI
    expect(stats.trucksAvoidedPerYear).toBe(300 * 52);
    expect(stats.dieselSavedPerYear).toBeGreaterThan(0);
    expect(stats.kmAvoidedPerYear).toBeGreaterThan(0);
  });

  it('scales with frequency', () => {
    const makeRoute = (freq: number): AggregatedRoute[] => [{
      from: 'A', to: 'B', fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8, freq, operators: ['Op1'],
    }];
    const stats1 = computeCO2Stats(makeRoute(5));
    const stats2 = computeCO2Stats(makeRoute(10));
    expect(stats2.co2SavedPerWeek).toBeCloseTo(stats1.co2SavedPerWeek * 2, 1);
  });
});

describe('computeRouteCO2', () => {
  it('returns positive savings for Paris-Lyon', () => {
    const result = computeRouteCO2(48.856, 2.352, 45.764, 4.835);
    expect(result.co2SavedKg).toBeGreaterThan(0);
    expect(result.trucksReplaced).toBe(30);
  });

  it('returns zero for same point', () => {
    const result = computeRouteCO2(48.856, 2.352, 48.856, 2.352);
    expect(result.co2SavedKg).toBe(0);
  });
});

describe('formatCO2', () => {
  it('formats thousands with k suffix', () => {
    expect(formatCO2(1500)).toBe('1.5k');
    expect(formatCO2(2000)).toBe('2.0k');
  });

  it('formats hundreds as integers', () => {
    expect(formatCO2(250)).toBe('250');
    expect(formatCO2(999)).toBe('999');
  });

  it('formats small numbers with one decimal', () => {
    expect(formatCO2(3.7)).toBe('3.7');
    expect(formatCO2(0.5)).toBe('0.5');
  });
});
