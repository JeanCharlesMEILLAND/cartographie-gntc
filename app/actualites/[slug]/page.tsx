import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';
import { ARTICLES, getArticleBySlug, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/actualites';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return notFound();

  return (
    <PageLayout
      title={article.title}
      breadcrumbs={[
        { label: 'Actualit\u00e9s', href: '/actualites' },
        { label: CATEGORY_LABELS[article.category] },
      ]}
    >
      {/* Meta */}
      <div className="flex items-center gap-3 mb-8">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
          style={{ background: CATEGORY_COLORS[article.category] }}
        >
          {CATEGORY_LABELS[article.category]}
        </span>
        <span className="text-sm text-muted">
          {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Content */}
      <div
        className="prose prose-sm max-w-none mb-12
          prose-p:text-muted prose-p:leading-relaxed
          prose-headings:font-display prose-headings:text-text
          prose-a:text-blue prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Back link */}
      <div className="border-t border-gray-100 pt-6">
        <Link href="/actualites" className="inline-flex items-center gap-2 text-sm text-blue hover:underline">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M3 7L6.5 3.5M3 7L6.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour aux actualit&eacute;s
        </Link>
      </div>
    </PageLayout>
  );
}
