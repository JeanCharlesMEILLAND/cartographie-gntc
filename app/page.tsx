import Link from 'next/link';
import SiteHeader from '@/components/Site/SiteHeader';
import SiteFooter from '@/components/Site/SiteFooter';
import { getLatestArticles, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/actualites';

const STATS = [
  { value: '1 000 000', label: 'camions retirés des routes par an' },
  { value: '1 000 000', label: 'tonnes de CO₂ économisées par an' },
  { value: '-85%', label: "d'émissions de CO₂ vs tout-routier" },
  { value: '21', label: 'opérateurs de transport combiné' },
];

const STEPS = [
  {
    number: '01',
    title: 'Pré-acheminement',
    desc: 'Le transporteur routier achemine les marchandises depuis le lieu de chargement vers la plateforme multimodale la plus proche.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-blue">
        <rect x="4" y="14" width="22" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M26 18H32L36 22V28H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="31" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="31" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Transport principal',
    desc: 'Les marchandises voyagent par rail ou voie fluviale sur la longue distance, dans des UTI (conteneurs, caisses mobiles, semi-remorques).',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-blue">
        <rect x="6" y="8" width="28" height="22" rx="4" stroke="currentColor" strokeWidth="2" />
        <line x1="6" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="2" />
        <circle cx="14" cy="34" r="2.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="26" cy="34" r="2.5" stroke="currentColor" strokeWidth="2" />
        <line x1="14" y1="30" x2="14" y2="31.5" stroke="currentColor" strokeWidth="2" />
        <line x1="26" y1="30" x2="26" y2="31.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Post-acheminement',
    desc: 'Un dernier trajet routier court livre les marchandises à destination finale. Le service est porte-à-porte, comme le tout-routier.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-blue">
        <path d="M20 6L8 14V30L20 38L32 30V14L20 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="20" cy="22" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M20 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const PARTNERS = [
  { name: 'VNF', logo: '/logos/partenaires/vnf.png' },
  { name: 'SNCF Réseau', logo: '/logos/partenaires/sncf-reseau.png' },
  { name: 'ADEME', logo: '/logos/partenaires/ademe.png' },
  { name: 'UIRR', logo: '/logos/partenaires/uirr.jpg' },
  { name: 'HELLIO', logo: '/logos/partenaires/hellio.jpg' },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative bg-[#0f2818] overflow-hidden">
          <img src="/images/banners/combilettre-transport-combine.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f2818]/80 via-[#0f2818]/60 to-[#0f2818]/80" />
          <div className="relative w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-blue bg-blue/10 border border-blue/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                Depuis 1945
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
                Le transport combin&eacute;, fer de lance de la{' '}
                <span className="gntc-gradient">transition &eacute;cologique</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl">
                Le GNTC f&eacute;d&egrave;re et repr&eacute;sente l&apos;ensemble de la fili&egrave;re du transport combin&eacute; en France.
                Une solution logistique sobre en &eacute;nergie qui r&eacute;duit de 85% les &eacute;missions de CO&sup2; par rapport au tout-routier.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/carte"
                  className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="9" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Explorer la carte
                </Link>
                <Link
                  href="/carte"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Trouver un transport
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative -mt-8 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-display font-bold gntc-gradient mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-text mb-3">Comment &ccedil;a marche ?</h2>
              <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
                Le transport combin&eacute; allie la souplesse du routier &agrave; l&apos;efficacit&eacute; du ferroviaire et du fluvial.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {STEPS.map((step) => (
                <div key={step.number} className="relative bg-white rounded-xl border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] font-mono font-bold text-blue/40 uppercase tracking-widest mb-4">
                    &Eacute;tape {step.number}
                  </div>
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-lg font-display font-bold text-text mb-2">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Carte */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-[#1a4d2e]/10 via-[#84cc16]/5 to-[#1a4d2e]/10">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text mb-3">
              Explorez le r&eacute;seau de transport combin&eacute;
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto mb-8">
              Visualisez les liaisons, les plateformes multimodales, les op&eacute;rateurs et trouvez le meilleur itin&eacute;raire pour vos marchandises.
            </p>
            <Link
              href="/carte"
              className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Ouvrir la carte interactive
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Latest news */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-text mb-2">Derni&egrave;res actualit&eacute;s</h2>
                <p className="text-sm text-muted">Suivez l&apos;actualit&eacute; du transport combin&eacute; en France.</p>
              </div>
              <Link href="/actualites" className="hidden sm:inline-flex items-center gap-1 text-sm text-blue font-medium hover:underline">
                Toutes les actus
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {getLatestArticles(3).map((a) => (
                <Link key={a.slug} href={`/actualites/${a.slug}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
                  {a.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: CATEGORY_COLORS[a.category] }}>
                        {CATEGORY_LABELS[a.category]}
                      </span>
                      <span className="text-xs text-muted">{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h3 className="font-display font-bold text-text group-hover:text-blue transition-colors mb-2 line-clamp-2">{a.title}</h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-3">{a.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="sm:hidden mt-6 text-center">
              <Link href="/actualites" className="text-sm text-blue font-medium hover:underline">Toutes les actualit&eacute;s &rarr;</Link>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-12 sm:py-16">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Nos partenaires</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
              {PARTNERS.map((p) => (
                <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="h-10 sm:h-12 object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300" />
              ))}
            </div>
          </div>
        </section>

        {/* Video section */}
        <section className="py-16 sm:py-24">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-text mb-3">En vid&eacute;o</h2>
              <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
                Retrouvez les conf&eacute;rences de la Journ&eacute;e du Transport Combin&eacute;.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-lg">
                  <iframe
                    src="https://www.youtube.com/embed/mY1DAoMd76Y"
                    title="Journ&eacute;e du Transport Combin&eacute; 2025"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <h3 className="font-display font-bold text-text mt-4 text-center">Journ&eacute;e du TC 2025</h3>
              </div>
              <div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-lg">
                  <iframe
                    src="https://www.youtube.com/embed/VgEJpVqpw0A"
                    title="Journ&eacute;e du Transport Combin&eacute; 2024"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <h3 className="font-display font-bold text-text mt-4 text-center">Journ&eacute;e du TC 2024</h3>
              </div>
              <div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-lg">
                  <iframe
                    src="https://www.youtube.com/embed/wjoksD263PE"
                    title="Journ&eacute;e du Transport Combin&eacute; 2023"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <h3 className="font-display font-bold text-text mt-4 text-center">Journ&eacute;e du TC 2023</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-12 sm:py-16 bg-[#0f2818]">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">COMBILETTRE</h2>
            <p className="text-sm text-gray-400 mb-6">
              Recevez chaque mois les actualit&eacute;s du transport combin&eacute; directement dans votre bo&icirc;te mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 text-sm px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue/50"
              />
              <button className="gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg hover:shadow-lg transition-all flex-shrink-0">
                S&apos;inscrire
              </button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
