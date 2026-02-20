import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

const SECTIONS = [
  {
    title: 'Définition',
    desc: 'Qu\'est-ce que le transport combiné ? Comprendre le processus en 3 étapes, les UTI et le rôle de chaque acteur.',
    href: '/transport-combine/definition',
    color: 'from-blue to-blue/70',
  },
  {
    title: 'Les flux en France',
    desc: 'Cartographie des corridors de transport combiné : axes Nord-Sud, transversaux, internationaux et fluviaux.',
    href: '/transport-combine/flux',
    color: 'from-cyan to-cyan/70',
  },
  {
    title: 'Durabilité',
    desc: 'Un mode de transport durable, écologique et citoyen. Chiffres clés et calculateur d\'émissions CO₂.',
    href: '/transport-combine/durabilite',
    color: 'from-blue to-cyan',
  },
  {
    title: 'Les aides',
    desc: 'Aide à l\'exploitation, CEE, compensation de péages : toutes les aides au transport combiné.',
    href: '/transport-combine/aides',
    color: 'from-cyan to-blue/70',
  },
];

export default function TransportCombinePage() {
  return (
    <PageLayout
      title="Le transport combiné"
      subtitle="Le transport combin&eacute; allie la souplesse de la route &agrave; l&rsquo;efficacit&eacute; du ferroviaire et du fluvial pour le transport de marchandises."
      hero
      breadcrumbs={[{ label: 'Transport combiné' }]}
    >
      <div className="grid sm:grid-cols-2 gap-6">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group relative bg-white rounded-xl border border-gray-100 p-8 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${s.color}`} />
            <h2 className="text-lg font-display font-bold text-text mb-2 group-hover:text-blue transition-colors">
              {s.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
            <div className="mt-4 text-sm font-medium text-blue flex items-center gap-1">
              D&eacute;couvrir
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
