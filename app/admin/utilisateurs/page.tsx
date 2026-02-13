import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserManager from '@/components/Admin/UserManager';

export default async function UtilisateursPage() {
  const session = await auth();
  if ((session?.user as Record<string, unknown>)?.role !== 'admin') {
    redirect('/admin/profil');
  }

  return <UserManager />;
}
