import Link from 'next/link';
import SiteHeader from '@/components/Site/SiteHeader';
import SiteFooter from '@/components/Site/SiteFooter';
import { getLatestArticles, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/actualites';

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

        {/* Impact – visual section */}
        <section className="relative -mt-8 z-10 pb-0">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0f2818] rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid lg:grid-cols-2">
                {/* Left – infographic */}
                <div className="relative flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white/5">
                  <img
                    src="/images/infographies/environnement-2.jpg"
                    alt="1 train de transport combin&eacute; = 45 poids lourds"
                    className="w-full max-w-md rounded-lg"
                  />
                </div>
                {/* Right – stats */}
                <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#84cc16] mb-6">Impact environnemental</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                          <path d="M4 17L10 11L14 15L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 7H22V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-white">-85%</div>
                        <div className="text-sm text-gray-400">d&apos;&eacute;missions de CO&#8322; par rapport au tout-routier</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-white">1 million</div>
                        <div className="text-sm text-gray-400">de camions retir&eacute;s des routes chaque ann&eacute;e</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                          <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-white">-59%</div>
                        <div className="text-sm text-gray-400">de consommation d&apos;&eacute;nergie vs transport routier</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <Link href="/transport-combine/durabilite" className="inline-flex items-center gap-2 text-sm font-medium text-[#84cc16] hover:text-white transition-colors">
                      D&eacute;couvrir les chiffres cl&eacute;s
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works – visual */}
        <section className="py-16 sm:py-24">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-text mb-3">Comment &ccedil;a marche&nbsp;?</h2>
              <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
                Le transport combin&eacute; allie la souplesse du routier &agrave; l&apos;efficacit&eacute; du ferroviaire et du fluvial.
              </p>
            </div>

            {/* Large process illustration */}
            <div className="relative max-w-4xl mx-auto mb-12">
              <img
                src="/images/infographies/visuel-tc.jpg"
                alt="Sch&eacute;ma du transport combin&eacute; : camion, grue, train, grue, camion"
                className="w-full rounded-2xl border border-gray-100 shadow-lg"
              />
            </div>

            {/* 3 steps as horizontal timeline */}
            <div className="relative max-w-4xl mx-auto">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-[#1a4d2e] via-[#84cc16] to-[#1a4d2e]" />

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a4d2e] text-white font-display font-bold text-sm mb-4 shadow-lg ring-4 ring-white">
                    01
                  </div>
                  <h3 className="font-display font-bold text-text mb-2">Pr&eacute;-acheminement</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Le transporteur routier achemine les UTI depuis le lieu de chargement vers le terminal multimodal le plus proche.
                  </p>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#84cc16] text-white font-display font-bold text-sm mb-4 shadow-lg ring-4 ring-white">
                    02
                  </div>
                  <h3 className="font-display font-bold text-text mb-2">Transport principal</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Les marchandises voyagent par rail ou voie fluviale sur la longue distance &mdash; 1 train remplace 45 camions.
                  </p>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a4d2e] text-white font-display font-bold text-sm mb-4 shadow-lg ring-4 ring-white">
                    03
                  </div>
                  <h3 className="font-display font-bold text-text mb-2">Post-acheminement</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Un dernier trajet routier court livre &agrave; destination. Le service est porte-&agrave;-porte, comme le tout-routier.
                  </p>
                </div>
              </div>
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
