'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  {
    label: 'Qui sommes-nous',
    href: '/qui-sommes-nous',
    children: [
      { label: 'Notre organisation', href: '/qui-sommes-nous/organisation' },
      { label: 'Nos missions', href: '/qui-sommes-nous/missions' },
      { label: 'Notre histoire', href: '/qui-sommes-nous/histoire' },
    ],
  },
  {
    label: 'Transport combin\u00e9',
    href: '/transport-combine',
    children: [
      { label: 'D\u00e9finition', href: '/transport-combine/definition' },
      { label: 'Les flux en France', href: '/transport-combine/flux' },
      { label: 'Durabilit\u00e9', href: '/transport-combine/durabilite' },
      { label: 'Aides', href: '/transport-combine/aides' },
    ],
  },
  { label: 'Carte', href: '/carte' },
  {
    label: 'Acteurs',
    href: '/acteurs',
    children: [
      { label: 'Op\u00e9rateurs TC', href: '/acteurs/operateurs' },
      { label: 'Plateformes & Ports', href: '/acteurs/plateformes' },
      { label: 'Acteurs ferroviaires', href: '/acteurs/ferroviaire' },
      { label: 'Acteurs fluviaux', href: '/acteurs/fluvial' },
    ],
  },
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
          'text-sm font-medium transition-colors px-3 py-2 rounded-md',
          isActive ? 'text-blue' : 'text-text hover:text-blue'
        )}
      >
        {item.label}
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
          'text-sm font-medium transition-colors px-3 py-2 rounded-md flex items-center gap-1',
          isActive ? 'text-blue' : 'text-text hover:text-blue'
        )}
      >
        {item.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={clsx('transition-transform', open && 'rotate-180')}>
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={clsx(
                'block px-4 py-2 text-sm transition-colors',
                pathname === child.href ? 'text-blue bg-blue/5' : 'text-gray-700 hover:text-blue hover:bg-blue/5'
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo-gntc.jpg" alt="GNTC" className="h-10" />
            <div className="hidden sm:block">
              <div className="text-sm font-display font-bold text-text leading-tight">GNTC</div>
              <div className="text-[10px] text-muted leading-tight">Transport Combin&eacute;</div>
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
            className="lg:hidden p-2 text-text"
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
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'block px-3 py-2 text-sm font-medium rounded-md',
                    pathname.startsWith(item.href) ? 'text-blue bg-blue/5' : 'text-text hover:text-blue'
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
                          'block px-3 py-1.5 text-xs rounded-md',
                          pathname === child.href ? 'text-blue bg-blue/5' : 'text-muted hover:text-blue'
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
