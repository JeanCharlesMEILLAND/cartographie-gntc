'use client';

import { useEffect } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';

export function useKeyboardShortcuts() {
  const { setPanelCollapsed, panelCollapsed, setSelectedPlatform } = useFilterStore();
  const { searchOpen, setSearchOpen } = useSearchStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          setPanelCollapsed(!panelCollapsed);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setSearchOpen(!searchOpen);
          break;
        case 'Escape':
          setSelectedPlatform(null);
          if (searchOpen) setSearchOpen(false);
          if (!panelCollapsed) setPanelCollapsed(true);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelCollapsed, searchOpen, setPanelCollapsed, setSearchOpen, setSelectedPlatform]);
}
