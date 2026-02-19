import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

const STEPS = [
  {
    number: '01',
    title: 'Pr\u00e9-acheminement routier',
    desc: 'Le transporteur routier achemine les marchandises depuis le lieu de chargement (usine, entrep\u00f4t) vers la plateforme multimodale la plus proche. Ce trajet routier est g\u00e9n\u00e9ralement court (moins de 150 km).',
    detail: 'Le chargement s\u2019effectue dans une Unit\u00e9 de Transport Intermodale (UTI) : conteneur, caisse mobile ou semi-remorque adapt\u00e9e.',
  },
  {
    number: '02',
    title: 'Transport principal ferroviaire ou fluvial',
    desc: 'Les UTI sont transbord\u00e9es sur un train ou une barge fluviale pour la longue distance. C\u2019est le c\u0153ur du transport combin\u00e9 : la partie la plus \u00e9cologique et la plus efficiente.',
    detail: 'Un train de transport combin\u00e9 transporte en moyenne 30 \u00e0 40 UTI, soit l\u2019\u00e9quivalent de 30 \u00e0 40 poids-lourds retir\u00e9s de la route.',
  },
  {
    number: '03',
    title: 'Post-acheminement routier',
    desc: 'Un dernier trajet routier court livre les marchandises \u00e0 destination finale. Le service est porte-\u00e0-porte, identique au tout-routier pour le client.',
    detail: 'Le destinataire re\u00e7oit sa marchandise comme avec un transport routier classique, sans diff\u00e9rence de service.',
  },
];

const UTIS = [
  {
    name: 'Conteneur',
    desc: 'Bo\u00eete m\u00e9tallique normalis\u00e9e (20\u2019, 40\u2019, 45\u2019) utilis\u00e9e pour le transport maritime et terrestre. Manutention par le haut (grue, portique).',
    sizes: '20\u2019, 40\u2019, 45\u2019',
  },
  {
    name: 'Caisse mobile',
    desc: 'Unit\u00e9 de chargement sp\u00e9cifique au transport combin\u00e9 terrestre. Plus l\u00e9g\u00e8re qu\u2019un conteneur, avec des pieds r\u00e9tractables pour le stockage.',
    sizes: '7.15m, 7.45m, 13.60m',
  },
  {
    name: 'Semi-remorque',
    desc: 'La semi-remorque enti\u00e8re est charg\u00e9e sur le wagon. Technique dite de \u00ab\u00a0route roulante\u00a0\u00bb ou \u00ab\u00a0autoroute ferroviaire\u00a0\u00bb.',
    sizes: 'Standard 13.60m',
  },
];

export default function DefinitionPage() {
  return (
    <PageLayout
      title="D\u00e9finition et organisation"
      subtitle="Le transport combin&eacute; est un mode de transport intermodal utilisant principalement le rail ou la voie fluviale pour la longue distance, compl&eacute;t&eacute; par la route pour les parcours terminaux."
      breadcrumbs={[
        { label: 'Transport combin\u00e9', href: '/transport-combine' },
        { label: 'D\u00e9finition' },
      ]}
    >
      {/* 3 \u00e9tapes */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-8">Les 3 &eacute;tapes du transport combin&eacute;</h2>
        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex gap-6">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-6 top-14 w-px h-[calc(100%-2rem)] bg-gradient-to-b from-blue/30 to-blue/10" />
              )}
              {/* Number circle */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full gntc-gradient-bg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">{step.number}</span>
              </div>
              {/* Content */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 flex-1">
                <h3 className="font-display font-bold text-text mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-2">{step.desc}</p>
                <p className="text-xs text-blue/70 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UTI */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-2">
          Les Unit&eacute;s de Transport Intermodales (UTI)
        </h2>
        <p className="text-sm text-muted mb-8 max-w-2xl">
          Les marchandises voyagent dans des UTI standardis&eacute;es qui passent du camion au train (ou &agrave; la barge) sans rupture de charge.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {UTIS.map((uti) => (
            <div key={uti.name} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-display font-bold text-text mb-2">{uti.name}</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">{uti.desc}</p>
              <div className="text-xs font-medium text-blue bg-blue/5 px-3 py-1.5 rounded-full inline-block">
                {uti.sizes}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-display font-bold text-text mb-2">
          Visualisez le r&eacute;seau en action
        </h2>
        <p className="text-sm text-muted mb-6">
          D&eacute;couvrez les liaisons, les plateformes et les op&eacute;rateurs sur notre carte interactive.
        </p>
        <Link
          href="/carte"
          className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Ouvrir la carte
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </section>
    </PageLayout>
  );
}
