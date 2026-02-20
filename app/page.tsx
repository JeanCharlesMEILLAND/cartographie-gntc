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
          <img src="/images/banners/combilettre-transport-combine.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2818]/70 via-[#0f2818]/50 to-[#0f2818]/90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#84cc16] bg-[#84cc16]/10 border border-[#84cc16]/25 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
                Depuis 1945
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-display font-bold text-white leading-[1.15] mb-6">
                Le transport combin&eacute;, fer de lance de la{' '}
                <span className="gntc-gradient">transition &eacute;cologique</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300/90 leading-relaxed mb-10 max-w-2xl">
                Le GNTC f&eacute;d&egrave;re et repr&eacute;sente l&apos;ensemble de la fili&egrave;re du transport combin&eacute; en France.
                Une solution logistique sobre en &eacute;nergie qui r&eacute;duit de 85&nbsp;% les &eacute;missions de CO&#8322; par rapport au tout-routier.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/carte"
                  className="inline-flex items-center gap-2.5 gntc-gradient-bg text-white font-semibold text-sm px-7 py-3.5 rounded-lg shadow-lg shadow-[#1a4d2e]/30 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="9" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Explorer la carte
                </Link>
                <Link
                  href="/carte"
                  className="inline-flex items-center gap-2.5 bg-white/10 text-white font-semibold text-sm px-7 py-3.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Trouver un itin&eacute;raire
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Impact – visual section */}
        <section className="relative -mt-10 z-10 mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0f2818] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="grid lg:grid-cols-2 items-stretch">
                {/* Left – infographic */}
                <div className="relative flex items-center justify-center p-8 sm:p-10 lg:p-14 bg-white rounded-b-2xl lg:rounded-bl-2xl lg:rounded-br-none lg:rounded-r-none">
                  <img
                    src="/images/infographies/environnement-2.jpg"
                    alt="1 train de transport combin&eacute; = 45 poids lourds"
                    className="w-full max-w-sm"
                  />
                </div>
                {/* Right – stats */}
                <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-8">Impact environnemental</h2>
                  <div className="space-y-7">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                          <path d="M4 17L10 11L14 15L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 7H22V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none mb-1">-85&nbsp;%</div>
                        <div className="text-sm text-gray-400 leading-snug">d&apos;&eacute;missions de CO&#8322; par rapport au tout-routier</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none mb-1">1 million</div>
                        <div className="text-sm text-gray-400 leading-snug">de camions retir&eacute;s des routes chaque ann&eacute;e</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                          <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none mb-1">-59&nbsp;%</div>
                        <div className="text-sm text-gray-400 leading-snug">de consommation d&apos;&eacute;nergie vs transport routier</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-white/10">
                    <Link href="/transport-combine/durabilite" className="inline-flex items-center gap-2 text-sm font-semibold text-[#84cc16] hover:text-white transition-colors">
                      D&eacute;couvrir tous les chiffres
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-3">Le processus</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text mb-4">Comment &ccedil;a marche&nbsp;?</h2>
              <p className="text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Le transport combin&eacute; allie la souplesse du routier &agrave; l&apos;efficacit&eacute; du ferroviaire et du fluvial.
              </p>
            </div>

            {/* Large process illustration */}
            <div className="relative max-w-4xl mx-auto mb-16">
              <img
                src="/images/infographies/visuel-tc.jpg"
                alt="Sch&eacute;ma du transport combin&eacute; : camion, grue, train, grue, camion"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>

            {/* 3 steps as horizontal timeline */}
            <div className="relative max-w-4xl mx-auto">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-[#1a4d2e] via-[#84cc16] to-[#1a4d2e]" />

              <div className="grid md:grid-cols-3 gap-10 sm:gap-12">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1a4d2e] text-white font-display font-bold text-base mb-5 shadow-lg ring-4 ring-bg">
                    01
                  </div>
                  <h3 className="font-display font-bold text-text text-lg mb-2">Pr&eacute;-acheminement</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Le transporteur routier achemine les UTI depuis le lieu de chargement vers le terminal multimodal le plus proche.
                  </p>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#84cc16] text-white font-display font-bold text-base mb-5 shadow-lg ring-4 ring-bg">
                    02
                  </div>
                  <h3 className="font-display font-bold text-text text-lg mb-2">Transport principal</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Les marchandises voyagent par rail ou voie fluviale sur la longue distance &mdash; 1 train remplace 45&nbsp;camions.
                  </p>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1a4d2e] text-white font-display font-bold text-base mb-5 shadow-lg ring-4 ring-bg">
                    03
                  </div>
                  <h3 className="font-display font-bold text-text text-lg mb-2">Post-acheminement</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Un dernier trajet routier court livre &agrave; destination. Le service est porte-&agrave;-porte, comme le tout-routier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Carte */}
        <section className="relative py-16 sm:py-20 bg-[#0f2818] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              Explorez le r&eacute;seau de transport combin&eacute;
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Visualisez les liaisons, les plateformes multimodales, les op&eacute;rateurs et trouvez le meilleur itin&eacute;raire pour vos marchandises.
            </p>
            <Link
              href="/carte"
              className="inline-flex items-center gap-2.5 gntc-gradient-bg text-white font-semibold px-8 py-4 rounded-lg shadow-lg shadow-[#1a4d2e]/40 hover:shadow-xl hover:scale-[1.02] transition-all text-base"
            >
              Ouvrir la carte interactive
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Latest news */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-3">Blog</div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text">Derni&egrave;res actualit&eacute;s</h2>
              </div>
              <Link href="/actualites" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-blue font-semibold hover:underline underline-offset-4">
                Toutes les actus
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {getLatestArticles(3).map((a) => (
                <Link key={a.slug} href={`/actualites/${a.slug}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                  {a.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: CATEGORY_COLORS[a.category] }}>
                        {CATEGORY_LABELS[a.category]}
                      </span>
                      <span className="text-xs text-muted">{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h3 className="font-display font-bold text-text group-hover:text-blue transition-colors mb-2 line-clamp-2 leading-snug">{a.title}</h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-3">{a.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="sm:hidden mt-8 text-center">
              <Link href="/actualites" className="text-sm text-blue font-semibold hover:underline">Toutes les actualit&eacute;s &rarr;</Link>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-14 sm:py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-[11px] font-bold text-muted uppercase tracking-[0.15em]">Nos partenaires</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16 lg:gap-20">
              {PARTNERS.map((p) => (
                <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="h-10 sm:h-12 object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300" />
              ))}
            </div>
          </div>
        </section>

        {/* Video section */}
        <section className="py-20 sm:py-28 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-3">M&eacute;dia</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text mb-4">En vid&eacute;o</h2>
              <p className="text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Retrouvez les conf&eacute;rences de la Journ&eacute;e du Transport Combin&eacute;.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                { id: 'mY1DAoMd76Y', year: '2025' },
                { id: 'VgEJpVqpw0A', year: '2024' },
                { id: 'wjoksD263PE', year: '2023' },
              ].map((v) => (
                <div key={v.id} className="group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}`}
                      title={`Journ\u00e9e du Transport Combin\u00e9 ${v.year}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <h3 className="font-display font-bold text-text mt-4 text-center text-sm">Journ&eacute;e du TC {v.year}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 sm:py-20 bg-[#0f2818]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-4">Newsletter mensuelle</div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-3">COMBILETTRE</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              Recevez chaque mois les actualit&eacute;s du transport combin&eacute; directement dans votre bo&icirc;te mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 text-sm px-5 py-3.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84cc16]/50 focus:ring-1 focus:ring-[#84cc16]/30 transition-all"
              />
              <button className="gntc-gradient-bg text-white font-semibold text-sm px-7 py-3.5 rounded-lg hover:shadow-lg hover:shadow-[#1a4d2e]/30 transition-all flex-shrink-0">
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
