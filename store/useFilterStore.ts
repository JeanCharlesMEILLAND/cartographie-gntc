import { create } from 'zustand';

interface FilterState {
  // Filters
  country: 'all' | 'france' | 'international';
  activeOperators: Set<string>;
  minFrequency: number;
  allOperators: string[];

  // Layers
  showRoutes: boolean;
  showPlatforms: boolean;
  showLabels: boolean;
  showRailway: boolean;
  animateFlux: boolean;
  showFranceBorder: boolean;

  // Map
  tileStyle: string;
  railwayStyle: 'standard' | 'maxspeed' | 'signals' | 'electrification';

  // Selected platform for InfoCard
  selectedPlatform: string | null;

  // Filter panel collapsed
  panelCollapsed: boolean;

  // Actions
  setCountry: (c: 'all' | 'france' | 'international') => void;
  toggleOperator: (op: string) => void;
  selectAllOperators: () => void;
  clearOperators: () => void;
  setMinFrequency: (f: number) => void;
  toggleLayer: (layer: 'showRoutes' | 'showPlatforms' | 'showLabels' | 'showRailway' | 'animateFlux' | 'showFranceBorder') => void;
  setTileStyle: (style: string) => void;
  setRailwayStyle: (style: 'standard' | 'maxspeed' | 'signals' | 'electrification') => void;
  setSelectedPlatform: (name: string | null) => void;
  setPanelCollapsed: (collapsed: boolean) => void;
  setAllOperators: (operators: string[]) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  country: 'all',
  activeOperators: new Set<string>(),
  minFrequency: 0,
  allOperators: [],

  showRoutes: true,
  showPlatforms: true,
  showLabels: true,
  showRailway: false,
  animateFlux: false,
  showFranceBorder: true,

  tileStyle: 'carto-dark',
  railwayStyle: 'standard',

  selectedPlatform: null,
  panelCollapsed: false,

  setCountry: (c) => set({ country: c }),

  toggleOperator: (op) => {
    const current = new Set(get().activeOperators);
    if (current.has(op)) {
      current.delete(op);
    } else {
      current.add(op);
    }
    set({ activeOperators: current });
  },

  selectAllOperators: () => {
    set({ activeOperators: new Set(get().allOperators) });
  },

  clearOperators: () => {
    set({ activeOperators: new Set() });
  },

  setMinFrequency: (f) => set({ minFrequency: f }),

  toggleLayer: (layer) => set((state) => ({ [layer]: !state[layer] })),

  setTileStyle: (style) => set({ tileStyle: style }),

  setRailwayStyle: (style) => set({ railwayStyle: style }),

  setSelectedPlatform: (name) => set({ selectedPlatform: name }),

  setPanelCollapsed: (collapsed) => set({ panelCollapsed: collapsed }),

  setAllOperators: (operators) =>
    set({ allOperators: operators, activeOperators: new Set(operators) }),
}));
