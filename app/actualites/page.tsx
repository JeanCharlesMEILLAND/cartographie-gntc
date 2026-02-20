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
      breadcrumbs={[{ label: 'Actualités' }]}
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
              style={isActive ? { background: cat ? CATEGORY_COLORS[cat] : '#1a4d2e' } : undefined}
            >
              {cat ? CATEGORY_LABELS[cat] : 'Toutes'}
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/actualites/${a.slug}`}
            className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {a.image && (
              <div className="aspect-[16/9] overflow-hidden">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                  style={{ background: CATEGORY_COLORS[a.category] }}
                >
                  {CATEGORY_LABELS[a.category]}
                </span>
                <span className="text-xs text-muted">
                  {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="font-display font-bold text-text group-hover:text-blue transition-colors mb-2 line-clamp-2">{a.title}</h2>
              <p className="text-sm text-muted leading-relaxed line-clamp-3">{a.excerpt}</p>
              {a.videoId && (
                <div className="mt-2 text-xs text-blue font-medium flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3.5L10.5 7L5 10.5V3.5Z" fill="currentColor" /></svg>
                  Vid&eacute;o disponible
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* COMBILETTRE CTA */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{'📰'}</div>
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
