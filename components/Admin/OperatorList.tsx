'use client';

import { useEffect, useMemo, useState } from 'react';
import { TransportData } from '@/lib/types';
import { getOperatorComparison } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import { getOperatorLogo, getOperatorContact, hasContact } from '@/lib/operatorContacts';
import { useAdminNav } from '@/lib/useAdminNav';

interface Props {
  data: TransportData;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorList({ data, onSave, saving }: Props) {
  const { navigateToOperator, navigateToOperatorFlux } = useAdminNav();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [dbOperators, setDbOperators] = useState<string[]>([]);

  // Fetch operators from DB to include those without services
  useEffect(() => {
    fetch('/api/admin/operators')
      .then((r) => r.ok ? r.json() : [])
      .then((ops: { name: string }[]) => setDbOperators(ops.map((o) => o.name)))
      .catch(() => {});
  }, []);

  const operators = useMemo(() => {
    const fromServices = getOperatorComparison(data.routes, data.services);
    const serviceNames = new Set(fromServices.map((o) => o.operator));
    // Ajouter les opérateurs DB qui n'ont pas encore de services
    const emptyOps = dbOperators
      .filter((name) => !serviceNames.has(name))
      .map((name) => ({
        operator: name,
        stats: { platformCount: 0, routeCount: 0, trainsPerWeek: 0, serviceCount: 0, platforms: [] as string[] },
      }));
    return [...fromServices, ...emptyOps];
  }, [data.routes, data.services, dbOperators]);

  const totalTrains = data.routes.reduce((sum, r) => sum + r.freq, 0);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/admin/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.error || 'Erreur');
        return;
      }
      setNewName('');
      setShowAdd(false);
      // Refresh la liste des opérateurs DB
      fetch('/api/admin/operators')
        .then((r) => r.ok ? r.json() : [])
        .then((ops: { name: string }[]) => setDbOperators(ops.map((o) => o.name)))
        .catch(() => {});
    } catch {
      setAddError('Erreur réseau');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text">
          {operators.length} opérateurs actifs
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs px-3 py-1.5 rounded-md bg-blue text-white hover:bg-blue/90 transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un opérateur
        </button>
      </div>

      {/* Add operator form */}
      {showAdd && (
        <div className="glass-panel rounded-lg p-4 mb-4 border border-blue/20">
          <h4 className="text-xs font-semibold text-text mb-3">Nouvel opérateur</h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nom de l'opérateur"
              className="flex-1 text-xs bg-white border border-border rounded-md px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:border-blue/50"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="text-xs px-4 py-2 rounded-md bg-blue text-white hover:bg-blue/90 disabled:opacity-40 transition-colors"
            >
              {adding ? 'Ajout...' : 'Créer'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); setAddError(''); }}
              className="text-xs px-3 py-2 rounded-md border border-border text-muted hover:text-text transition-colors"
            >
              Annuler
            </button>
          </div>
          {addError && (
            <p className="text-[10px] text-orange mt-2">{addError}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map(({ operator, stats }) => {
          const color = getOperatorColor(operator);
          const pct = totalTrains > 0
            ? Math.round((stats.trainsPerWeek / totalTrains) * 100)
            : 0;

          return (
            <button
              key={operator}
              onClick={() => navigateToOperator(operator)}
              className="glass-panel rounded-lg p-4 text-left hover:border-blue/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                {getOperatorLogo(operator) ? (
                  <img src={getOperatorLogo(operator)!} alt="" className="w-6 h-6 rounded object-contain flex-shrink-0" />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-xs font-semibold text-text group-hover:text-blue transition-colors truncate">
                  {operator}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <div className="text-sm font-mono font-bold text-blue">{stats.platformCount}</div>
                  <div className="text-[9px] text-muted">plateformes</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-purple">{stats.routeCount}</div>
                  <div className="text-[9px] text-muted">liaisons</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-cyan">{stats.trainsPerWeek}</div>
                  <div className="text-[9px] text-muted">trains/sem</div>
                </div>
              </div>

              {/* Share bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-[10px] text-muted">{pct}% du réseau</span>
              </div>

              {/* Contact + actions */}
              <div className="mt-3 flex items-center justify-between">
                <span
                  onClick={(e) => { e.stopPropagation(); navigateToOperatorFlux(operator); }}
                  className="text-[10px] text-muted hover:text-cyan transition-colors"
                >
                  Voir les flux →
                </span>
                {hasContact(operator) && (() => {
                  const c = getOperatorContact(operator)!;
                  return (
                    <div className="flex items-center gap-2 text-[10px]">
                      {c.email && (
                        <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors" title={c.email}>
                          email
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone.replace(/\s/g, '')}`} onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors" title={c.phone}>
                          tel
                        </a>
                      )}
                      {c.website && (
                        <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue hover:text-cyan transition-colors" title={c.website}>
                          web
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
