'use client';

import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';
import OperatorView from '@/components/Admin/OperatorView';

export default function ActivitePage() {
  const { data: session } = useSession();
  const { data, handleSave, saving } = useAdminData();
  const operator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  if (!data || !operator) {
    return <div className="text-cyan animate-pulse text-xs">Chargement...</div>;
  }

  return <OperatorView data={data} operator={operator} onSave={handleSave} saving={saving} />;
}
