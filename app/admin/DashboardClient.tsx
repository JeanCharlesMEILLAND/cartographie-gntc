'use client';

import { useAdminData } from '@/lib/adminContext';
import Dashboard from '@/components/Admin/Dashboard';

export default function DashboardClient() {
  const { data } = useAdminData();

  if (!data) {
    return <div className="text-cyan animate-pulse text-xs">Chargement du tableau de bord...</div>;
  }

  return <Dashboard data={data} />;
}
