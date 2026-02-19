import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

const SECTIONS = [
  {
    title: 'Notre organisation',
    desc: 'Gouvernance, conseil d\u2019administration, commissions sp\u00e9cialis\u00e9es et partenariats institutionnels.',
    href: '/qui-sommes-nous/organisation',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-blue">
        <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M8 26C8 21.582 11.582 18 16 18C20.418 18 24 21.582 24 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Nos missions',
    desc: 'Repr\u00e9sentation, promotion et d\u00e9fense de la fili\u00e8re du transport combin\u00e9 aupr\u00e8s des pouvoirs publics.',
    href: '/qui-sommes-nous/missions',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-blue">
        <path d="M16 4L4 10V22L16 28L28 22V10L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 16V28" stroke="currentColor" strokeWidth="2" />
        <path d="M4 10L16 16L28 10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Notre histoire',
    desc: 'De 1945 \u00e0 aujourd\u2019hui, plus de 80 ans au service du transport combin\u00e9 en France.',
    href: '/qui-sommes-nous/histoire',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-blue">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
        <path d="M16 8V16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function QuiSommesNousPage() {
  return (
    <PageLayout
      title="Qui sommes-nous ?"
      subtitle="Cr&eacute;&eacute; en 1945, le GNTC est l&rsquo;organisation professionnelle repr&eacute;sentant l&rsquo;ensemble de la fili&egrave;re du transport combin&eacute; en France."
      hero
      breadcrumbs={[{ label: 'Qui sommes-nous' }]}
    >
      <div className="max-w-3xl mb-12">
        <p className="text-muted leading-relaxed">
          Regroupant des op&eacute;rateurs et des transporteurs de combin&eacute; Rail-Route ou Fleuve-Route,
          ainsi que des gestionnaires de plateformes, ports, loueurs ou constructeurs, le GNTC participe
          &agrave; la promotion, la valorisation et la d&eacute;fense des int&eacute;r&ecirc;ts de l&rsquo;intermodalit&eacute;
          pour le transport de marchandises. Fort de ses valeurs, le GNTC soutient un mode de transport
          de fret durable, &eacute;cologique et citoyen.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue/20 transition-all"
          >
            <div className="mb-4">{s.icon}</div>
            <h2 className="text-lg font-display font-bold text-text mb-2 group-hover:text-blue transition-colors">
              {s.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
            <div className="mt-4 text-sm font-medium text-blue flex items-center gap-1">
              En savoir plus
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
