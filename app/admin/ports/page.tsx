'use client';

import { useState, useEffect, useCallback } from 'react';

interface Port {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  nature: string | null;
  source: string;
  sourceId: string | null;
  commune: string | null;
  operator: string | null;
  gestion: string | null;
  zone: string | null;
  cargo: string | null;
  hasCommerce: number | null;
  visible: number | null;
  updatedAt: string;
}

export default function PortsPage() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const fetchPorts = useCallback(async () => {
    const res = await fetch('/api/admin/ports');
    if (res.ok) setPorts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPorts(); }, [fetchPorts]);

  const toggleVisible = async (port: Port) => {
    const newVisible = port.visible === 1 ? 0 : 1;
    await fetch('/api/admin/ports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: port.id, visible: newVisible }),
    });
    setPorts((prev) => prev.map((p) => p.id === port.id ? { ...p, visible: newVisible } : p));
  };

  const deletePort = async (id: number) => {
    if (!confirm('Supprimer ce port ?')) return;
    await fetch(`/api/admin/ports?id=${id}`, { method: 'DELETE' });
    setPorts((prev) => prev.filter((p) => p.id !== id));
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cron/sync-ports', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SYNC_SECRET || 'admin-sync'}` },
      });
      const data = await res.json();
      alert(`Sync terminee : ${data.synced?.sandre || 0} Sandre + ${data.synced?.overpass || 0} Overpass${data.errors?.length ? '\nErreurs: ' + data.errors.join(', ') : ''}`);
      await fetchPorts();
    } catch {
      alert('Erreur de synchronisation');
    }
    setSyncing(false);
  };

  const filtered = ports.filter((p) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      (p.commune || '').toLowerCase().includes(q) ||
      (p.nature || '').toLowerCase().includes(q) ||
      p.source.toLowerCase().includes(q);
  });

  const sourceColors: Record<string, string> = {
    sandre: '#0277BD',
    osm: '#4CAF50',
    manual: '#FF9800',
  };

  if (loading) {
    return <div className="text-cyan animate-pulse text-xs p-4">Chargement des ports...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-text">Ports de fret</h2>
          <p className="text-[10px] text-muted">
            {ports.length} ports ({ports.filter((p) => p.source === 'sandre').length} Sandre,{' '}
            {ports.filter((p) => p.source === 'osm').length} OSM,{' '}
            {ports.filter((p) => p.source === 'manual').length} manuels)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={syncNow}
            disabled={syncing}
            className="px-3 py-1.5 text-[10px] font-medium rounded bg-blue/10 text-blue hover:bg-blue/20 transition-colors disabled:opacity-50"
          >
            {syncing ? 'Synchronisation...' : 'Forcer la sync'}
          </button>
          <button
            onClick={() => setAddOpen(!addOpen)}
            className="px-3 py-1.5 text-[10px] font-medium rounded bg-green/10 text-green hover:bg-green/20 transition-colors"
            style={{ color: '#4CAF50' }}
          >
            + Ajouter un port
          </button>
        </div>
      </div>

      {/* Add form */}
      {addOpen && <AddPortForm onAdded={() => { fetchPorts(); setAddOpen(false); }} />}

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher par nom, commune, nature..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-3 py-1.5 text-xs rounded border border-border bg-surface text-text placeholder:text-muted"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-surface border-b border-border text-muted">
              <th className="text-left px-3 py-2 font-medium">Nom</th>
              <th className="text-left px-3 py-2 font-medium">Nature</th>
              <th className="text-left px-3 py-2 font-medium">Source</th>
              <th className="text-left px-3 py-2 font-medium">Commune</th>
              <th className="text-center px-3 py-2 font-medium">Fret</th>
              <th className="text-center px-3 py-2 font-medium">Visible</th>
              <th className="text-right px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((port) => (
              <tr key={port.id} className="border-b border-border/50 hover:bg-blue/5 transition-colors">
                <td className="px-3 py-1.5 font-medium text-text max-w-[200px] truncate">{port.name}</td>
                <td className="px-3 py-1.5 text-muted">{port.nature || '-'}</td>
                <td className="px-3 py-1.5">
                  <span
                    className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium text-white"
                    style={{ backgroundColor: sourceColors[port.source] || '#666' }}
                  >
                    {port.source}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-muted">{port.commune || '-'}</td>
                <td className="text-center px-3 py-1.5">
                  {port.hasCommerce ? (
                    <span className="text-green-400">oui</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="text-center px-3 py-1.5">
                  <button
                    onClick={() => toggleVisible(port)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      port.visible ? 'bg-blue' : 'bg-muted/30'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        port.visible ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="text-right px-3 py-1.5">
                  {port.source === 'manual' && (
                    <button
                      onClick={() => deletePort(port.id)}
                      className="text-red-400 hover:text-red-300 text-[10px]"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddPortForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [nature, setNature] = useState('Fluvial');

  const submit = async () => {
    if (!name || !lat || !lon) return;
    await fetch('/api/admin/ports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, latitude: lat, longitude: lon, nature }),
    });
    onAdded();
  };

  return (
    <div className="p-3 rounded border border-border bg-surface space-y-2">
      <h3 className="text-[11px] font-semibold text-text">Ajouter un port manuellement</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <input
          placeholder="Nom du port"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-2 py-1 text-[11px] rounded border border-border bg-bg text-text"
        />
        <input
          placeholder="Latitude (ex: 48.93)"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="px-2 py-1 text-[11px] rounded border border-border bg-bg text-text"
        />
        <input
          placeholder="Longitude (ex: 2.30)"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          className="px-2 py-1 text-[11px] rounded border border-border bg-bg text-text"
        />
        <select
          value={nature}
          onChange={(e) => setNature(e.target.value)}
          className="px-2 py-1 text-[11px] rounded border border-border bg-bg text-text"
        >
          <option value="Fluvial">Fluvial</option>
          <option value="Maritime">Maritime</option>
          <option value="Fluvio-maritime">Fluvio-maritime</option>
        </select>
      </div>
      <button
        onClick={submit}
        disabled={!name || !lat || !lon}
        className="px-3 py-1 text-[10px] font-medium rounded bg-blue text-white hover:bg-blue/80 disabled:opacity-50"
      >
        Ajouter
      </button>
    </div>
  );
}
