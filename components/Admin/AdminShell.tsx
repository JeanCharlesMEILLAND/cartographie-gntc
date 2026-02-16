'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AdminProvider, useAdminData } from '@/lib/adminContext';
import AdminNav from './AdminNav';
import UploadDialog from '@/components/UploadDialog';

interface OperatorInfo {
  id: number;
  name: string;
  logo: string | null;
  color: string | null;
}

function AdminHeader() {
  const { data: session } = useSession();
  const { message, refetchData } = useAdminData();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [operatorInfo, setOperatorInfo] = useState<OperatorInfo | null>(null);

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';
  const userOperator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  useEffect(() => {
    if (!userOperator) return;
    fetch('/api/admin/operators')
      .then((res) => (res.ok ? res.json() : []))
      .then((ops: OperatorInfo[]) => {
        const op = ops.find((o) => o.name === userOperator);
        if (op) setOperatorInfo(op);
      })
      .catch(() => {});
  }, [userOperator]);

  return (
    <>
      <header className="glass-panel border-b border-border px-4 py-3 flex items-center justify-between relative">
        {/* Gauche */}
        <div className="flex items-center gap-3">
          <a href="/" className="text-muted hover:text-blue text-xs transition-colors">
            &larr; Carte
          </a>
          {isAdmin && (
            <>
              <h1 className="text-sm font-display font-bold gntc-gradient">Administration</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue/10 text-blue border border-blue/20">Admin</span>
            </>
          )}
        </div>

        {/* Centre — logo + nom opérateur */}
        {!isAdmin && operatorInfo && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            {operatorInfo.logo && (
              <img
                src={operatorInfo.logo}
                alt={operatorInfo.name}
                className="h-7 w-auto object-contain"
              />
            )}
            <h1 className="text-sm font-display font-bold text-text">{operatorInfo.name}</h1>
          </div>
        )}

        {/* Droite */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted hidden sm:inline">{session?.user?.email}</span>
          {message && (
            <span className={`text-xs ${message.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue hover:text-cyan transition-colors px-3 py-1.5 rounded-md border border-border hover:border-blue/30"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 10V2M7 2L4 5M7 2L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 9V11C2 11.55 2.45 12 3 12H11C11.55 12 12 11.55 12 11V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Importer Excel
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-muted hover:text-orange transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {isAdmin && (
        <UploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={() => refetchData()}
        />
      )}
    </>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-bg text-text">
        <AdminHeader />
        <AdminNav />
        <div className="p-4">{children}</div>
      </div>
    </AdminProvider>
  );
}
