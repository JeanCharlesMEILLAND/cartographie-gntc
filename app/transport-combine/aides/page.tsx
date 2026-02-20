import PageLayout from '@/components/Site/PageLayout';

const AIDES = [
  {
    title: 'Aide à l\'exploitation du transport combiné',
    amount: '47 M€/an',
    desc: 'Subvention annuelle de l\'État visant à compenser le différentiel de coût entre le transport combiné et le tout-routier. Elle couvre une partie des coûts de transbordement et de traction ferroviaire.',
    beneficiaires: 'Opérateurs de transport combiné',
    conditions: [
      'Service régulier de transport combiné rail-route ou fleuve-route',
      'Maillon principal ferroviaire ou fluvial d\'au moins 100 km',
      'Pré/post-acheminement routier inférieur à 150 km',
    ],
  },
  {
    title: 'Certificats d\'Économie d\'Énergie (CEE)',
    amount: 'Variable',
    desc: 'Le report modal génère des économies d\'énergie valorisables via le dispositif CEE. Chaque tonne-km reportée de la route vers le rail ou le fluvial génère des certificats monnayables.',
    beneficiaires: 'Transporteurs et chargeurs',
    conditions: [
      'Report modal effectif de la route vers le rail ou le fluvial',
      'Justificatifs de transport (lettres de voiture, etc.)',
      'Dossier CEE monté avec un partenaire agréé (ex: HELLIO)',
    ],
  },
  {
    title: 'Dérogation 44 tonnes + 2 tonnes',
    amount: 'Avantage opérationnel',
    desc: 'Les véhicules de pré et post-acheminement du transport combiné bénéficient d\'une dérogation de poids à 44 tonnes (contre 40 tonnes en transport routier classique), rendant le combiné plus compétitif.',
    beneficiaires: 'Transporteurs routiers en pré/post-acheminement',
    conditions: [
      'Pré ou post-acheminement d\'un transport combiné',
      'Distance routière inférieure à 150 km',
    ],
  },
];

export default function AidesPage() {
  return (
    <PageLayout
      title="Les aides au transport combiné"
      subtitle="Plusieurs dispositifs publics soutiennent le d&eacute;veloppement du transport combin&eacute; en France."
      breadcrumbs={[
        { label: 'Transport combiné', href: '/transport-combine' },
        { label: 'Aides' },
      ]}
    >
      {/* Contexte légal */}
      <section className="mb-10 bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <p className="text-sm text-muted leading-relaxed">
          Conform&eacute;ment &agrave; la loi de programmation relative &agrave; la mise en &oelig;uvre du Grenelle
          de l&rsquo;environnement, la France met en &oelig;uvre un r&eacute;gime d&rsquo;aides, approuv&eacute;
          par l&rsquo;Union europ&eacute;enne, &agrave; l&rsquo;exploitation de services r&eacute;guliers de
          transport combin&eacute;.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Il s&rsquo;agit de verser une aide forfaitaire par unit&eacute; de transport intermodal &mdash; UTI
          (conteneurs, caisses mobiles, semi-remorques, remorques) transbord&eacute;e dans un terminal terrestre
          ou portuaire.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Un Appel &agrave; manifestation d&rsquo;int&eacute;r&ecirc;t (AMI) pour recenser les trafics de
          l&rsquo;ann&eacute;e est diffus&eacute; aux op&eacute;rateurs de transport combin&eacute;.
        </p>
      </section>

      <div className="space-y-8">
        {AIDES.map((aide) => (
          <div key={aide.title} className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-display font-bold text-text">{aide.title}</h2>
              <div className="flex-shrink-0 text-xl font-display font-bold gntc-gradient">{aide.amount}</div>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-4">{aide.desc}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-text uppercase tracking-wider mb-2">B&eacute;n&eacute;ficiaires</div>
                <div className="text-sm text-muted">{aide.beneficiaires}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Conditions</div>
                <ul className="text-sm text-muted space-y-1">
                  {aide.conditions.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue mt-1 flex-shrink-0">&bull;</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-12 bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8">
        <h2 className="text-lg font-display font-bold text-text mb-2">Besoin d&rsquo;accompagnement ?</h2>
        <p className="text-sm text-muted mb-4">
          Le GNTC accompagne ses adh&eacute;rents dans leurs d&eacute;marches d&rsquo;obtention des aides.
          Contactez-nous pour en savoir plus.
        </p>
        <a
          href="mailto:secretariat@gntc.fr"
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
