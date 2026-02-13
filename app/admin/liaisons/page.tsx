'use client';

import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';
import OperatorRoutes from '@/components/Admin/OperatorRoutes';

export default function LiaisonsPage() {
  const { data: session } = useSession();
  const { data, handleSave, saving } = useAdminData();
  const operator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  if (!data || !operator) {
    return <div className="text-cyan animate-pulse text-xs">Chargement...</div>;
  }

  return <OperatorRoutes data={data} operator={operator} onSave={handleSave} saving={saving} />;
}
