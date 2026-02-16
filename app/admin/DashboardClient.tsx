'use client';

import { useState } from 'react';
import { useAdminData } from '@/lib/adminContext';
import Dashboard from '@/components/Admin/Dashboard';
import UploadDialog from '@/components/UploadDialog';

export default function DashboardClient() {
  const { data, refetchData } = useAdminData();
  const [uploadOpen, setUploadOpen] = useState(false);

  if (!data) {
    return <div className="text-cyan animate-pulse text-xs">Chargement du tableau de bord...</div>;
  }

  return (
    <>
      <Dashboard data={data} onImport={() => setUploadOpen(true)} />
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => refetchData()}
      />
    </>
  );
}
