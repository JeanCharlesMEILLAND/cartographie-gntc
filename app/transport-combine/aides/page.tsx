import PageLayout from '@/components/Site/PageLayout';

const AIDES = [
  {
    title: 'Aide \u00e0 l\u2019exploitation du transport combin\u00e9',
    amount: '47 M\u20ac/an',
    desc: 'Subvention annuelle de l\u2019\u00c9tat visant \u00e0 compenser le diff\u00e9rentiel de co\u00fbt entre le transport combin\u00e9 et le tout-routier. Elle couvre une partie des co\u00fbts de transbordement et de traction ferroviaire.',
    beneficiaires: 'Op\u00e9rateurs de transport combin\u00e9',
    conditions: [
      'Service r\u00e9gulier de transport combin\u00e9 rail-route ou fleuve-route',
      'Maillon principal ferroviaire ou fluvial d\u2019au moins 100 km',
      'Pr\u00e9/post-acheminement routier inf\u00e9rieur \u00e0 150 km',
    ],
  },
  {
    title: 'Certificats d\u2019\u00c9conomie d\u2019\u00c9nergie (CEE)',
    amount: 'Variable',
    desc: 'Le report modal g\u00e9n\u00e8re des \u00e9conomies d\u2019\u00e9nergie valorisables via le dispositif CEE. Chaque tonne-km report\u00e9e de la route vers le rail ou le fluvial g\u00e9n\u00e8re des certificats monnayables.',
    beneficiaires: 'Transporteurs et chargeurs',
    conditions: [
      'Report modal effectif de la route vers le rail ou le fluvial',
      'Justificatifs de transport (lettres de voiture, etc.)',
      'Dossier CEE mont\u00e9 avec un partenaire agr\u00e9\u00e9 (ex: HELLIO)',
    ],
  },
  {
    title: 'Compensation des p\u00e9ages ferroviaires',
    amount: '~100 M\u20ac/an',
    desc: 'L\u2019\u00c9tat compense une partie des p\u00e9ages ferroviaires (redevances d\u2019acc\u00e8s au r\u00e9seau) pour le fret, rendant le rail plus comp\u00e9titif face \u00e0 la route.',
    beneficiaires: 'Entreprises ferroviaires de fret',
    conditions: [
      'Trains de fret circulant sur le r\u00e9seau ferr\u00e9 national',
      'Compensation calcul\u00e9e sur la base des sillons-km',
    ],
  },
  {
    title: 'Plan France Relance / France 2030',
    amount: 'Enveloppes sp\u00e9cifiques',
    desc: 'Financements pour la modernisation des plateformes multimodales, l\u2019acquisition de mat\u00e9riel roulant et le d\u00e9veloppement de nouvelles liaisons.',
    beneficiaires: 'Gestionnaires de plateformes, op\u00e9rateurs',
    conditions: [
      'Projets d\u2019investissement contribuant au report modal',
      'Dossier de demande de subvention aupr\u00e8s de l\u2019ADEME ou DGITM',
    ],
  },
];

export default function AidesPage() {
  return (
    <PageLayout
      title="Les aides au transport combin\u00e9"
      subtitle="Plusieurs dispositifs publics soutiennent le d&eacute;veloppement du transport combin&eacute; en France."
      breadcrumbs={[
        { label: 'Transport combin\u00e9', href: '/transport-combine' },
        { label: 'Aides' },
      ]}
    >
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
