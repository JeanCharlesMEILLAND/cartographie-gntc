import PageLayout from '@/components/Site/PageLayout';

const MISSIONS = [
  {
    title: 'Représentation institutionnelle',
    desc: 'Interlocuteur privilégié des pouvoirs publics (DGITM, DGEC, Ministère des Transports) pour toutes les questions relatives au transport combiné.',
    icon: '🏛️',
  },
  {
    title: 'Promotion du transport combiné',
    desc: 'Faire connaître les avantages du transport combiné auprès des chargeurs, des collectivités et du grand public. Participation aux salons professionnels (SITL, Transport Logistic).',
    icon: '📢',
  },
  {
    title: 'Défense des intérêts de la filière',
    desc: 'Négociation des aides à l\'exploitation, des conditions d\'accès au réseau ferré et du cadre réglementaire favorable au report modal.',
    icon: '🛡️',
  },
  {
    title: 'Suivi des aides publiques',
    desc: 'Gestion et suivi de l\'aide à l\'exploitation du transport combiné (47 M€/an), des CEE et de la compensation des péages ferroviaires.',
    icon: '💰',
  },
  {
    title: 'Observatoire du transport combiné',
    desc: 'Collecte et analyse des données statistiques de la filière : volumes, fréquences, évolution des trafics, bilan environnemental.',
    icon: '📊',
  },
  {
    title: 'Coordination européenne',
    desc: 'Représentation au sein de l\'UIRR (Union Internationale Rail-Route) pour porter la voix du combiné français à Bruxelles.',
    icon: '🇪🇺',
  },
  {
    title: 'Publication et information',
    desc: 'Édition de la COMBILETTRE (newsletter mensuelle), du Guide du combiné rail-route, du plan de transport et des rapports annuels.',
    icon: '📰',
  },
  {
    title: 'Certificats d\'Économie d\'Énergie',
    desc: 'Accompagnement des adhérents dans le dispositif CEE pour valoriser les économies d\'énergie générées par le report modal.',
    icon: '⚡',
  },
  {
    title: 'Développement durable',
    desc: 'Quantification et promotion des bénéfices environnementaux du transport combiné : réduction de CO₂, décongestion routière, sécurité routière.',
    icon: '🌿',
  },
];

export default function MissionsPage() {
  return (
    <PageLayout
      title="Nos missions"
      subtitle="Le GNTC a pour mission de promouvoir et valoriser le transport combin&eacute; sous toutes ses formes, d&rsquo;assurer la d&eacute;fense des int&eacute;r&ecirc;ts de ses membres, et d&rsquo;informer sur des questions techniques ou r&eacute;glementaires. Il est l&rsquo;interlocuteur privil&eacute;gi&eacute; des pouvoirs publics et acteurs du secteur."
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
          Le GNTC suit en permanence 10&nbsp;dossiers strat&eacute;giques pour la fili&egrave;re du transport combin&eacute;.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Les aides \u00e0 la pince',
            'Les indemnisations suite aux mouvements sociaux',
            'La r\u00e9forme et la qualit\u00e9 du service ferroviaire',
            'La tarification des sillons',
            'La d\u00e9rogation de circulation \u00e0 46 tonnes pour le transport combin\u00e9',
            'La mise en place d\'une aide \u00e0 la valorisation de la tonne de CO\u2082 \u00e9conomis\u00e9e',
            'Le suivi de la cr\u00e9ation de nouvelles plateformes',
            'La r\u00e9vision de la directive europ\u00e9enne sur le TCRR',
            'Le r\u00e9gime unique de facturation de la manutention portuaire',
            'Le Canal Seine-Nord',
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
            { value: '~50', label: 'adhérents' },
            { value: '1945', label: 'année de création' },
            { value: '3', label: 'commissions spécialisées' },
            { value: '21', label: 'opérateurs représentés' },
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
