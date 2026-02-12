import { Service } from './types';

const DAY_ORDER: Record<string, number> = {
  Lu: 0, Ma: 1, Me: 2, Je: 3, Ve: 4, Sa: 5, Di: 6,
};

const WEEK_MINUTES = 7 * 24 * 60; // 10080

/** Convert a day abbreviation + "HH:MM" time to minutes since Monday 00:00 */
export function dayTimeToMinutes(day: string, time: string): number {
  const dayIndex = DAY_ORDER[day] ?? 0;
  const [h, m] = time.split(':').map(Number);
  return dayIndex * 24 * 60 + (h || 0) * 60 + (m || 0);
}

/**
 * Returns the progress [0..1] of a train at `currentMinutes` (since Mon 00:00).
 * Returns null if the train is not in transit at that time.
 */
export function getTrainProgress(
  depMinutes: number,
  arrMinutes: number,
  currentMinutes: number,
): number | null {
  // Handle multi-day journeys where arrival is in a later week-day
  let duration = arrMinutes - depMinutes;
  if (duration <= 0) duration += WEEK_MINUTES; // wraps around the week

  // Normalize current time relative to departure
  let elapsed = currentMinutes - depMinutes;
  if (elapsed < 0) elapsed += WEEK_MINUTES;

  if (elapsed > duration) return null; // not in transit
  return duration > 0 ? elapsed / duration : null;
}

/**
 * Interpolate a position along a polyline path.
 * t=0 → first point, t=1 → last point.
 * Uses cumulative segment lengths for accurate geographic interpolation.
 */
export function interpolateAlongPath(
  points: [number, number][],
  t: number,
): [number, number] {
  if (points.length === 0) return [0, 0];
  if (points.length === 1 || t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];

  // Compute cumulative distances
  const dists: number[] = [0];
  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    const dlat = points[i][0] - points[i - 1][0];
    const dlon = points[i][1] - points[i - 1][1];
    totalDist += Math.sqrt(dlat * dlat + dlon * dlon);
    dists.push(totalDist);
  }

  if (totalDist === 0) return points[0];

  const targetDist = t * totalDist;

  // Find the segment containing targetDist
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist) {
      const segLen = dists[i] - dists[i - 1];
      const segT = segLen > 0 ? (targetDist - dists[i - 1]) / segLen : 0;
      const lat = points[i - 1][0] + segT * (points[i][0] - points[i - 1][0]);
      const lon = points[i - 1][1] + segT * (points[i][1] - points[i - 1][1]);
      return [lat, lon];
    }
  }

  return points[points.length - 1];
}

/** Get the current day abbreviation */
export function getCurrentDay(): string {
  const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  return days[new Date().getDay()];
}

/** Get current time as minutes since 00:00 */
export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
