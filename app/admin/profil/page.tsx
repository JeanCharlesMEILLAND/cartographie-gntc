import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import OperatorProfile from '@/components/Admin/OperatorProfile';

export default async function ProfilPage() {
  const session = await auth();
  const operator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  if (!operator) {
    redirect('/admin');
  }

  return <OperatorProfile operatorName={operator} />;
}
