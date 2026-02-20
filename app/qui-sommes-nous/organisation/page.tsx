import PageLayout from '@/components/Site/PageLayout';

const CA_MEMBERS = [
  { name: 'Rémy CROCHET', role: 'Président', company: 'Froidcombi' },
];

const COMMISSIONS = [
  {
    name: 'Commission Route',
    desc: 'Regroupe les transporteurs routiers membres du GNTC. Défend les intérêts des entreprises de transport qui utilisent le combiné pour la partie routière.',
    members: 'Transporteurs routiers adhérents',
  },
  {
    name: 'Commission Rail',
    desc: 'Rassemble les opérateurs de transport combiné rail-route. Travaille sur les enjeux de capacité, de qualité de sillons et de cotût d\'accès au réseau ferré.',
    members: 'Opérateurs de combiné rail-route',
  },
  {
    name: 'Commission Fluvial',
    desc: 'Réunit les acteurs du transport combiné fleuve-route. Travaille sur le développement des liaisons fluviales et l\'accès aux ports intérieurs.',
    members: 'Opérateurs fluviaux et ports',
  },
];

const PARTNERS = [
  { name: 'UIRR', desc: 'Union Internationale des sociétés de transport combiné Rail-Route — représentation européenne' },
  { name: 'SNCF Réseau', desc: 'Gestionnaire du réseau ferré national' },
  { name: 'VNF', desc: 'Voies Navigables de France — gestionnaire du réseau fluvial' },
  { name: 'ADEME', desc: 'Agence de la transition écologique' },
  { name: 'HELLIO', desc: 'Partenaire pour les Certificats d\'Économie d\'Énergie (CEE)' },
  { name: 'DGITM', desc: 'Direction générale des infrastructures, des transports et des mobilités' },
];

export default function OrganisationPage() {
  return (
    <PageLayout
      title="Notre organisation"
      subtitle="Le GNTC fédère une cinquantaine d'adhérents représentant toute la chaîne du transport combiné."
      breadcrumbs={[
        { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
        { label: 'Organisation' },
      ]}
    >
      {/* Présidence et CA */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Gouvernance</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CA_MEMBERS.map((m) => (
            <div key={m.name} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue/10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-xl font-display font-bold text-blue">
                  {m.name.split(' ').map(w => w[0]).join('')}
                </span>
              </div>
              <div className="font-display font-bold text-text">{m.name}</div>
              <div className="text-sm text-blue font-medium">{m.role}</div>
              <div className="text-xs text-muted mt-1">{m.company}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted mt-4">
          Le Groupement est administr&eacute; par un Comit&eacute; de Direction &eacute;lu pour trois ans
          par l&rsquo;Assembl&eacute;e G&eacute;n&eacute;rale ordinaire et parmi les membres titulaires.
        </p>
        <p className="text-sm text-muted mt-2">
          Le Conseil d&rsquo;Administration est compos&eacute; de repr&eacute;sentants des diff&eacute;rentes familles d&rsquo;adh&eacute;rents :
          transporteurs routiers, op&eacute;rateurs de combin&eacute;, gestionnaires de plateformes, acteurs ferroviaires et fluviaux.
        </p>
      </section>

      {/* Commissions */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Commissions sp&eacute;cialis&eacute;es</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {COMMISSIONS.map((c) => (
            <div key={c.name} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-display font-bold text-text mb-2">{c.name}</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">{c.desc}</p>
              <div className="text-xs text-blue font-medium">{c.members}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Contact</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-display font-bold text-blue">G</span>
            </div>
            <div>
              <div className="font-display font-bold text-text">Secrétariat du GNTC</div>
              <div className="text-xs text-muted mt-0.5">secretariat@gntc.fr · +33 6.81.84.26.21</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaires institutionnels */}
      <section>
        <h2 className="text-xl font-display font-bold text-text mb-6">Partenaires institutionnels</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNERS.map((p) => (
            <div key={p.name} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="font-display font-bold text-text mb-1">{p.name}</div>
              <p className="text-sm text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
