import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuditLog from '@/components/Admin/AuditLog';

export default async function HistoriquePage() {
  const session = await auth();
  if ((session?.user as Record<string, unknown>)?.role !== 'admin') {
    redirect('/admin/profil');
  }

  return <AuditLog />;
}
