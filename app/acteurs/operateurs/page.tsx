import PageLayout from '@/components/Site/PageLayout';
import ActeurGrid from '@/components/Site/ActeurGrid';
import { getActeursByCategory, CATEGORY_META } from '@/lib/acteurs';

export default function OperateursPage() {
  const acteurs = getActeursByCategory('operateur');
  const meta = CATEGORY_META.operateur;

  return (
    <PageLayout
      title={meta.labelPlural}
      subtitle={meta.description}
      breadcrumbs={[
        { label: 'Acteurs', href: '/acteurs' },
        { label: 'Opérateurs' },
      ]}
    >
      {/* Overview */}
      <div className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-6 sm:p-8 mb-10">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">{acteurs.length}</div>
            <div className="text-xs text-muted mt-1">op&eacute;rateurs de transport combin&eacute;</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">~150</div>
            <div className="text-xs text-muted mt-1">liaisons r&eacute;guli&egrave;res</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">~500</div>
            <div className="text-xs text-muted mt-1">trains par semaine</div>
          </div>
        </div>
      </div>

      <ActeurGrid acteurs={acteurs} />

      {/* CTA */}
      <section className="mt-12 text-center">
        <p className="text-sm text-muted mb-4">Vous &ecirc;tes op&eacute;rateur de transport combin&eacute; et souhaitez adh&eacute;rer au GNTC&nbsp;?</p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Nous contacter
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>
    </PageLayout>
  );
}
