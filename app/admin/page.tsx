'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TransportData } from '@/lib/types';
import { useAdminStore, AdminTab } from '@/store/useAdminStore';
import Dashboard from '@/components/Admin/Dashboard';
import PlatformTable from '@/components/Admin/PlatformTable';
import FluxTable from '@/components/Admin/FluxTable';
import OperatorList from '@/components/Admin/OperatorList';
import OperatorView from '@/components/Admin/OperatorView';
import OperatorRoutes from '@/components/Admin/OperatorRoutes';
import UserManager from '@/components/Admin/UserManager';
import OperatorProfile from '@/components/Admin/OperatorProfile';
import AuditLog from '@/components/Admin/AuditLog';
import UploadDialog from '@/components/UploadDialog';
import LoadingScreen from '@/components/LoadingScreen';

interface OperatorInfo {
  id: number;
  name: string;
  logo: string | null;
  color: string | null;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<TransportData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [operatorInfo, setOperatorInfo] = useState<OperatorInfo | null>(null);
  const { activeTab, setActiveTab } = useAdminStore();

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';
  const userOperator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  // Set default tab based on role
  useEffect(() => {
    if (!isAdmin && userOperator) {
      setActiveTab('profile');
    }
  }, [isAdmin, userOperator, setActiveTab]);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data');
    const json = await res.json();
    setData(json);
  }, []);

  // Fetch operator info (logo, color) for header
  const fetchOperatorInfo = useCallback(async () => {
    if (!userOperator) return;
    try {
      const res = await fetch('/api/admin/operators');
      if (res.ok) {
        const ops: OperatorInfo[] = await res.json();
        const op = ops.find((o) => o.name === userOperator);
        if (op) setOperatorInfo(op);
      }
    } catch { /* silent */ }
  }, [userOperator]);

  useEffect(() => {
    fetchData();
    fetchOperatorInfo();
  }, [fetchData, fetchOperatorInfo]);

  const handleSave = async (updatedData: TransportData) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        setMessage('Données sauvegardées');
        setData(updatedData);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      setMessage('Erreur réseau');
    }
    setSaving(false);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-cyan animate-pulse">Chargement...</div>
      </div>
    );
  }

  // Tabs config based on role
  const adminTabs: { key: AdminTab; label: string }[] = [
    { key: 'dashboard', label: 'Tableau de bord' },
    { key: 'platforms', label: `Plateformes (${data.platforms.length})` },
    { key: 'operators', label: `Opérateurs (${data.operators.length})` },
    { key: 'flux', label: `Flux (${data.services.length})` },
    { key: 'users', label: 'Utilisateurs' },
    { key: 'audit', label: 'Historique' },
  ];

  const operatorServices = userOperator
    ? data.services.filter((s) => s.operator === userOperator)
    : [];
  const operatorRouteCount = userOperator
    ? data.routes.filter((r) => r.operators.includes(userOperator)).length
    : 0;

  const operatorTabs: { key: AdminTab; label: string }[] = [
    { key: 'profile', label: 'Mon profil' },
    { key: 'operator', label: 'Mon activité' },
    { key: 'routes', label: `Mes liaisons (${operatorRouteCount})` },
    { key: 'flux', label: `Mes flux (${operatorServices.length})` },
  ];

  const tabs = isAdmin ? adminTabs : operatorTabs;

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <header className="glass-panel border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-muted hover:text-blue text-xs transition-colors">
            &larr; Carte
          </a>

          {/* Operator header with logo */}
          {!isAdmin && operatorInfo?.logo ? (
            <div className="flex items-center gap-2">
              <img
                src={operatorInfo.logo}
                alt={operatorInfo.name}
                className="h-7 w-auto object-contain"
              />
              <h1 className="text-sm font-display font-bold text-text">{operatorInfo.name}</h1>
            </div>
          ) : (
            <h1 className="text-sm font-display font-bold gntc-gradient">Administration</h1>
          )}

          <span className="text-[10px] px-2 py-0.5 rounded bg-blue/10 text-blue border border-blue/20">
            {isAdmin ? 'Admin' : 'Opérateur'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{session?.user?.email}</span>
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

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0 px-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-blue text-blue'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Admin: Dashboard */}
        {activeTab === 'dashboard' && isAdmin && (
          <Dashboard data={data} />
        )}

        {/* Admin: Platforms (inline detail) */}
        {activeTab === 'platforms' && isAdmin && (
          <PlatformTable data={data} onSave={handleSave} saving={saving} />
        )}

        {/* Admin: Operators */}
        {activeTab === 'operators' && isAdmin && (
          <OperatorList data={data} onSave={handleSave} saving={saving} />
        )}

        {/* Flux */}
        {activeTab === 'flux' && (
          <FluxTable
            data={data}
            onSave={handleSave}
            saving={saving}
            userOperator={isAdmin ? undefined : userOperator}
          />
        )}

        {/* Operator profile */}
        {activeTab === 'profile' && userOperator && (
          <OperatorProfile operatorName={userOperator} />
        )}

        {/* Operator activity dashboard */}
        {activeTab === 'operator' && userOperator && (
          <OperatorView
            data={data}
            operator={userOperator}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {/* Operator routes/liaisons */}
        {activeTab === 'routes' && userOperator && (
          <OperatorRoutes
            data={data}
            operator={userOperator}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {/* Users (admin only) */}
        {activeTab === 'users' && isAdmin && (
          <UserManager />
        )}

        {/* Audit log (admin only) */}
        {activeTab === 'audit' && isAdmin && (
          <AuditLog />
        )}
      </div>

      {/* Upload Dialog (admin only) */}
      {isAdmin && (
        <UploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
