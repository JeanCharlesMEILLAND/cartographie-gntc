'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAdminData } from '@/lib/adminContext';

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data } = useAdminData();

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';

  const adminLinks = [
    { href: '/admin', label: 'Tableau de bord' },
    { href: '/admin/plateformes', label: `Plateformes${data ? ` (${data.platforms.length})` : ''}` },
    { href: '/admin/operateurs', label: `Opérateurs${data ? ` (${data.operators.length})` : ''}` },
    { href: '/admin/flux', label: `Flux${data ? ` (${data.services.length})` : ''}` },
    { href: '/admin/utilisateurs', label: 'Utilisateurs' },
    { href: '/admin/historique', label: 'Historique' },
  ];

  // Opérateur : un seul onglet, on masque la barre
  if (!isAdmin) return null;

  const links = adminLinks;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="border-b border-border">
      <div className="flex gap-0 px-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              isActive(link.href)
                ? 'border-blue text-blue'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
