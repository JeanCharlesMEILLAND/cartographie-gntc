'use client';

import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/Site/SiteHeader';
import SiteFooter from '@/components/Site/SiteFooter';
import ScrollReveal from '@/components/Site/ScrollReveal';
import CountUp from '@/components/Site/CountUp';
import PartnerMarquee from '@/components/Site/PartnerMarquee';
import { getLatestArticles, CATEGORY_LABELS, CATEGORY_COLORS, type ArticleCategory } from '@/lib/actualites';

const PARTNERS = [
  { name: 'VNF', logo: '/logos/partenaires/vnf.png' },
  { name: 'SNCF Réseau', logo: '/logos/partenaires/sncf-reseau.png' },
  { name: 'ADEME', logo: '/logos/partenaires/ademe.png' },
  { name: 'UIRR', logo: '/logos/partenaires/uirr.jpg' },
  { name: 'HELLIO', logo: '/logos/partenaires/hellio.jpg' },
];

const VIDEOS = [
  { id: 'mY1DAoMd76Y', year: '2025' },
  { id: 'VgEJpVqpw0A', year: '2024' },
  { id: 'wjoksD263PE', year: '2023' },
];

export default function HomePage() {
  const articles = getLatestArticles(3);

  return (
    <>
      <SiteHeader />

      <main>
        {/* ════════════════ HERO ════════════════ */}
        <section className="relative bg-[#0f2818] overflow-hidden">
          <img
            src="/images/banners/combilettre-transport-combine.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15"
            loading="eager"
          />
          {/* L-to-R gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2818] via-[#0f2818]/85 to-[#0f2818]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2818]/80 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
            <div className="max-w-3xl hero-animate">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#84cc16] bg-[#84cc16]/10 border border-[#84cc16]/25 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
                Depuis 1945
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-display font-bold text-white leading-[1.12] mb-6">
                Le transport combin&eacute;, fer de lance de la{' '}
                <span className="gntc-gradient">transition &eacute;cologique</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300/90 leading-relaxed mb-10 max-w-2xl">
                Le GNTC f&eacute;d&egrave;re et repr&eacute;sente l&apos;ensemble de la fili&egrave;re du transport combin&eacute; en France.
                Une solution logistique qui r&eacute;duit de 85&nbsp;% les &eacute;missions de CO&#8322;.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/carte"
                  className="inline-flex items-center gap-2.5 gntc-gradient-bg text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-[#1a4d2e]/40 hover:shadow-xl hover:shadow-[#1a4d2e]/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="9" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Explorer la carte
                </Link>
                <Link
                  href="/carte"
                  className="inline-flex items-center gap-2.5 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl border border-white/25 hover:bg-white/10 hover:border-white/40 active:scale-[0.98] transition-all duration-200"
                >
                  Trouver un itin&eacute;raire
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ IMPACT ════════════════ */}
        <section className="relative -mt-8 z-10">
          <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0f2818] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="grid lg:grid-cols-2 items-stretch">
                {/* Infographic – full bleed */}
                <div className="relative min-h-[300px] lg:min-h-0">
                  <img
                    src="/images/infographies/environnement-2.jpg"
                    alt="1 train de transport combin&eacute; = 45 poids lourds"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Stats */}
                <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-8">Impact environnemental</h2>
                  <div className="space-y-7">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]"><path d="M4 17L10 11L14 15L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 7H22V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none mb-1">
                          <CountUp value={85} prefix="-" suffix={'\u00a0%'} />
                        </div>
                        <div className="text-sm text-gray-400 leading-snug">d&apos;&eacute;missions de CO&#8322; par rapport au tout-routier</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none mb-1">
                          <CountUp value={1000000} suffix=" camions" />
                        </div>
                        <div className="text-sm text-gray-400 leading-snug">retir&eacute;s des routes chaque ann&eacute;e</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#84cc16]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]"><path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none mb-1">
                          <CountUp value={59} prefix="-" suffix={'\u00a0%'} />
                        </div>
                        <div className="text-sm text-gray-400 leading-snug">de consommation d&apos;&eacute;nergie vs transport routier</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-white/10">
                    <Link href="/transport-combine/durabilite" className="inline-flex items-center gap-2 text-sm font-semibold text-[#84cc16] hover:text-white transition-colors duration-200">
                      D&eacute;couvrir tous les chiffres
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-10 sm:mb-14">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-3">Le processus</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text mb-4">Comment &ccedil;a marche&nbsp;?</h2>
              <p className="text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Le transport combin&eacute; allie la souplesse du routier &agrave; l&apos;efficacit&eacute; du ferroviaire et du fluvial.
              </p>
            </ScrollReveal>

            <ScrollReveal className="relative max-w-4xl mx-auto mb-12" delay={100}>
              <img
                src="/images/infographies/visuel-tc.jpg"
                alt="Sch&eacute;ma du transport combin&eacute; : camion, grue, train, grue, camion"
                className="w-full rounded-2xl shadow-lg"
                loading="lazy"
              />
            </ScrollReveal>

            {/* 3 steps timeline */}
            <div className="relative max-w-4xl mx-auto">
              <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-[#1a4d2e] via-[#84cc16] to-[#1a4d2e]" />

              <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
                {[
                  { n: '01', title: 'Pré-acheminement', desc: 'Le transporteur routier achemine les UTI depuis le lieu de chargement vers le terminal multimodal le plus proche.', bg: '#1a4d2e' },
                  { n: '02', title: 'Transport principal', desc: 'Les marchandises voyagent par rail ou voie fluviale sur la longue distance\u00a0\u2014 1\u00a0train remplace 45\u00a0camions.', bg: '#84cc16' },
                  { n: '03', title: 'Post-acheminement', desc: 'Un dernier trajet routier court livre \u00e0 destination. Le service est porte-\u00e0-porte, comme le tout-routier.', bg: '#1a4d2e' },
                ].map((step, i) => (
                  <ScrollReveal key={step.n} delay={i * 120} className="text-center">
                    <div
                      className="relative inline-flex items-center justify-center w-14 h-14 rounded-full text-white font-display font-bold text-base mb-5 shadow-lg ring-4 ring-bg step-pulse"
                      style={{ backgroundColor: step.bg }}
                    >
                      {step.n}
                    </div>
                    <h3 className="font-display font-bold text-text text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ CTA CARTE ════════════════ */}
        <ScrollReveal>
          <section className="relative py-14 sm:py-18 bg-[#0f2818] overflow-hidden">
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            {/* Map preview ghost */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url(/images/infographies/transport-combine-process.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                Explorez le r&eacute;seau de transport combin&eacute;
              </h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Visualisez les liaisons, les plateformes multimodales, les op&eacute;rateurs et trouvez le meilleur itin&eacute;raire pour vos marchandises.
              </p>
              <Link
                href="/carte"
                className="inline-flex items-center gap-2.5 gntc-gradient-bg text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[#84cc16]/20 hover:shadow-xl hover:shadow-[#84cc16]/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-base"
              >
                Ouvrir la carte interactive
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* ════════════════ NEWS ════════════════ */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-3">Blog</div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text">Derni&egrave;res actualit&eacute;s</h2>
                </div>
                <Link href="/actualites" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-blue font-semibold hover:underline underline-offset-4 transition-colors">
                  Toutes les actus
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {articles.map((a, i) => (
                <ScrollReveal key={a.slug} delay={i * 100}>
                  <Link
                    href={`/actualites/${a.slug}`}
                    className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 h-full"
                  >
                    {a.image && (
                      <div className="aspect-[16/9] overflow-hidden relative">
                        <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: CATEGORY_COLORS[a.category as ArticleCategory] }}>
                          {CATEGORY_LABELS[a.category as ArticleCategory]}
                        </span>
                        <span className="text-xs text-muted">{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-display font-bold text-text group-hover:text-blue transition-colors duration-200 mb-2 line-clamp-2 leading-snug">{a.title}</h3>
                      <p className="text-xs text-muted leading-relaxed line-clamp-3 mt-auto">{a.excerpt}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <div className="sm:hidden mt-8 text-center">
              <Link href="/actualites" className="text-sm text-blue font-semibold hover:underline">Toutes les actualit&eacute;s &rarr;</Link>
            </div>
          </div>
        </section>

        {/* ════════════════ PARTNERS ════════════════ */}
        <ScrollReveal>
          <section className="py-12 sm:py-14 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-[11px] font-bold text-muted uppercase tracking-[0.15em]">Nos partenaires</h2>
              </div>
              <PartnerMarquee partners={PARTNERS} />
            </div>
          </section>
        </ScrollReveal>

        {/* ════════════════ VIDEOS ════════════════ */}
        <section className="py-16 sm:py-20 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-10 sm:mb-14">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-3">M&eacute;dia</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text mb-4">En vid&eacute;o</h2>
              <p className="text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Retrouvez les conf&eacute;rences de la Journ&eacute;e du Transport Combin&eacute;.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {VIDEOS.map((v, i) => (
                <ScrollReveal key={v.id} delay={i * 100} className="group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300">
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}`}
                      title={`Journ\u00e9e du Transport Combin\u00e9 ${v.year}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-display font-bold text-text mt-4 text-center text-sm">Journ&eacute;e du TC {v.year}</h3>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ NEWSLETTER ════════════════ */}
        <ScrollReveal>
          <section className="py-14 sm:py-18 bg-[#0f2818]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84cc16] mb-4">Newsletter mensuelle</div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-3 glow-title">COMBILETTRE</h2>
              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Recevez chaque mois les actualit&eacute;s du transport combin&eacute; directement dans votre bo&icirc;te mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  aria-label="Adresse email pour la newsletter"
                  className="flex-1 text-sm px-5 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84cc16]/50 focus:ring-2 focus:ring-[#84cc16]/30 transition-all duration-200"
                />
                <button className="gntc-gradient-bg text-white font-semibold text-sm px-7 py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#84cc16]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex-shrink-0">
                  S&apos;inscrire
                </button>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <SiteFooter />
    </>
  );
}
