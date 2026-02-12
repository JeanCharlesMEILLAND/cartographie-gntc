'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TransportData } from '@/lib/types';
import { useAdminStore, AdminTab } from '@/store/useAdminStore';
import Dashboard from '@/components/Admin/Dashboard';
import PlatformTable from '@/components/Admin/PlatformTable';
import PlatformDetail from '@/components/Admin/PlatformDetail';
import FluxTable from '@/components/Admin/FluxTable';
import OperatorList from '@/components/Admin/OperatorList';
import OperatorView from '@/components/Admin/OperatorView';
import UserManager from '@/components/Admin/UserManager';

export default function AdminPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<TransportData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { activeTab, setActiveTab, selectedPlatformSite } = useAdminStore();

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';
  const userOperator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  // Set default tab based on role
  useEffect(() => {
    if (!isAdmin && userOperator) {
      setActiveTab('operator');
    }
  }, [isAdmin, userOperator, setActiveTab]);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data');
    const json = await res.json();
    setData(json);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  ];

  const operatorTabs: { key: AdminTab; label: string }[] = [
    { key: 'operator', label: 'Mon activité' },
    { key: 'flux', label: `Mes flux` },
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
          <h1 className="text-sm font-display font-bold text-text">Administration</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue/10 text-blue border border-blue/20">
            {isAdmin ? 'Admin' : userOperator || 'Opérateur'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{session?.user?.email}</span>
          {message && (
            <span className={`text-xs ${message.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </span>
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

        {/* Admin: Platforms master-detail */}
        {activeTab === 'platforms' && isAdmin && (
          <div className={`flex gap-4 ${selectedPlatformSite ? '' : ''}`}>
            <div className={selectedPlatformSite ? 'w-[58%] flex-shrink-0' : 'w-full'}>
              <PlatformTable data={data} onSave={handleSave} saving={saving} />
            </div>
            {selectedPlatformSite && (
              <div className="w-[42%] flex-shrink-0">
                <PlatformDetail data={data} onSave={handleSave} />
              </div>
            )}
          </div>
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

        {/* Operator view */}
        {activeTab === 'operator' && userOperator && (
          <OperatorView
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
      </div>
    </div>
  );
}
