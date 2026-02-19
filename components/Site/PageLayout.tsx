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
        <section className="relative bg-[#1a1d23] overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#587bbd]/20 via-transparent to-[#7dc243]/10" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hero ? 'py-14 sm:py-20' : 'py-10 sm:py-14'}`}>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-xs mb-4">
                <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
                  Accueil
                </Link>
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/20">
                      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-white/40 hover:text-white/70 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/80 font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-sm sm:text-base max-w-2xl leading-relaxed text-white/50">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom gradient border */}
          <div className="h-[2px] gntc-gradient-bg" />
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
