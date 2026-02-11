/**
 * Calculate Bézier curve points between two geographic coordinates.
 * The curve is offset perpendicular to the line by 18% of the distance.
 */
export function getBezierPoints(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  numPoints: number = 25
): [number, number][] {
  const midLat = (fromLat + toLat) / 2;
  const midLon = (fromLon + toLon) / 2;

  // Perpendicular offset (18% of distance)
  const dLat = toLat - fromLat;
  const dLon = toLon - fromLon;
  const dist = Math.sqrt(dLat * dLat + dLon * dLon);
  const offset = dist * 0.18;

  // Perpendicular direction (rotate 90°)
  const perpLat = -dLon / dist;
  const perpLon = dLat / dist;

  const ctrlLat = midLat + perpLat * offset;
  const ctrlLon = midLon + perpLon * offset;

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const u = 1 - t;
    // Quadratic Bézier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const lat = u * u * fromLat + 2 * u * t * ctrlLat + t * t * toLat;
    const lon = u * u * fromLon + 2 * u * t * ctrlLon + t * t * toLon;
    points.push([lat, lon]);
  }

  return points;
}
