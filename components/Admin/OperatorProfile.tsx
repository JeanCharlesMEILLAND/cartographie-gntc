'use client';

import { useEffect, useState, useRef } from 'react';
import { getOperatorLogo } from '@/lib/operatorContacts';

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
  const [dirty, setDirty] = useState(false);
  const savedFormRef = useRef('');
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
          const formData = {
            description: op.description || '',
            website: op.website || '',
            contactEmail: op.contactEmail || '',
            contactPhone: op.contactPhone || '',
            address: op.address || '',
            color: op.color || '',
          };
          setForm(formData);
          savedFormRef.current = JSON.stringify(formData);
          setDirty(false);
        }
      }
    } catch {
      setMessage('Erreur lors du chargement');
    }
    setLoading(false);
  };

  // Track dirty state when form changes
  const updateForm = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch };
    setForm(next);
    setDirty(JSON.stringify(next) !== savedFormRef.current);
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
        savedFormRef.current = JSON.stringify(form);
        setDirty(false);
        setMessage('Sauvegardé');
        setTimeout(() => setMessage(''), 2000);
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
    if (!file.type.startsWith('image/')) { setMessage('Seules les images sont acceptées'); return; }
    if (file.size > 2 * 1024 * 1024) { setMessage('Image trop lourde (max 2 Mo)'); return; }

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
        setMessage("Erreur lors de l'upload");
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

  if (loading) return <div className="text-cyan animate-pulse text-xs">Chargement du profil...</div>;

  if (!operator) {
    return (
      <div className="glass-panel rounded-lg p-6 text-center">
        <p className="text-sm text-muted">Aucune fiche opérateur trouvée pour <strong>{operatorName}</strong>.</p>
        <p className="text-[10px] text-muted mt-2">Demandez à un administrateur d&apos;initialiser les fiches opérateurs.</p>
      </div>
    );
  }

  // Logo: DB base64 first, then static fallback
  const logoSrc = operator.logo || getOperatorLogo(operatorName);

  const inputCls = 'w-full text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50';

  return (
    <div className="space-y-6">
      {/* Two-column form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Présentation with name + logo */}
        <div className="glass-panel rounded-lg p-5 space-y-4">
          {/* Name + Logo header */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue/50 transition-colors relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoSrc ? (
                  <>
                    <img src={logoSrc} alt={operator.name} className="w-full h-full object-contain p-1" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px]">Changer</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mx-auto text-muted">
                      <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 14V17C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[8px] text-muted block mt-0.5">Logo</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {operator.color && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: operator.color }} />}
                <h2 className="text-lg font-display font-bold text-text">{operator.name}</h2>
              </div>
              <p className="text-[10px] text-muted mt-0.5">
                {new Date(operator.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {message && <p className={`text-[10px] ${message.includes('Erreur') ? 'text-orange' : 'text-cyan'}`}>{message}</p>}
                {operator.logo && (
                  <button onClick={handleRemoveLogo} className="text-[10px] text-muted hover:text-orange transition-colors ml-auto">
                    Supprimer le logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Présentation</h3>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder="Décrivez l'activité de l'opérateur, ses spécialités, ses marchés..."
                rows={6}
                className="w-full text-xs bg-white border border-border rounded-md px-3 py-2 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50 resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase block mb-1">Site web</label>
              <input value={form.website} onChange={(e) => updateForm({ website: e.target.value })} placeholder="https://..." className={inputCls} />
            </div>
            {isAdmin && (
              <div>
                <label className="text-[10px] text-muted uppercase block mb-1">Couleur sur la carte</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color || '#587bbd'} onChange={(e) => updateForm({ color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-border" />
                  <input value={form.color} onChange={(e) => updateForm({ color: e.target.value })} placeholder="#587bbd" className="w-28 text-xs bg-white border border-border rounded-md px-3 py-1.5 text-text font-mono placeholder:text-muted/50 focus:outline-none focus:border-blue/50" />
                </div>
              </div>
            )}
          </div>

          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full text-xs py-2 rounded-md bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          )}
        </div>

        {/* Right: contact info */}
        <div className="glass-panel rounded-lg p-5 space-y-4">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Contact</h3>
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Email de contact</label>
            <input type="email" value={form.contactEmail} onChange={(e) => updateForm({ contactEmail: e.target.value })} placeholder="contact@operateur.fr" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Téléphone</label>
            <input value={form.contactPhone} onChange={(e) => updateForm({ contactPhone: e.target.value })} placeholder="+33 1 23 45 67 89" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase block mb-1">Adresse</label>
            <textarea
              value={form.address}
              onChange={(e) => updateForm({ address: e.target.value })}
              placeholder="Adresse du siège social"
              rows={3}
              className="w-full text-xs bg-white border border-border rounded-md px-3 py-2 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50 resize-none"
            />
          </div>

          {/* Quick info display */}
          {(form.website || form.contactEmail || form.contactPhone) && (
            <div className="border-t border-border pt-3 space-y-1.5">
              <h4 className="text-[9px] font-semibold text-muted uppercase tracking-wider">Aperçu</h4>
              {form.website && (
                <a href={form.website.startsWith('http') ? form.website : `https://${form.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue hover:text-cyan transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  {form.website}
                </a>
              )}
              {form.contactEmail && (
                <a href={`mailto:${form.contactEmail}`} className="flex items-center gap-2 text-xs text-blue hover:text-cyan transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  {form.contactEmail}
                </a>
              )}
              {form.contactPhone && (
                <a href={`tel:${form.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-xs text-blue hover:text-cyan transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  {form.contactPhone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
