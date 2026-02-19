import PageLayout from '@/components/Site/PageLayout';

const MISSIONS = [
  {
    title: 'Repr\u00e9sentation institutionnelle',
    desc: 'Interlocuteur privil\u00e9gi\u00e9 des pouvoirs publics (DGITM, DGEC, Minist\u00e8re des Transports) pour toutes les questions relatives au transport combin\u00e9.',
    icon: '\uD83C\uDFDB\uFE0F',
  },
  {
    title: 'Promotion du transport combin\u00e9',
    desc: 'Faire conna\u00eetre les avantages du transport combin\u00e9 aupr\u00e8s des chargeurs, des collectivit\u00e9s et du grand public. Participation aux salons professionnels (SITL, Transport Logistic).',
    icon: '\uD83D\uDCE2',
  },
  {
    title: 'D\u00e9fense des int\u00e9r\u00eats de la fili\u00e8re',
    desc: 'N\u00e9gociation des aides \u00e0 l\u2019exploitation, des conditions d\u2019acc\u00e8s au r\u00e9seau ferr\u00e9 et du cadre r\u00e9glementaire favorable au report modal.',
    icon: '\uD83D\uDEE1\uFE0F',
  },
  {
    title: 'Suivi des aides publiques',
    desc: 'Gestion et suivi de l\u2019aide \u00e0 l\u2019exploitation du transport combin\u00e9 (47 M\u20ac/an), des CEE et de la compensation des p\u00e9ages ferroviaires.',
    icon: '\uD83D\uDCB0',
  },
  {
    title: 'Observatoire du transport combin\u00e9',
    desc: 'Collecte et analyse des donn\u00e9es statistiques de la fili\u00e8re : volumes, fr\u00e9quences, \u00e9volution des trafics, bilan environnemental.',
    icon: '\uD83D\uDCCA',
  },
  {
    title: 'Coordination europ\u00e9enne',
    desc: 'Repr\u00e9sentation au sein de l\u2019UIRR (Union Internationale Rail-Route) pour porter la voix du combin\u00e9 fran\u00e7ais \u00e0 Bruxelles.',
    icon: '\uD83C\uDDEA\uD83C\uDDFA',
  },
  {
    title: 'Publication et information',
    desc: '\u00c9dition de la COMBILETTRE (newsletter mensuelle), du Guide du combin\u00e9 rail-route, du plan de transport et des rapports annuels.',
    icon: '\uD83D\uDCF0',
  },
  {
    title: 'Certificats d\u2019\u00c9conomie d\u2019\u00c9nergie',
    desc: 'Accompagnement des adh\u00e9rents dans le dispositif CEE pour valoriser les \u00e9conomies d\u2019\u00e9nergie g\u00e9n\u00e9r\u00e9es par le report modal.',
    icon: '\u26A1',
  },
  {
    title: 'D\u00e9veloppement durable',
    desc: 'Quantification et promotion des b\u00e9n\u00e9fices environnementaux du transport combin\u00e9 : r\u00e9duction de CO\u2082, d\u00e9congestion routi\u00e8re, s\u00e9curit\u00e9 routi\u00e8re.',
    icon: '\uD83C\uDF3F',
  },
];

export default function MissionsPage() {
  return (
    <PageLayout
      title="Nos missions"
      subtitle="Le GNTC agit sur 9 dossiers majeurs pour d&eacute;velopper et d&eacute;fendre le transport combin&eacute; en France."
      breadcrumbs={[
        { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
        { label: 'Missions' },
      ]}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MISSIONS.map((m) => (
          <div key={m.title} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">{m.icon}</div>
            <h3 className="font-display font-bold text-text mb-2">{m.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Dossiers majeurs */}
      <section className="mt-16 mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-2">Les dossiers majeurs</h2>
        <p className="text-sm text-muted mb-6 max-w-2xl">
          Le GNTC suit en permanence les dossiers strat&eacute;giques pour la fili&egrave;re du transport combin&eacute;.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Aides \u00e0 la pince (aide \u00e0 l\u2019exploitation)',
            'D\u00e9rogation 46 tonnes pour le transport combin\u00e9',
            'Tarification des sillons ferroviaires',
            'Canal Seine-Nord Europe',
            'R\u00e9vision de la directive europ\u00e9enne transport combin\u00e9',
            'Strat\u00e9gie Nationale Fret Ferroviaire (SNFF)',
            'Qualit\u00e9 de service SNCF R\u00e9seau',
            'Sch\u00e9ma directeur du transport combin\u00e9',
            'Dispositif ReMo (Report Modal)',
            'Certificats d\u2019\u00c9conomie d\u2019\u00c9nergie (CEE)',
          ].map((d) => (
            <div key={d} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-3">
              <div className="w-2 h-2 rounded-full gntc-gradient-bg flex-shrink-0" />
              <span className="text-sm text-text">{d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Key figures */}
      <section>
        <h2 className="text-xl font-display font-bold text-text mb-6">Le GNTC en chiffres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '~50', label: 'adh\u00e9rents' },
            { value: '1945', label: 'ann\u00e9e de cr\u00e9ation' },
            { value: '3', label: 'commissions sp\u00e9cialis\u00e9es' },
            { value: '21', label: 'op\u00e9rateurs repr\u00e9sent\u00e9s' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <div className="text-2xl font-display font-bold gntc-gradient">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
