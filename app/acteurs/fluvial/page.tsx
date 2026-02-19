import PageLayout from '@/components/Site/PageLayout';
import ActeurGrid from '@/components/Site/ActeurGrid';
import { getActeursByCategory, CATEGORY_META } from '@/lib/acteurs';

export default function FluvialPage() {
  const acteurs = getActeursByCategory('fluvial');
  const meta = CATEGORY_META.fluvial;

  return (
    <PageLayout
      title={meta.labelPlural}
      subtitle={meta.description}
      breadcrumbs={[
        { label: 'Acteurs', href: '/acteurs' },
        { label: 'Fluvial' },
      ]}
    >
      {/* Overview */}
      <div className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-6 sm:p-8 mb-10">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">{acteurs.length}</div>
            <div className="text-xs text-muted mt-1">acteurs fluviaux</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">6 700</div>
            <div className="text-xs text-muted mt-1">km de voies navigables</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold gntc-gradient">~5%</div>
            <div className="text-xs text-muted mt-1">du trafic combin&eacute;</div>
          </div>
        </div>
      </div>

      <ActeurGrid acteurs={acteurs} />

      {/* Info box */}
      <section className="mt-12 bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-display font-bold text-text mb-2">Le fluvial, un mode d&rsquo;avenir</h3>
        <p className="text-sm text-muted leading-relaxed">
          Le transport combin&eacute; fleuve-route repr&eacute;sente un potentiel de d&eacute;veloppement important.
          Avec ses 6 700 km de voies navigables, la France dispose du plus long r&eacute;seau fluvial d&rsquo;Europe.
          Les axes Seine, Rh&ocirc;ne-Sa&ocirc;ne et le futur Canal Seine-Nord Europe ouvrent de nouvelles perspectives pour le fret.
        </p>
      </section>
    </PageLayout>
  );
}
