import { create } from 'zustand';
import { FoundRoute } from '@/lib/routeFinder';

export type UTIType = 'cm' | 'cont' | 'semiPre' | 'semiNon' | 'p400';

interface SearchState {
  // Panel visibility
  searchOpen: boolean;

  // Inputs
  departureQuery: string;
  arrivalQuery: string;
  selectedUTI: Set<UTIType>;

  // Results
  results: FoundRoute[];
  searching: boolean;
  highlightedRouteIndex: number | null;

  // Actions
  setSearchOpen: (open: boolean) => void;
  setDepartureQuery: (q: string) => void;
  setArrivalQuery: (q: string) => void;
  toggleUTI: (uti: UTIType) => void;
  setResults: (r: FoundRoute[]) => void;
  setSearching: (s: boolean) => void;
  setHighlightedRouteIndex: (i: number | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchOpen: false,
  departureQuery: '',
  arrivalQuery: '',
  selectedUTI: new Set<UTIType>(),
  results: [],
  searching: false,
  highlightedRouteIndex: null,

  setSearchOpen: (open) => {
    if (!open) {
      // Clear results when closing so all routes come back on the map
      set({ searchOpen: false, results: [], highlightedRouteIndex: null });
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
  setResults: (r) => set({ results: r }),
  setSearching: (s) => set({ searching: s }),
  setHighlightedRouteIndex: (i) => set({ highlightedRouteIndex: i }),
  clearSearch: () =>
    set({
      departureQuery: '',
      arrivalQuery: '',
      selectedUTI: new Set(),
      results: [],
      highlightedRouteIndex: null,
    }),
}));
