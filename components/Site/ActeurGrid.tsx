'use client';

import { useState } from 'react';
import { type Acteur, CATEGORY_META } from '@/lib/acteurs';

function ActeurCard({ acteur, expanded, onToggle }: { acteur: Acteur; expanded: boolean; onToggle: () => void }) {
  const meta = CATEGORY_META[acteur.category];

  return (
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'border-blue/30 shadow-lg' : 'border-gray-100 hover:shadow-md'}`}>
      {/* Header */}
      <button onClick={onToggle} className="w-full text-left p-5 flex items-start gap-4">
        {acteur.logo ? (
          <img src={acteur.logo} alt={acteur.name} className="w-12 h-12 object-contain rounded flex-shrink-0" />
        ) : (
          <div
            className="w-12 h-12 rounded flex-shrink-0 flex items-center justify-center font-display font-bold text-sm"
            style={{ background: (acteur.color || '#1a4d2e') + '15', color: acteur.color || '#1a4d2e' }}
          >
            {acteur.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-text">{acteur.name}</h3>
          <div className="text-xs text-muted mt-0.5">
            {meta.label}
            {acteur.location ? ` · ${acteur.location}` : ''}
          </div>
          {!expanded && (
            <p className="text-xs text-muted leading-relaxed mt-2 line-clamp-2">{acteur.description}</p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-muted flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          <p className="text-sm text-muted leading-relaxed">{acteur.description}</p>

          {/* Specialties */}
          {acteur.specialites && acteur.specialites.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {acteur.specialites.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-blue/5 text-blue font-medium">{s}</span>
              ))}
            </div>
          )}

          {/* Contact info */}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {acteur.contact && (
              <div>
                <div className="text-xs font-semibold text-text uppercase tracking-wider mb-0.5">Contact</div>
                <div className="text-muted">{acteur.contact}</div>
              </div>
            )}
            {acteur.address && (
              <div>
                <div className="text-xs font-semibold text-text uppercase tracking-wider mb-0.5">Adresse</div>
                <div className="text-muted">{acteur.address}</div>
              </div>
            )}
            {acteur.phone && (
              <div>
                <div className="text-xs font-semibold text-text uppercase tracking-wider mb-0.5">T&eacute;l&eacute;phone</div>
                <a href={`tel:${acteur.phone.replace(/\s/g, '')}`} className="text-blue hover:underline">{acteur.phone}</a>
              </div>
            )}
            {acteur.email && (
              <div>
                <div className="text-xs font-semibold text-text uppercase tracking-wider mb-0.5">Email</div>
                <a href={`mailto:${acteur.email}`} className="text-blue hover:underline">{acteur.email}</a>
              </div>
            )}
          </div>

          {/* Website link */}
          {acteur.website && (
            <a
              href={acteur.website.startsWith('http') ? acteur.website : `https://${acteur.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue hover:underline"
            >
              {acteur.website}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ActeurGrid({ acteurs, showSearch = true }: { acteurs: Acteur[]; showSearch?: boolean }) {
  const [query, setQuery] = useState('');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filtered = query.trim()
    ? acteurs.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase()) ||
          a.location?.toLowerCase().includes(query.toLowerCase()) ||
          a.specialites?.some((s) => s.toLowerCase().includes(query.toLowerCase())),
      )
    : acteurs;

  return (
    <div>
      {showSearch && (
        <div className="relative max-w-md mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
          />
        </div>
      )}

      <div className="text-xs text-muted mb-4">
        {filtered.length} acteur{filtered.length !== 1 ? 's' : ''}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <ActeurCard
            key={a.slug}
            acteur={a}
            expanded={expandedSlug === a.slug}
            onToggle={() => setExpandedSlug(expandedSlug === a.slug ? null : a.slug)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted text-sm">Aucun acteur trouv&eacute;.</div>
      )}
    </div>
  );
}
