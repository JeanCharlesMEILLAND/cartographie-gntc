import Link from 'next/link';

const FOOTER_NAV = [
  {
    title: 'Le GNTC',
    links: [
      { label: 'Organisation', href: '/qui-sommes-nous/organisation' },
      { label: 'Missions', href: '/qui-sommes-nous/missions' },
      { label: 'Histoire', href: '/qui-sommes-nous/histoire' },
    ],
  },
  {
    title: 'Transport combiné',
    links: [
      { label: 'Définition', href: '/transport-combine/definition' },
      { label: 'Carte interactive', href: '/carte' },
      { label: 'Durabilité', href: '/transport-combine/durabilite' },
      { label: 'Plan de transport', href: '/plan-de-transport' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Acteurs', href: '/acteurs' },
      { label: 'Transporteurs', href: '/acteurs/transporteurs' },
      { label: 'Les CEE', href: '/les-cee' },
      { label: 'Observatoire', href: '/observatoire' },
      { label: 'Actualités', href: '/actualites' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#0f2818] text-gray-300">
      <div className="h-[2px] gntc-gradient-bg" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img src="/logo-gntc.jpg" alt="GNTC" className="h-10 brightness-110 rounded" />
              <div>
                <div className="text-sm font-display font-bold text-white">GNTC</div>
                <div className="text-[10px] text-gray-500">Groupement National des Transports Combin&eacute;s</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Organisation professionnelle repr&eacute;sentant la fili&egrave;re du transport combin&eacute; en France depuis 1945.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a href="https://www.linkedin.com/company/gntcofficiel/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://www.youtube.com/channel/UC6sm1EjyjwqOncB5AZKA2Ow" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all" title="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_NAV.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact + legal + bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              58 rue de la Victoire, 75009 Paris &middot; <a href="mailto:secretariat@gntc.fr" className="hover:text-white transition-colors">secretariat@gntc.fr</a> &middot; +33 6.81.84.26.21
            </div>
            <div className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} GNTC. Tous droits r&eacute;serv&eacute;s.
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions l&eacute;gales</Link>
            <span className="text-gray-700">&middot;</span>
            <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialit&eacute;</Link>
            <span className="text-gray-700">&middot;</span>
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
