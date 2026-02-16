import { auth } from '@/lib/auth';
import DashboardClient from './DashboardClient';
import OperatorDashboardClient from './OperatorDashboardClient';

export default async function AdminRootPage() {
  const session = await auth();
  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';

  if (isAdmin) {
    return <DashboardClient />;
  }

  return <OperatorDashboardClient />;
}
