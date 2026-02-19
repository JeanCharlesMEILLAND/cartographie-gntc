import { auth } from '@cartographie/shared/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import AdminShell from '@/components/Admin/AdminShell';
import { ErrorBoundary } from '@cartographie/shared/ui';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <style>{`html, body { overflow: auto !important; height: auto !important; }`}</style>
      <AdminShell>
        <ErrorBoundary fallbackMessage="Erreur dans le panneau d'administration">
          {children}
        </ErrorBoundary>
      </AdminShell>
    </SessionProvider>
  );
}
