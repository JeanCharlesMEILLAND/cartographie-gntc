'use client';

import { useEffect, useState } from 'react';

export default function UserManager() {
  const [users, setUsers] = useState<{ id: number; email: string; name: string; role: string; operator: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'operator', operator: '' });
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ email: '', password: '', name: '', role: 'operator', operator: '' });
      fetchUsers();
    } else {
      const data = await res.json();
      setFormError(data.error || 'Erreur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  if (loading) return <div className="text-cyan animate-pulse text-xs">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted">{users.length} utilisateurs</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-blue hover:text-cyan transition-colors px-3 py-1.5 rounded-md border border-border hover:border-blue/30"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Mot de passe</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-1.5 text-text focus:outline-none focus:border-blue/50"
              >
                <option value="operator">Opérateur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {form.role === 'operator' && (
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Opérateur lié</label>
              <input
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
                placeholder="Ex: Naviland Cargo, Novatrans..."
                className="w-full text-xs bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted focus:outline-none focus:border-blue/50"
              />
            </div>
          )}
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="text-xs px-4 py-1.5 rounded-md bg-blue/20 text-blue border border-blue/30 hover:bg-blue/30">
              Créer
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs px-4 py-1.5 rounded-md text-muted hover:text-text border border-border">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[rgba(10,15,30,0.6)]">
              <th className="text-left font-medium text-muted px-3 py-2">Nom</th>
              <th className="text-left font-medium text-muted px-3 py-2">Email</th>
              <th className="text-left font-medium text-muted px-3 py-2">Rôle</th>
              <th className="text-left font-medium text-muted px-3 py-2">Opérateur</th>
              <th className="text-right font-medium text-muted px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-[rgba(20,30,60,0.3)]">
                <td className="px-3 py-1.5">{u.name}</td>
                <td className="px-3 py-1.5 text-muted">{u.email}</td>
                <td className="px-3 py-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple/10 text-purple' : 'bg-blue/10 text-blue'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-muted">{u.operator || '—'}</td>
                <td className="px-3 py-1.5 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-[10px] text-muted hover:text-red-400 transition-colors"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
