import { create } from 'zustand';
import { FoundRoute, CitySuggestion } from '@/lib/routeFinder';
import { Platform } from '@/lib/types';

export type UTIType = 'cm' | 'cont' | 'semiPre' | 'semiNon' | 'p400';

export interface RoadRouting {
  originCity: string;
  originLat: number;
  originLon: number;
  destCity: string;
  destLat: number;
  destLon: number;
}

interface SearchState {
  // Panel visibility
  searchOpen: boolean;

  // Inputs
  departureQuery: string;
  arrivalQuery: string;
  selectedUTI: Set<UTIType>;

  // City selection step
  departureCitySuggestion: CitySuggestion | null;
  arrivalCitySuggestion: CitySuggestion | null;
  departureSelectedPlatforms: Platform[];
  arrivalSelectedPlatforms: Platform[];

  // Results
  results: FoundRoute[];
  searching: boolean;
  highlightedRouteIndex: number | null;
  roadRouting: RoadRouting | null;

  // Actions
  setSearchOpen: (open: boolean) => void;
  setDepartureQuery: (q: string) => void;
  setArrivalQuery: (q: string) => void;
  toggleUTI: (uti: UTIType) => void;
  setDepartureCitySuggestion: (c: CitySuggestion | null) => void;
  setArrivalCitySuggestion: (c: CitySuggestion | null) => void;
  setDepartureSelectedPlatforms: (p: Platform[]) => void;
  setArrivalSelectedPlatforms: (p: Platform[]) => void;
  setResults: (r: FoundRoute[]) => void;
  setSearching: (s: boolean) => void;
  setHighlightedRouteIndex: (i: number | null) => void;
  setRoadRouting: (r: RoadRouting | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchOpen: false,
  departureQuery: '',
  arrivalQuery: '',
  selectedUTI: new Set<UTIType>(),
  departureCitySuggestion: null,
  arrivalCitySuggestion: null,
  departureSelectedPlatforms: [],
  arrivalSelectedPlatforms: [],
  results: [],
  searching: false,
  highlightedRouteIndex: null,
  roadRouting: null,

  setSearchOpen: (open) => {
    if (!open) {
      // Clear results when closing so all routes come back on the map
      set({
        searchOpen: false,
        results: [],
        highlightedRouteIndex: null,
        roadRouting: null,
        departureCitySuggestion: null,
        arrivalCitySuggestion: null,
        departureSelectedPlatforms: [],
        arrivalSelectedPlatforms: [],
      });
    } else {
      set({ searchOpen: true });
    }
  },
  setDepartureQuery: (q) => set({ departureQuery: q }),
  setArrivalQuery: (q) => set({ arrivalQuery: q }),
  toggleUTI: (uti) => {
    const current = new Set(get().selectedUTI);
    if (current.has(uti)) {
      current.delete(uti);
    } else {
      current.add(uti);
    }
    set({ selectedUTI: current });
  },
  setDepartureCitySuggestion: (c) => set({ departureCitySuggestion: c }),
  setArrivalCitySuggestion: (c) => set({ arrivalCitySuggestion: c }),
  setDepartureSelectedPlatforms: (p) => set({ departureSelectedPlatforms: p }),
  setArrivalSelectedPlatforms: (p) => set({ arrivalSelectedPlatforms: p }),
  setResults: (r) => set({ results: r }),
  setSearching: (s) => set({ searching: s }),
  setHighlightedRouteIndex: (i) => set({ highlightedRouteIndex: i }),
  setRoadRouting: (r) => set({ roadRouting: r }),
  clearSearch: () =>
    set({
      departureQuery: '',
      arrivalQuery: '',
      selectedUTI: new Set(),
      departureCitySuggestion: null,
      arrivalCitySuggestion: null,
      departureSelectedPlatforms: [],
      arrivalSelectedPlatforms: [],
      results: [],
      highlightedRouteIndex: null,
      roadRouting: null,
    }),
}));
