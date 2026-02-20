import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

const STEPS = [
  {
    number: '01',
    title: 'Pré-acheminement routier',
    desc: 'Le transporteur routier achemine les marchandises depuis le lieu de chargement (usine, entrepôt) vers la plateforme multimodale la plus proche. Ce trajet routier est généralement court (moins de 150 km).',
    detail: 'Le chargement s\'effectue dans une Unité de Transport Intermodale (UTI) : conteneur, caisse mobile ou semi-remorque adaptée.',
  },
  {
    number: '02',
    title: 'Transport principal ferroviaire ou fluvial',
    desc: 'Les UTI sont transbordées sur un train ou une barge fluviale pour la longue distance. C\'est le cœur du transport combiné : la partie la plus écologique et la plus efficiente.',
    detail: 'Un train de transport combiné transporte en moyenne 30 à 40 UTI, soit l\'équivalent de 30 à 40 poids-lourds retirés de la route.',
  },
  {
    number: '03',
    title: 'Post-acheminement routier',
    desc: 'Un dernier trajet routier court livre les marchandises à destination finale. Le service est porte-à-porte, identique au tout-routier pour le client.',
    detail: 'Le destinataire reçoit sa marchandise comme avec un transport routier classique, sans différence de service.',
  },
];

const UTIS = [
  {
    name: 'Conteneur',
    desc: 'Boîte métallique normalisée (20\', 40\', 45\') utilisée pour le transport maritime et terrestre. Manutention par le haut (grue, portique).',
    sizes: "20', 40', 45'",
  },
  {
    name: 'Caisse mobile',
    desc: 'Unité de chargement spécifique au transport combiné terrestre. Plus légère qu\'un conteneur, avec des pieds rétractables pour le stockage.',
    sizes: '7.15m, 7.45m, 13.60m',
  },
  {
    name: 'Semi-remorque',
    desc: 'La semi-remorque entière est chargée sur le wagon. Technique dite de «route roulante» ou «autoroute ferroviaire».',
    sizes: 'Standard 13.60m',
  },
];

export default function DefinitionPage() {
  return (
    <PageLayout
      title="Définition et organisation"
      subtitle="Le transport combin&eacute; est un mode de transport intermodal utilisant principalement le rail ou la voie fluviale pour la longue distance, compl&eacute;t&eacute; par la route pour les parcours terminaux."
      breadcrumbs={[
        { label: 'Transport combiné', href: '/transport-combine' },
        { label: 'Définition' },
      ]}
    >
      {/* Infographic */}
      <section className="mb-12">
        <img src="/images/infographies/3-etapes.jpg" alt="Les 3 étapes du transport combiné" className="w-full rounded-xl border border-gray-100" />
      </section>

      {/* 3 étapes */}
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

      {/* Rôle du transporteur */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-4">Le r&ocirc;le du transporteur</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            En transport combin&eacute;, toutes les composantes qui concourent &agrave; la fabrication du produit
            sont d&rsquo;&eacute;gale importance, mais c&rsquo;est le transporteur routier qui d&eacute;tient le fret.
            Il est ainsi l&rsquo;ensemblier ma&icirc;tre d&rsquo;ouvrage qui imagine, con&ccedil;oit et vend un
            service domicile-domicile.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            D&rsquo;un point de vue soci&eacute;tal, il peut &ecirc;tre une r&eacute;ponse efficace &agrave; la
            p&eacute;nurie de chauffeurs routiers importante en France, tout en permettant une relocalisation
            des emplois.
          </p>
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
