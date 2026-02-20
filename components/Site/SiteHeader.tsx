'use client';

import { useState } from 'react';
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
          'relative text-sm font-medium transition-colors px-3 py-2 rounded-md',
          isActive
            ? 'text-blue'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        {item.label}
        {isActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full gntc-gradient-bg" />
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
          'relative text-sm font-medium transition-colors px-3 py-2 rounded-md flex items-center gap-1',
          isActive
            ? 'text-blue'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        {item.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={clsx('transition-transform', open && 'rotate-180')}>
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full gntc-gradient-bg" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50 bg-white border border-gray-200 shadow-xl">
          <div className="py-1.5">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={clsx(
                  'block px-4 py-2.5 transition-colors',
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Thin gradient accent bar */}
      <div className="h-[2px] gntc-gradient-bg" />

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo-gntc.jpg" alt="GNTC" className="h-10 rounded" />
            <div className="hidden sm:block">
              <div className="text-sm font-display font-bold text-gray-900 leading-tight">GNTC</div>
              <div className="text-[10px] text-gray-400 leading-tight">Transport Combin&eacute;</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => (
              <DropdownItem key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-white border-t border-gray-100">
          <nav className="px-4 py-4 space-y-1">
            {NAV.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname.startsWith(item.href)
                      ? 'text-blue bg-blue/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          'block px-3 py-1.5 text-xs rounded-md transition-colors',
                          pathname === child.href
                            ? 'text-blue bg-blue/5'
                            : 'text-gray-400 hover:text-gray-700'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
