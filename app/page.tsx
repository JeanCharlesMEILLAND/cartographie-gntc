import Link from 'next/link';
import SiteHeader from '@/components/Site/SiteHeader';
import SiteFooter from '@/components/Site/SiteFooter';

const STATS = [
  { value: '1 000 000', label: 'camions retir\u00e9s des routes par an' },
  { value: '1 000 000', label: 'tonnes de CO\u2082 \u00e9conomis\u00e9es par an' },
  { value: '-85%', label: "d'\u00e9missions de CO\u2082 vs tout-routier" },
  { value: '21', label: 'op\u00e9rateurs de transport combin\u00e9' },
];

const STEPS = [
  {
    number: '01',
    title: 'Pr\u00e9-acheminement',
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
    desc: 'Un dernier trajet routier court livre les marchandises \u00e0 destination finale. Le service est porte-\u00e0-porte, comme le tout-routier.',
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
  'VNF', 'SNCF R\u00e9seau', 'ADEME', 'UIRR', 'HELLIO',
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative bg-[#1a1d23] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue/20 via-transparent to-cyan/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <section className="py-12 sm:py-16 bg-gradient-to-r from-[#587bbd]/10 via-[#7dc243]/5 to-[#587bbd]/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

        {/* Partners */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Nos partenaires</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {PARTNERS.map((name) => (
                <div key={name} className="text-lg font-display font-semibold text-gray-300">{name}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-12 sm:py-16 bg-[#1a1d23]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
