import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

interface Crumb {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  /** If true, uses a taller hero with gradient overlay */
  hero?: boolean;
}

export default function PageLayout({ children, title, subtitle, breadcrumbs, hero }: PageLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        {/* Page header */}
        <section className="relative bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hero ? 'py-16 sm:py-20' : 'py-10 sm:py-14'}`}>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-xs mb-5">
                <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Accueil
                </Link>
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-300">
                      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-text font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-sm sm:text-base max-w-2xl leading-relaxed text-muted">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom gradient border */}
          <div className="h-[2px] gntc-gradient-bg" />
        </section>

        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
