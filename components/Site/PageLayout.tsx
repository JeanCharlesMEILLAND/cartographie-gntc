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
  /** If true, uses a gradient hero background instead of plain white */
  hero?: boolean;
}

export default function PageLayout({ children, title, subtitle, breadcrumbs, hero }: PageLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        {/* Page header */}
        <section className={hero
          ? 'relative bg-[#1a1d23] overflow-hidden'
          : 'bg-white border-b border-gray-100'
        }>
          {hero && <div className="absolute inset-0 bg-gradient-to-br from-blue/20 via-transparent to-cyan/10" />}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-xs mb-4">
                <Link href="/" className={hero ? 'text-gray-400 hover:text-white' : 'text-muted hover:text-blue'}>
                  Accueil
                </Link>
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={hero ? 'text-gray-600' : 'text-gray-300'}>
                      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {crumb.href ? (
                      <Link href={crumb.href} className={hero ? 'text-gray-400 hover:text-white' : 'text-muted hover:text-blue'}>
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={hero ? 'text-white font-medium' : 'text-text font-medium'}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight ${hero ? 'text-white' : 'text-text'}`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`mt-3 text-sm sm:text-base max-w-2xl leading-relaxed ${hero ? 'text-gray-300' : 'text-muted'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
