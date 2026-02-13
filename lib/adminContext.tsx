'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TransportData } from '@/lib/types';

interface AdminContextValue {
  data: TransportData | null;
  saving: boolean;
  message: string;
  handleSave: (updatedData: TransportData) => Promise<void>;
  refetchData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TransportData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data');
    const json = await res.json();
    setData(json);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async (updatedData: TransportData) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        setMessage('Données sauvegardées');
        setData(updatedData);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      setMessage('Erreur réseau');
    }
    setSaving(false);
  }, []);

  return (
    <AdminContext.Provider value={{ data, saving, message, handleSave, refetchData: fetchData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminProvider');
  return ctx;
}
