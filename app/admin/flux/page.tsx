'use client';

import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';
import FluxTable from '@/components/Admin/FluxTable';

export default function FluxPage() {
  const { data: session } = useSession();
  const { data, handleSave, saving } = useAdminData();

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';
  const userOperator = isAdmin ? undefined : (session?.user as Record<string, unknown>)?.operator as string | undefined;

  if (!data) {
    return <div className="text-cyan animate-pulse text-xs">Chargement des flux...</div>;
  }

  return <FluxTable data={data} onSave={handleSave} saving={saving} userOperator={userOperator} />;
}
