import PageLayout from '@/components/Site/PageLayout';
import ActeurGrid from '@/components/Site/ActeurGrid';
import { getActeursByCategory, CATEGORY_META } from '@/lib/acteurs';

export default function PlateformesPage() {
  const acteurs = getActeursByCategory('plateforme');
  const meta = CATEGORY_META.plateforme;

  return (
    <PageLayout
      title={meta.labelPlural}
      subtitle={meta.description}
      breadcrumbs={[
        { label: 'Acteurs', href: '/acteurs' },
        { label: 'Plateformes' },
      ]}
    >
      {/* Overview */}
      <div className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-6 sm:p-8 mb-10">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">{acteurs.length}</div>
            <div className="text-xs text-muted mt-1">plateformes &amp; ports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">~40</div>
            <div className="text-xs text-muted mt-1">terminaux en France</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">3</div>
            <div className="text-xs text-muted mt-1">modes connect&eacute;s (rail, route, fluvial)</div>
          </div>
        </div>
      </div>

      <ActeurGrid acteurs={acteurs} />

      {/* Info box */}
      <section className="mt-12 bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-display font-bold text-text mb-2">Voir les plateformes sur la carte</h3>
        <p className="text-sm text-muted mb-4">
          Retrouvez l&rsquo;emplacement de toutes les plateformes multimodales sur notre carte interactive.
        </p>
        <a
          href="/carte"
          className="inline-flex items-center gap-2 text-sm text-blue font-semibold hover:underline"
        >
          Ouvrir la carte interactive
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>
    </PageLayout>
  );
}
