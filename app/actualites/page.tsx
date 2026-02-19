'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';
import {
  getArticlesByCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type ArticleCategory,
} from '@/lib/actualites';

const CATEGORIES: (ArticleCategory | undefined)[] = [undefined, 'actualite', 'communique', 'ferroviaire', 'vie-adherents', 'evenement'];

export default function ActualitesPage() {
  const [selectedCat, setSelectedCat] = useState<ArticleCategory | undefined>(undefined);
  const articles = getArticlesByCategory(selectedCat);

  return (
    <PageLayout
      title="Actualit&eacute;s"
      subtitle="Suivez l&rsquo;actualit&eacute; du transport combin&eacute; en France : communiqu&eacute;s, &eacute;v&eacute;nements et vie de la fili&egrave;re."
      breadcrumbs={[{ label: 'Actualit\u00e9s' }]}
    >
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCat === cat;
          return (
            <button
              key={cat || 'all'}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? 'text-white'
                  : 'bg-gray-100 text-muted hover:bg-gray-200'
              }`}
              style={isActive ? { background: cat ? CATEGORY_COLORS[cat] : '#3b82f6' } : undefined}
            >
              {cat ? CATEGORY_LABELS[cat] : 'Toutes'}
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="space-y-6 mb-12">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/actualites/${a.slug}`}
            className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: CATEGORY_COLORS[a.category] }}
                  >
                    {CATEGORY_LABELS[a.category]}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-display font-bold text-text group-hover:text-blue transition-colors mb-2">{a.title}</h2>
                <p className="text-sm text-muted leading-relaxed line-clamp-2">{a.excerpt}</p>
              </div>
              <svg className="w-5 h-5 text-muted group-hover:text-blue group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* COMBILETTRE CTA */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{'\uD83D\uDCF0'}</div>
          <div>
            <h2 className="text-lg font-display font-bold text-text mb-2">COMBILETTRE</h2>
            <p className="text-sm text-muted mb-4">
              La newsletter du GNTC, publi&eacute;e tous les deux mois. Retrouvez tous les num&eacute;ros dans nos archives.
            </p>
            <Link
              href="/actualites/combilettre"
              className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Archives COMBILETTRE
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
