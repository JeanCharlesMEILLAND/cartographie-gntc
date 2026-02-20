'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
}

const NAV: NavItem[] = [
  {
    label: 'Qui sommes-nous',
    href: '/qui-sommes-nous',
    children: [
      { label: 'Notre organisation', href: '/qui-sommes-nous/organisation', desc: 'Gouvernance et commissions' },
      { label: 'Nos missions', href: '/qui-sommes-nous/missions', desc: 'Actions et dossiers majeurs' },
      { label: 'Notre histoire', href: '/qui-sommes-nous/histoire', desc: 'De 1945 \u00e0 aujourd\'hui' },
    ],
  },
  {
    label: 'Transport combin\u00e9',
    href: '/transport-combine',
    children: [
      { label: 'D\u00e9finition', href: '/transport-combine/definition', desc: 'Le TC en 3 \u00e9tapes' },
      { label: 'Les flux en France', href: '/transport-combine/flux', desc: 'Corridors et statistiques' },
      { label: 'Durabilit\u00e9', href: '/transport-combine/durabilite', desc: 'Impact environnemental' },
      { label: 'Aides', href: '/transport-combine/aides', desc: 'Dispositifs publics' },
    ],
  },
  { label: 'Carte', href: '/carte' },
  {
    label: 'Acteurs',
    href: '/acteurs',
    children: [
      { label: 'Transporteurs', href: '/acteurs/transporteurs', desc: '18 entreprises de transport' },
      { label: 'Op\u00e9rateurs TC', href: '/acteurs/operateurs', desc: '20 op\u00e9rateurs' },
      { label: 'Plateformes & Ports', href: '/acteurs/plateformes', desc: '10 terminaux' },
      { label: 'Acteurs ferroviaires', href: '/acteurs/ferroviaire', desc: '\u00c9quipement & conseil' },
      { label: 'Acteurs fluviaux', href: '/acteurs/fluvial', desc: 'Transport par voie d\'eau' },
    ],
  },
  { label: 'Les CEE', href: '/les-cee' },
  { label: 'Plan de transport', href: '/plan-de-transport' },
  { label: 'Observatoire', href: '/observatoire' },
  { label: 'Actualit\u00e9s', href: '/actualites' },
  { label: 'Contact', href: '/contact' },
];

function DropdownItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const isActive = pathname.startsWith(item.href);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={clsx(
          'relative text-[13px] font-medium transition-colors duration-150 px-2.5 py-2 rounded-md',
          isActive
            ? 'text-blue bg-blue/5'
            : 'text-gray-600 hover:text-text hover:bg-gray-50'
        )}
      >
        {item.label}
        {isActive && (
          <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] rounded-full gntc-gradient-bg" />
        )}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={clsx(
          'relative text-[13px] font-medium transition-colors duration-150 px-2.5 py-2 rounded-md flex items-center gap-1',
          isActive
            ? 'text-blue bg-blue/5'
            : 'text-gray-600 hover:text-text hover:bg-gray-50'
        )}
      >
        {item.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={clsx('transition-transform duration-200', open && 'rotate-180')}>
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isActive && (
          <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] rounded-full gntc-gradient-bg" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50 bg-white/95 backdrop-blur-lg border border-gray-200/80 shadow-xl dropdown-enter">
          <div className="py-1.5">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={clsx(
                  'block px-4 py-2.5 transition-colors duration-150',
                  pathname === child.href
                    ? 'bg-blue/5'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className={clsx('text-sm font-medium', pathname === child.href ? 'text-blue' : 'text-gray-700')}>
                  {child.label}
                </div>
                {child.desc && (
                  <div className="text-[11px] text-gray-400 mt-0.5">{child.desc}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
        )}
      >
        {/* Thin gradient accent bar */}
        <div className="h-[2px] gntc-gradient-bg" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo-gntc.jpg" alt="GNTC" className="h-10 rounded" loading="eager" />
              <div className="hidden sm:block">
                <div className="text-sm font-display font-bold text-text leading-tight">GNTC</div>
                <div className="text-[10px] text-muted leading-tight">Transport Combin&eacute;</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navigation principale">
              {NAV.map((item) => (
                <DropdownItem key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -mr-2 text-gray-500 hover:text-text rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              <div className="relative w-6 h-6">
                <span className={clsx('absolute left-0 h-[2px] w-6 bg-current rounded transition-all duration-300', mobileOpen ? 'top-[11px] rotate-45' : 'top-[5px]')} />
                <span className={clsx('absolute left-0 top-[11px] h-[2px] w-6 bg-current rounded transition-all duration-200', mobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100')} />
                <span className={clsx('absolute left-0 h-[2px] w-6 bg-current rounded transition-all duration-300', mobileOpen ? 'top-[11px] -rotate-45' : 'top-[17px]')} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />
          {/* Drawer */}
          <nav
            className="absolute top-[68px] right-0 bottom-0 w-[min(320px,85vw)] bg-white shadow-2xl overflow-y-auto mobile-menu-enter"
            aria-label="Menu mobile"
          >
            <div className="px-4 py-6 space-y-1">
              {NAV.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.href ? null : item.href)}
                        className={clsx(
                          'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150',
                          pathname.startsWith(item.href)
                            ? 'text-blue bg-blue/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {item.label}
                        <svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          className={clsx('transition-transform duration-200', mobileExpanded === item.href && 'rotate-180')}
                        >
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {mobileExpanded === item.href && (
                        <div className="ml-3 pl-3 border-l-2 border-blue/10 space-y-0.5 mt-1 mb-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={clsx(
                                'block px-4 py-2 text-sm rounded-lg transition-colors duration-150',
                                pathname === child.href
                                  ? 'text-blue bg-blue/5 font-medium'
                                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                              )}
                            >
                              {child.label}
                              {child.desc && <span className="block text-[11px] text-gray-400 mt-0.5">{child.desc}</span>}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        'block px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150',
                        pathname.startsWith(item.href)
                          ? 'text-blue bg-blue/5'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
