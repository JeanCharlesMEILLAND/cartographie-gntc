import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function AdminRootPage() {
  const session = await auth();

  // Operators get redirected to their activity dashboard
  if ((session?.user as Record<string, unknown>)?.role !== 'admin') {
    redirect('/admin/activite');
  }

  return <DashboardClient />;
}
