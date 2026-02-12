import { create } from 'zustand';

export type AdminTab = 'dashboard' | 'platforms' | 'operators' | 'flux' | 'users' | 'operator' | 'profile';

interface AdminState {
  activeTab: AdminTab;
  selectedPlatformSite: string | null;
  selectedOperator: string | null;
  fluxOperatorFilter: string | null;

  setActiveTab: (tab: AdminTab) => void;
  selectPlatform: (site: string | null) => void;
  selectOperator: (op: string | null) => void;
  navigateToPlatform: (site: string) => void;
  navigateToOperator: (operator: string) => void;
  navigateToOperatorFlux: (operator: string) => void;
  clearSelection: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeTab: 'dashboard',
  selectedPlatformSite: null,
  selectedOperator: null,
  fluxOperatorFilter: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  selectPlatform: (site) => set({ selectedPlatformSite: site }),

  selectOperator: (op) => set({ selectedOperator: op }),

  navigateToPlatform: (site) =>
    set({ activeTab: 'platforms', selectedPlatformSite: site }),

  navigateToOperator: (operator) =>
    set({ activeTab: 'operators', selectedOperator: operator }),

  navigateToOperatorFlux: (operator) =>
    set({ activeTab: 'flux', fluxOperatorFilter: operator }),

  clearSelection: () =>
    set({ selectedPlatformSite: null, selectedOperator: null, fluxOperatorFilter: null }),
}));
