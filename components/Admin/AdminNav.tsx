'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';

// Inline SVG icons (14x14)
function IconBarChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 11V6M5 11V3M8 11V7M11 11V4" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 6C11 9.5 7 13 7 13S3 9.5 3 6C3 3.79 4.79 2 7 2C9.21 2 11 3.79 11 6Z" />
      <circle cx="7" cy="6" r="1.5" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3.5L5 1.5L9 3.5L13 1.5V10.5L9 12.5L5 10.5L1 12.5V3.5Z" />
      <path d="M5 1.5V10.5M9 3.5V12.5" />
    </svg>
  );
}
function IconTable() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="12" height="10" rx="1.5" />
      <path d="M1 5.5H13M1 8.5H13M5 5.5V12M9 5.5V12" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 9V2M7 2L4.5 4.5M7 2L9.5 4.5" />
      <path d="M2 8.5V11C2 11.55 2.45 12 3 12H11C11.55 12 12 11.55 12 11V8.5" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="4.5" r="2.5" />
      <path d="M2.5 12.5C2.5 10 4.5 8 7 8C9.5 8 11.5 10 11.5 12.5" />
    </svg>
  );
}
function IconGroup() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="4" r="2" />
      <path d="M1 11C1 9 2.8 7.5 5 7.5C7.2 7.5 9 9 9 11" />
      <circle cx="10" cy="4.5" r="1.5" />
      <path d="M10 7.5C11.7 7.5 13 8.8 13 10.5" />
    </svg>
  );
}
function IconUserPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="4.5" r="2.5" />
      <path d="M1.5 12.5C1.5 10 3.5 8 6 8C8.5 8 10.5 10 10.5 12.5" />
      <path d="M11.5 4V7.5M10 5.75H13" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4V7L9 8.5" />
    </svg>
  );
}

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data } = useAdminData();

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';
  const userOperator = (session?.user as Record<string, unknown>)?.operator as string | undefined;

  const adminLinks = [
    { href: '/admin', label: 'Tableau de bord', icon: IconBarChart },
    { href: '/admin/plateformes', label: `Plateformes${data ? ` (${data.platforms.length})` : ''}`, icon: IconMapPin },
    { href: '/admin/operateurs', label: `Opérateurs${data ? ` (${data.operators.length})` : ''}`, icon: IconGroup },
    { href: '/admin/flux', label: `Flux${data ? ` (${data.services.length})` : ''}`, icon: IconTable },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: IconUserPlus },
    { href: '/admin/historique', label: 'Historique', icon: IconClock },
  ];

  const opServiceCount = data && userOperator
    ? data.services.filter((s) => s.operator === userOperator).length
    : 0;

  const operatorLinks = [
    { href: '/admin', label: 'Tableau de bord', icon: IconBarChart },
    { href: '/admin/activite', label: 'Mon réseau', icon: IconMap },
    { href: '/admin/flux', label: `Mes services${opServiceCount ? ` (${opServiceCount})` : ''}`, icon: IconTable },
    { href: '/admin/import', label: 'Importer', icon: IconUpload },
    { href: '/admin/profil', label: 'Mon profil', icon: IconUser },
  ];

  const links = isAdmin ? adminLinks : operatorLinks;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop navigation */}
      <div className="border-b border-border hidden md:block">
        <div className="flex gap-0 px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                  active
                    ? 'border-blue text-blue bg-blue/5'
                    : 'border-transparent text-muted hover:text-text hover:bg-blue/5'
                }`}
              >
                <Icon />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1100] md:hidden glass-panel border-t border-border">
        <div className="flex justify-around items-center py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                  active ? 'text-blue' : 'text-muted'
                }`}
              >
                <Icon />
                <span className="text-[8px] font-medium leading-none">
                  {link.label.replace(/\s*\(.*\)/, '').replace('Tableau de bord', 'Accueil')}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
