'use client';

import { useEffect, useState } from 'react';

interface Registration {
  id: number;
  company: string;
  activity: string;
  contact: string;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function InscriptionsPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchData = async () => {
    const res = await fetch('/api/admin/registrations');
    if (res.ok) setRows(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/registrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  if (loading) {
    return <div className="text-sm text-gray-500 animate-pulse p-8">Chargement des inscriptions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Demandes d&apos;inscription</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rows.length} demande{rows.length > 1 ? 's' : ''} au total
            {pendingCount > 0 && <span className="ml-2 text-yellow-600 font-medium">({pendingCount} en attente)</span>}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-gray-300">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-sm">Aucune demande d&apos;inscription pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{r.company}</div>
                    <div className="text-xs text-gray-500">{r.activity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${expanded === r.id ? 'rotate-180' : ''}`}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {expanded === r.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Contact</span>
                      <p className="font-medium text-gray-900">{r.contact}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Email</span>
                      <p className="font-medium text-gray-900">
                        <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">{r.email}</a>
                      </p>
                    </div>
                    {r.phone && (
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Téléphone</span>
                        <p className="font-medium text-gray-900">{r.phone}</p>
                      </div>
                    )}
                    {r.website && (
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Site web</span>
                        <p className="font-medium text-gray-900">
                          <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{r.website}</a>
                        </p>
                      </div>
                    )}
                  </div>
                  {r.description && (
                    <div className="mb-4">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Description</span>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.description}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(r.id, 'approved')}
                        className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Approuver
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(r.id, 'rejected')}
                        className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Refuser
                      </button>
                    )}
                    {r.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(r.id, 'pending')}
                        className="text-xs font-semibold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Remettre en attente
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
