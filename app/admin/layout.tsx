import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <style>{`html, body { overflow: auto !important; height: auto !important; }`}</style>
      {children}
    </SessionProvider>
  );
}
