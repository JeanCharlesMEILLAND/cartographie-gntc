import { AggregatedRoute, Platform } from './types';

// ADEME 2024 emission factors (g CO2 / tonne-km)
export const CO2_RAIL = 5.4;    // Electric rail freight (France avg)
export const CO2_ROAD = 68;     // Heavy goods vehicle
const DIESEL_PER_TKM = 0.00032; // Liters diesel per tonne-km (road)
export const AVG_LOAD_TONNES = 20;     // Average load per UTI
const UTI_PER_TRAIN = 30;       // Average UTIs per train
export const ROAD_FACTOR = 1.3; // Road distance ≈ 1.3× straight-line

/** Haversine distance in km between two coordinates */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CO2Stats {
  co2SavedPerWeek: number;    // tonnes CO2 saved per week
  co2SavedPerYear: number;    // tonnes CO2 saved per year
  trucksAvoidedPerWeek: number;
  trucksAvoidedPerYear: number;
  dieselSavedPerYear: number; // liters
  kmAvoidedPerYear: number;   // road km avoided
}

/** Compute CO2 savings for a set of routes */
export function computeCO2Stats(routes: AggregatedRoute[]): CO2Stats {
  let totalTonneKmPerWeek = 0;
  let totalTrainKmPerWeek = 0;

  for (const route of routes) {
    const dist = haversineKm(route.fromLat, route.fromLon, route.toLat, route.toLon);
    // Each freq = 1 train/week on this route
    const trainsPerWeek = route.freq;
    const tonnesPerTrain = UTI_PER_TRAIN * AVG_LOAD_TONNES;
    totalTonneKmPerWeek += dist * tonnesPerTrain * trainsPerWeek;
    totalTrainKmPerWeek += dist * trainsPerWeek;
  }

  // CO2 difference (road vs rail) in grams, then convert to tonnes
  const co2DiffPerTkm = CO2_ROAD - CO2_RAIL; // ~62.6 g/t-km
  const co2SavedPerWeek = (totalTonneKmPerWeek * co2DiffPerTkm) / 1_000_000; // tonnes
  const co2SavedPerYear = co2SavedPerWeek * 52;

  // Trucks avoided: each train replaces ~UTI_PER_TRAIN trucks
  const totalTrainsPerWeek = routes.reduce((s, r) => s + r.freq, 0);
  const trucksAvoidedPerWeek = totalTrainsPerWeek * UTI_PER_TRAIN;
  const trucksAvoidedPerYear = trucksAvoidedPerWeek * 52;

  // Diesel saved
  const dieselSavedPerYear = totalTonneKmPerWeek * 52 * DIESEL_PER_TKM;

  // Road km avoided (road distance ≈ 1.3× straight-line distance)
  const kmAvoidedPerYear = totalTrainKmPerWeek * 52 * UTI_PER_TRAIN * 1.3;

  return {
    co2SavedPerWeek,
    co2SavedPerYear,
    trucksAvoidedPerWeek,
    trucksAvoidedPerYear,
    dieselSavedPerYear,
    kmAvoidedPerYear,
  };
}

/** Compute CO2 savings for a single route (for search results) */
export function computeRouteCO2(fromLat: number, fromLon: number, toLat: number, toLon: number): {
  co2SavedKg: number;
  trucksReplaced: number;
} {
  const dist = haversineKm(fromLat, fromLon, toLat, toLon);
  const tonnesPerTrain = UTI_PER_TRAIN * AVG_LOAD_TONNES;
  const co2DiffPerTkm = CO2_ROAD - CO2_RAIL;
  const co2SavedKg = (dist * tonnesPerTrain * co2DiffPerTkm) / 1000;
  return { co2SavedKg, trucksReplaced: UTI_PER_TRAIN };
}

/** Format large numbers with units */
export function formatCO2(tonnes: number): string {
  if (tonnes >= 1000) return `${(tonnes / 1000).toFixed(1)}k`;
  if (tonnes >= 100) return Math.round(tonnes).toString();
  return tonnes.toFixed(1);
}
