export const OPERATOR_COLORS: Record<string, string> = {
  'Naviland Cargo': '#587bbd',
  'Greenmodal': '#7dc243',
  'VIIA': '#a78bfa',
  'Novatrans': '#f59e42',
  'T3M': '#34d399',
  'Combronde': '#f472b6',
  'HUPAC': '#fbbf24',
  'Metrocargo italia srl': '#6ee7b7',
  'Cinerites': '#f87171',
  'Delta Rail': '#818cf8',
  'Froidcombi': '#fb923c',
  'Be Modal Intermodal Transport': '#2dd4bf',
  'Ambrogio Intermodal': '#e879f9',
  'Brittany Ferries': '#facc15',
  'Transports Vigneron': '#4ade80',
  'DB Cargo France': '#f43f5e',
  'Cargo Beamer': '#38bdf8',
};

// Fallback colors for operators not in the predefined list
const EXTRA_COLORS = [
  '#ff6b6b', '#51cf66', '#fcc419', '#845ef7',
  '#22b8cf', '#ff922b', '#20c997', '#cc5de8',
];

let extraIndex = 0;
const dynamicColors: Record<string, string> = {};

export function getOperatorColor(operator: string): string {
  if (OPERATOR_COLORS[operator]) return OPERATOR_COLORS[operator];
  if (dynamicColors[operator]) return dynamicColors[operator];
  dynamicColors[operator] = EXTRA_COLORS[extraIndex % EXTRA_COLORS.length];
  extraIndex++;
  return dynamicColors[operator];
}
