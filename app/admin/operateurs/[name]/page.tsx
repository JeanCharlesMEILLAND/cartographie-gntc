'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminData } from '@/lib/adminContext';
import OperatorView from '@/components/Admin/OperatorView';

export default function OperatorDetailPage() {
  const params = useParams<{ name: string }>();
  const operatorName = decodeURIComponent(params.name);
  const { data, handleSave, saving } = useAdminData();

  if (!data) {
    return <div className="text-cyan animate-pulse text-xs">Chargement...</div>;
  }

  return (
    <div>
      <Link
        href="/admin/operateurs"
        className="text-xs text-muted hover:text-blue transition-colors mb-4 inline-flex items-center gap-1"
      >
        &larr; Retour à la liste des opérateurs
      </Link>
      <OperatorView data={data} operator={operatorName} onSave={handleSave} saving={saving} />
    </div>
  );
}
