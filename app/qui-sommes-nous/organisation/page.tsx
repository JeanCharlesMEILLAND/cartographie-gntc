import PageLayout from '@/components/Site/PageLayout';

const CA_MEMBERS = [
  { name: 'R\u00e9my CROCHET', role: 'Pr\u00e9sident', company: 'GNTC' },
  { name: 'Ivan STEMPEZYNSKI', role: 'Vice-Pr\u00e9sident', company: 'Novatrans' },
  { name: 'Vincent AUSSILLOUX', role: 'Tr\u00e9sorier', company: 'T3M' },
];

const COMMISSIONS = [
  {
    name: 'Commission Route',
    desc: 'Regroupe les transporteurs routiers membres du GNTC. D\u00e9fend les int\u00e9r\u00eats des entreprises de transport qui utilisent le combin\u00e9 pour la partie routi\u00e8re.',
    members: 'Transporteurs routiers adh\u00e9rents',
  },
  {
    name: 'Commission Rail',
    desc: 'Rassemble les op\u00e9rateurs de transport combin\u00e9 rail-route. Travaille sur les enjeux de capacit\u00e9, de qualit\u00e9 de sillons et de cot\u00fbt d\'acc\u00e8s au r\u00e9seau ferr\u00e9.',
    members: 'Op\u00e9rateurs de combin\u00e9 rail-route',
  },
  {
    name: 'Commission Fluvial',
    desc: 'R\u00e9unit les acteurs du transport combin\u00e9 fleuve-route. Travaille sur le d\u00e9veloppement des liaisons fluviales et l\'acc\u00e8s aux ports int\u00e9rieurs.',
    members: 'Op\u00e9rateurs fluviaux et ports',
  },
];

const PARTNERS = [
  { name: 'UIRR', desc: 'Union Internationale des soci\u00e9t\u00e9s de transport combin\u00e9 Rail-Route \u2014 repr\u00e9sentation europ\u00e9enne' },
  { name: 'SNCF R\u00e9seau', desc: 'Gestionnaire du r\u00e9seau ferr\u00e9 national' },
  { name: 'VNF', desc: 'Voies Navigables de France \u2014 gestionnaire du r\u00e9seau fluvial' },
  { name: 'ADEME', desc: 'Agence de la transition \u00e9cologique' },
  { name: 'HELLIO', desc: 'Partenaire pour les Certificats d\u2019\u00c9conomie d\u2019\u00c9nergie (CEE)' },
  { name: 'DGITM', desc: 'Direction g\u00e9n\u00e9rale des infrastructures, des transports et des mobilit\u00e9s' },
];

export default function OrganisationPage() {
  return (
    <PageLayout
      title="Notre organisation"
      subtitle="Le GNTC f\u00e9d\u00e8re une cinquantaine d\u2019adh\u00e9rents repr\u00e9sentant toute la cha\u00eene du transport combin\u00e9."
      breadcrumbs={[
        { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
        { label: 'Organisation' },
      ]}
    >
      {/* Pr\u00e9sidence et CA */}
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

      {/* D\u00e9l\u00e9gu\u00e9 g\u00e9n\u00e9ral */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">&Eacute;quipe permanente</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-display font-bold text-blue">IO</span>
            </div>
            <div>
              <div className="font-display font-bold text-text">Isabelle OCKET</div>
              <div className="text-sm text-blue font-medium">D&eacute;l&eacute;gu&eacute;e G&eacute;n&eacute;rale</div>
              <div className="text-xs text-muted mt-0.5">secretariat@gntc.fr &middot; +33 6.81.84.26.21</div>
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
