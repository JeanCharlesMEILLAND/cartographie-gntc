import { create } from 'zustand';

interface AdminState {
  selectedPlatformSite: string | null;
  selectPlatform: (site: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedPlatformSite: null,
  selectPlatform: (site) => set({ selectedPlatformSite: site }),
}));
