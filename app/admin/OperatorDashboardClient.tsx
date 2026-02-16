'use client';

import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';
import OperatorDashboard from '@/components/Admin/OperatorDashboard';

export default function OperatorDashboardClient() {
  const { data: session } = useSession();
  const { data } = useAdminData();
  const operator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  if (!data || !operator) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-cyan animate-pulse text-xs">Chargement...</div>
      </div>
    );
  }

  return <OperatorDashboard data={data} operator={operator} />;
}
