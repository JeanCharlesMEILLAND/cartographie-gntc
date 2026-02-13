'use client';

import { useAdminData } from '@/lib/adminContext';
import PlatformTable from '@/components/Admin/PlatformTable';

export default function PlateformesPage() {
  const { data, handleSave, saving } = useAdminData();

  if (!data) {
    return <div className="text-cyan animate-pulse text-xs">Chargement des plateformes...</div>;
  }

  return <PlatformTable data={data} onSave={handleSave} saving={saving} />;
}
