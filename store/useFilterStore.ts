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
  showWaterways: boolean;
  showPorts: boolean;
  showFranceBorder: boolean;

  // Map
  tileStyle: string;

  // Operators with visible routes (after frequency filter)
  visibleOperators: Set<string>;

  // Operators serving the selected platform
  selectedPlatformOperators: Set<string> | null;

  // Selected platform for InfoCard
  selectedPlatform: string | null;

  // Filter panel collapsed
  panelCollapsed: boolean;

  // Clock
  showClock: boolean;
  clockDay: string;
  clockTime: number;
  clockPlaying: boolean;
  clockLive: boolean;

  // Actions
  setCountry: (c: 'all' | 'france' | 'international') => void;
  toggleOperator: (op: string) => void;
  selectAllOperators: () => void;
  clearOperators: () => void;
  setMinFrequency: (f: number) => void;
  toggleLayer: (layer: 'showRoutes' | 'showPlatforms' | 'showLabels' | 'showWaterways' | 'showPorts' | 'showFranceBorder') => void;
  setTileStyle: (style: string) => void;
  setSelectedPlatform: (name: string | null) => void;
  setSelectedPlatformOperators: (ops: Set<string> | null) => void;
  setPanelCollapsed: (collapsed: boolean) => void;
  setAllOperators: (operators: string[]) => void;
  setVisibleOperators: (ops: Set<string>) => void;
  toggleClock: () => void;
  setClockDay: (day: string) => void;
  setClockTime: (minutes: number) => void;
  setClockPlaying: (playing: boolean) => void;
  setClockLive: (live: boolean) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  country: 'all',
  activeOperators: new Set<string>(),
  minFrequency: 0,
  allOperators: [],

  showRoutes: true,
  showPlatforms: true,
  showLabels: true,
  showWaterways: false,
  showPorts: false,
  showFranceBorder: true,

  visibleOperators: new Set<string>(),
  selectedPlatformOperators: null,

  tileStyle: 'osm-dark',

  selectedPlatform: null,
  panelCollapsed: false,

  showClock: false,
  clockDay: (() => { const d = ['Di','Lu','Ma','Me','Je','Ve','Sa']; return d[new Date().getDay()]; })(),
  clockTime: new Date().getHours() * 60 + new Date().getMinutes(),
  clockPlaying: false,
  clockLive: true,

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

  setSelectedPlatform: (name) => set({ selectedPlatform: name }),

  setSelectedPlatformOperators: (ops) => set({ selectedPlatformOperators: ops }),

  setPanelCollapsed: (collapsed) => set({ panelCollapsed: collapsed }),

  setAllOperators: (operators) =>
    set({ allOperators: operators, activeOperators: new Set(operators) }),

  setVisibleOperators: (ops) => set({ visibleOperators: ops }),

  toggleClock: () => set((s) => ({ showClock: !s.showClock, clockPlaying: false, clockLive: !s.showClock ? true : false })),
  setClockDay: (day) => set({ clockDay: day, clockLive: false }),
  setClockTime: (minutes) => set({ clockTime: minutes }),
  setClockPlaying: (playing) => set({ clockPlaying: playing, clockLive: false }),
  setClockLive: (live) => set({ clockLive: live, clockPlaying: false }),
}));
