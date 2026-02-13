'use client';

import { useEffect, useState, useMemo } from 'react';

interface AuditEntry {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  tableName: string;
  recordId: string | null;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'Ajout', color: 'bg-cyan/10 text-cyan' },
  update: { label: 'Modification', color: 'bg-blue/10 text-blue' },
  delete: { label: 'Suppression', color: 'bg-orange/10 text-orange' },
  import: { label: 'Import', color: 'bg-purple/10 text-purple' },
  upload: { label: 'Upload', color: 'bg-purple/10 text-purple' },
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [search, setSearch] = useState('');
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchEntries();
  }, [page]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const users = useMemo(
    () => [...new Set(entries.map((e) => e.userName).filter(Boolean))].sort() as string[],
    [entries]
  );

  const actions = useMemo(
    () => [...new Set(entries.map((e) => e.action))].sort(),
    [entries]
  );

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterAction && e.action !== filterAction) return false;
      if (filterUser && e.userName !== filterUser) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(e.recordId || '').toLowerCase().includes(q) &&
          !(e.tableName || '').toLowerCase().includes(q) &&
          !(e.userName || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [entries, filterAction, filterUser, search]);

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTimeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return formatDate(ts);
  };

  const renderDiff = (entry: AuditEntry) => {
    if (entry.action === 'create' && entry.newValue) {
      try {
        const val = JSON.parse(entry.newValue);
        return (
          <div className="text-[10px] text-muted space-y-0.5">
            {Object.entries(val).map(([k, v]) => (
              <div key={k}>
                <span className="text-text font-medium">{k}</span>: <span className="text-cyan">{String(v)}</span>
              </div>
            ))}
          </div>
        );
      } catch { return <pre className="text-[10px] text-muted whitespace-pre-wrap">{entry.newValue}</pre>; }
    }

    if (entry.action === 'delete' && entry.oldValue) {
      try {
        const val = JSON.parse(entry.oldValue);
        return (
          <div className="text-[10px] text-muted space-y-0.5">
            {Object.entries(val).map(([k, v]) => (
              <div key={k}>
                <span className="text-text font-medium">{k}</span>: <span className="text-orange line-through">{String(v)}</span>
              </div>
            ))}
          </div>
        );
      } catch { return <pre className="text-[10px] text-muted whitespace-pre-wrap">{entry.oldValue}</pre>; }
    }

    if (entry.action === 'update' && entry.oldValue && entry.newValue) {
      try {
        const oldVal = JSON.parse(entry.oldValue);
        const newVal = JSON.parse(entry.newValue);
        const changes = Object.keys(newVal).filter((k) => JSON.stringify(oldVal[k]) !== JSON.stringify(newVal[k]));
        if (changes.length === 0) return <span className="text-[10px] text-muted">Aucun changement</span>;
        return (
          <div className="text-[10px] space-y-0.5">
            {changes.map((k) => (
              <div key={k}>
                <span className="text-text font-medium">{k}</span>:{' '}
                <span className="text-orange line-through">{String(oldVal[k] ?? '—')}</span>
                {' → '}
                <span className="text-cyan">{String(newVal[k] ?? '—')}</span>
              </div>
            ))}
          </div>
        );
      } catch { return null; }
    }

    return null;
  };

  if (loading && entries.length === 0) {
    return <div className="text-cyan animate-pulse text-xs">Chargement de l'historique...</div>;
  }

  const hasFilters = filterAction || filterUser || search;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-bold text-text">Historique des modifications</h2>
        <button
          onClick={fetchEntries}
          className="text-[10px] text-muted hover:text-blue transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted focus:outline-none focus:border-blue/50 w-[180px]"
        />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="text-xs bg-white border border-border rounded-md px-2 py-1.5 text-text focus:outline-none focus:border-blue/50"
        >
          <option value="">Toutes actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]?.label || a}</option>
          ))}
        </select>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="text-xs bg-white border border-border rounded-md px-2 py-1.5 text-text focus:outline-none focus:border-blue/50"
        >
          <option value="">Tous utilisateurs</option>
          {users.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterAction(''); setFilterUser(''); }}
            className="text-[10px] text-muted hover:text-orange transition-colors"
          >
            Effacer filtres
          </button>
        )}
        <span className="text-[10px] text-muted ml-auto">{filtered.length} entrées</span>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-lg p-6 text-center">
          <p className="text-xs text-muted">Aucune modification enregistrée.</p>
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue/5">
                  <th className="text-left font-medium text-muted px-3 py-2 w-36">Date</th>
                  <th className="text-left font-medium text-muted px-3 py-2 w-28">Utilisateur</th>
                  <th className="text-left font-medium text-muted px-3 py-2 w-24">Action</th>
                  <th className="text-left font-medium text-muted px-3 py-2">Détail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const actionInfo = ACTION_LABELS[entry.action] || { label: entry.action, color: 'bg-gray-100 text-gray-600' };
                  const isExpanded = expandedId === entry.id;

                  return (
                    <tr
                      key={entry.id}
                      className="border-t border-border hover:bg-blue/5 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <td className="px-3 py-1.5 align-top">
                        <div className="font-mono text-[10px] text-muted">{formatDate(entry.timestamp)}</div>
                        <div className="text-[9px] text-muted">{formatTimeAgo(entry.timestamp)}</div>
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        {entry.userName || <span className="text-muted">Système</span>}
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${actionInfo.color}`}>
                          {actionInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        <div className="text-[11px] text-text font-medium">{entry.tableName}</div>
                        {entry.recordId && <div className="text-[10px] text-muted truncate max-w-[300px]">{entry.recordId}</div>}
                        {isExpanded && (
                          <div className="mt-2 p-2 bg-white/50 rounded border border-border/50">
                            {renderDiff(entry)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-xs text-muted hover:text-blue disabled:opacity-30 transition-colors"
            >
              Précédent
            </button>
            <span className="text-[10px] text-muted">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={entries.length < PAGE_SIZE}
              className="text-xs text-muted hover:text-blue disabled:opacity-30 transition-colors"
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
}
