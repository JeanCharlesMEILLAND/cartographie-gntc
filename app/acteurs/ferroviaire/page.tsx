import PageLayout from '@/components/Site/PageLayout';
import ActeurGrid from '@/components/Site/ActeurGrid';
import { getActeursByCategory, CATEGORY_META } from '@/lib/acteurs';

export default function FerroviairePage() {
  const acteurs = getActeursByCategory('ferroviaire');
  const meta = CATEGORY_META.ferroviaire;

  return (
    <PageLayout
      title={meta.labelPlural}
      subtitle={meta.description}
      breadcrumbs={[
        { label: 'Acteurs', href: '/acteurs' },
        { label: 'Ferroviaire' },
      ]}
    >
      {/* Overview */}
      <div className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-6 sm:p-8 mb-10">
        <p className="text-sm text-muted leading-relaxed max-w-2xl mx-auto text-center">
          Les acteurs ferroviaires du GNTC regroupent les loueurs de wagons, les fabricants d&rsquo;&eacute;quipements
          intermodaux et les cabinets de conseil sp&eacute;cialis&eacute;s dans le report modal.
          Ils constituent l&rsquo;&eacute;cosyst&egrave;me indispensable au fonctionnement du transport combin&eacute;.
        </p>
      </div>

      <ActeurGrid acteurs={acteurs} />
    </PageLayout>
  );
}
