import { describe, it, expect } from 'vitest';
import { getBezierPoints } from '@/lib/bezier';

describe('getBezierPoints', () => {
  const fromLat = 48.856;
  const fromLon = 2.352;
  const toLat = 45.764;
  const toLon = 4.835;

  it('returns default 26 points (0 to 25 inclusive)', () => {
    const points = getBezierPoints(fromLat, fromLon, toLat, toLon);
    expect(points).toHaveLength(26);
  });

  it('returns custom number of points', () => {
    const points = getBezierPoints(fromLat, fromLon, toLat, toLon, 10);
    expect(points).toHaveLength(11); // 0..10 inclusive
  });

  it('first point matches departure coordinates', () => {
    const points = getBezierPoints(fromLat, fromLon, toLat, toLon);
    expect(points[0][0]).toBeCloseTo(fromLat, 3);
    expect(points[0][1]).toBeCloseTo(fromLon, 3);
  });

  it('last point matches arrival coordinates', () => {
    const points = getBezierPoints(fromLat, fromLon, toLat, toLon);
    const last = points[points.length - 1];
    expect(last[0]).toBeCloseTo(toLat, 3);
    expect(last[1]).toBeCloseTo(toLon, 3);
  });

  it('intermediate points are within bounding box (with curve margin)', () => {
    const points = getBezierPoints(fromLat, fromLon, toLat, toLon);
    const minLat = Math.min(fromLat, toLat) - 1;
    const maxLat = Math.max(fromLat, toLat) + 1;
    const minLon = Math.min(fromLon, toLon) - 1;
    const maxLon = Math.max(fromLon, toLon) + 1;

    for (const [lat, lon] of points) {
      expect(lat).toBeGreaterThanOrEqual(minLat);
      expect(lat).toBeLessThanOrEqual(maxLat);
      expect(lon).toBeGreaterThanOrEqual(minLon);
      expect(lon).toBeLessThanOrEqual(maxLon);
    }
  });

  it('midpoint is offset from straight line (curve effect)', () => {
    const points = getBezierPoints(fromLat, fromLon, toLat, toLon);
    const mid = points[Math.floor(points.length / 2)];
    const straightMidLat = (fromLat + toLat) / 2;
    const straightMidLon = (fromLon + toLon) / 2;
    // The bezier midpoint should differ from the straight midpoint
    const offset = Math.sqrt((mid[0] - straightMidLat) ** 2 + (mid[1] - straightMidLon) ** 2);
    expect(offset).toBeGreaterThan(0.01);
  });
});
