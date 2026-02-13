'use client';

import { useAdminData } from '@/lib/adminContext';
import OperatorList from '@/components/Admin/OperatorList';

export default function OperateursPage() {
  const { data, handleSave, saving } = useAdminData();

  if (!data) {
    return <div className="text-cyan animate-pulse text-xs">Chargement des opérateurs...</div>;
  }

  return <OperatorList data={data} onSave={handleSave} saving={saving} />;
}
