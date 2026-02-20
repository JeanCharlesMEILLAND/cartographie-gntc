'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';
import { ACTEURS, CATEGORY_META, searchActeurs, type ActeurCategory } from '@/lib/acteurs';

const CATEGORIES = Object.entries(CATEGORY_META) as [ActeurCategory, typeof CATEGORY_META[ActeurCategory]][];

export default function ActeursPage() {
  const [query, setQuery] = useState('');
  const results = query.trim() ? searchActeurs(query) : null;

  return (
    <PageLayout
      title="Annuaire des acteurs"
      subtitle="Retrouvez l&rsquo;ensemble des adh&eacute;rents et partenaires du GNTC : op&eacute;rateurs, plateformes, acteurs ferroviaires et fluviaux."
      hero
      breadcrumbs={[{ label: 'Acteurs' }]}
    >
      {/* Search bar */}
      <div className="mb-10">
        <div className="relative max-w-xl mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un acteur, une ville, une sp&eacute;cialit&eacute;..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text text-sm">
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {results ? (
        <div className="mb-12">
          <div className="text-sm text-muted mb-4">{results.length} r&eacute;sultat{results.length !== 1 ? 's' : ''} pour &laquo;&nbsp;{query}&nbsp;&raquo;</div>
          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((a) => (
                <div key={a.slug} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    {a.logo ? (
                      <img src={a.logo} alt={a.name} className="w-10 h-10 object-contain rounded flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-lg" style={{ background: (a.color || '#1a4d2e') + '15' }}>
                        {CATEGORY_META[a.category].icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-text text-sm truncate">{a.name}</h3>
                      <div className="text-xs text-muted">{CATEGORY_META[a.category].label}{a.location ? ` · ${a.location}` : ''}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">{a.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted text-sm">Aucun r&eacute;sultat trouv&eacute;.</div>
          )}
        </div>
      ) : (
        <>
          {/* Category cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {CATEGORIES.map(([key, meta]) => {
              const count = ACTEURS.filter((a) => a.category === key).length;
              return (
                <Link
                  key={key}
                  href={meta.href}
                  className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-display font-bold text-text group-hover:text-blue transition-colors">{meta.labelPlural}</h2>
                        <span className="text-xs font-mono bg-blue/10 text-blue px-2 py-0.5 rounded-full">{count}</span>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{meta.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-muted group-hover:text-blue group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="none">
                      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Global stats */}
          <section>
            <h2 className="text-xl font-display font-bold text-text mb-6">Le r&eacute;seau GNTC en chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: String(ACTEURS.length), label: 'acteurs référencés' },
                { value: String(ACTEURS.filter((a) => a.category === 'operateur').length), label: 'opérateurs TC' },
                { value: String(ACTEURS.filter((a) => a.category === 'plateforme').length), label: 'plateformes & ports' },
                { value: '4', label: 'catégories d\'acteurs' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                  <div className="text-2xl font-display font-bold gntc-gradient">{s.value}</div>
                  <div className="text-xs text-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </PageLayout>
  );
}
