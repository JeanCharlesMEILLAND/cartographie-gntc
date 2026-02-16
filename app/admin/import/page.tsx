'use client';

import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';
import OperatorImport from '@/components/Admin/OperatorImport';

export default function ImportPage() {
  const { data: session } = useSession();
  const { data, handleSave, saving } = useAdminData();
  const userOperator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-cyan animate-pulse text-xs">Chargement...</div>
      </div>
    );
  }

  return (
    <OperatorImport
      data={data}
      operator={userOperator || ''}
      onSave={handleSave}
      saving={saving}
    />
  );
}
