import { auth } from '@cartographie/shared/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as Record<string, unknown> | undefined)?.role as string | undefined;

  // Public routes — no auth needed
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/data') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/logos') ||
    pathname.match(/\.(svg|png|jpg|ico|json|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // All /admin and /api/admin routes require authentication
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isLoggedIn) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Admin-only pages
    const adminOnlyPages = ['/admin/utilisateurs', '/admin/historique'];
    const adminOnlyAPIs = ['/api/admin/users', '/api/admin/audit'];

    const isAdminOnly =
      adminOnlyPages.some((p) => pathname.startsWith(p)) ||
      adminOnlyAPIs.some((p) => pathname.startsWith(p));

    if (isAdminOnly && role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/activite', req.url));
    }
  }

  // /api/upload — admin only
  if (pathname.startsWith('/api/upload')) {
    if (!isLoggedIn || role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
  }

  // /api/rail-geometry — authenticated only
  if (pathname.startsWith('/api/rail-geometry')) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next.js internals.
     * This ensures the middleware runs on pages and API routes.
     */
    '/((?!_next/static|_next/image|favicon).*)',
  ],
};
