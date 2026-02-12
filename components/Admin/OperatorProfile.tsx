'use client';

import { useEffect, useState, useRef } from 'react';

interface OperatorData {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  color: string | null;
  updatedAt: string;
}

interface Props {
  operatorName: string;
  isAdmin?: boolean;
}

export default function OperatorProfile({ operatorName, isAdmin = false }: Props) {
  const [operator, setOperator] = useState<OperatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    color: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOperator();
  }, [operatorName]);

  const fetchOperator = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operators');
      if (res.ok) {
        const data: OperatorData[] = await res.json();
        const op = data.find((o) => o.name === operatorName);
        if (op) {
          setOperator(op);
          setForm({
            description: op.description || '',
            website: op.website || '',
            contactEmail: op.contactEmail || '',
            contactPhone: op.contactPhone || '',
            address: op.address || '',
            color: op.color || '',
          });
        }
      }
    } catch {
      setMessage('Erreur lors du chargement');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!operator) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/operators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: operator.id, ...form }),
      });
      if (res.ok) {
        const { operator: updated } = await res.json();
        setOperator(updated);
        setMessage('Profil sauvegardé');
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: max 2MB, image only
    if (!file.type.startsWith('image/')) {
      setMessage('Seules les images sont acceptées');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image trop lourde (max 2 Mo)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      if (!operator) return;

      setSaving(true);
      try {
        const res = await fetch('/api/admin/operators', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: operator.id, logo: base64 }),
        });
        if (res.ok) {
          const { operator: updated } = await res.json();
          setOperator(updated);
          setMessage('Logo mis à jour');
          setTimeout(() => setMessage(''), 3000);
        }
      } catch {
        setMessage('Erreur lors de l\'upload');
      }
      setSaving(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (!operator) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/operators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: operator.id, logo: null }),
      });
      if (res.ok) {
        const { operator: updated } = await res.json();
        setOperator(updated);
        setMessage('Logo supprimé');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Erreur réseau');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-cyan animate-pulse text-xs">Chargement du profil...</div>;
  }

  if (!operator) {
    return (
      <div className="glass-panel rounded-lg p-6 text-center">
        <p className="text-sm text-muted">
          Aucune fiche opérateur trouvée pour <strong>{operatorName}</strong>.
        </p>
        <p className="text-[10px] text-muted mt-2">
          Demandez à un administrateur d'initialiser les fiches opérateurs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header with logo */}
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Logo area */}
          <div className="flex-shrink-0">
            <div
              className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue/50 transition-colors relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {operator.logo ? (
                <>
                  <img
                    src={operator.logo}
                    alt={operator.name}
                    className="w-full h-full object-contain p-1"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px]">Changer</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-muted">
                    <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 14V17C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[9px] text-muted block mt-1">Upload logo</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {operator.logo && (
              <button
                onClick={handleRemoveLogo}
                className="text-[9px] text-muted hover:text-red-400 transition-colors mt-1.5 block mx-auto"
              >
                Supprimer le logo
              </button>
            )}
          </div>

          {/* Name and meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {operator.color && (
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: operator.color }} />
              )}
              <h2 className="text-lg font-display font-bold text-text">{operator.name}</h2>
            </div>
            <p className="text-[10px] text-muted mt-1">
              Dernière mise à jour : {new Date(operator.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            {/* Status message */}
            {message && (
              <p className={`text-xs mt-2 ${message.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="glass-panel rounded-lg p-6 space-y-4">
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Informations</h3>

        {/* Description */}
        <div>
          <label className="text-[10px] text-muted uppercase block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Présentation de l'opérateur..."
            rows={3}
            className="w-full text-xs bg-white border border-border rounded-md px-3 py-2 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50 resize-none"
          />
        </div>

        {/* Website + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Site web</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Email de contact</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="contact@operateur.fr"
              className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
            />
          </div>
        </div>

        {/* Phone + Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Téléphone</label>
            <input
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="+33 1 23 45 67 89"
              className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Adresse</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Adresse du siège"
              className="w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
            />
          </div>
        </div>

        {/* Color (admin only) */}
        {isAdmin && (
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Couleur sur la carte</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color || '#587bbd'}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="#587bbd"
                className="w-28 text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text font-mono placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs px-6 py-2 rounded-md bg-blue/20 text-blue border border-blue/30 hover:bg-blue/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
