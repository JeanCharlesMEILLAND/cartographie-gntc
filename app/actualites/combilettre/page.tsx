import PageLayout from '@/components/Site/PageLayout';
import { COMBILETTRES } from '@/lib/actualites';

export default function CombilettrePage() {
  return (
    <PageLayout
      title="COMBILETTRE"
      subtitle="La newsletter du GNTC, publi&eacute;e tous les deux mois. Retrouvez ici toutes les archives."
      breadcrumbs={[
        { label: 'Actualités', href: '/actualites' },
        { label: 'COMBILETTRE' },
      ]}
    >
      {/* Info */}
      <div className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-6 sm:p-8 mb-10">
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          La <strong className="text-text">COMBILETTRE</strong> est la publication bimestrielle du GNTC.
          Elle informe les adh&eacute;rents et partenaires de l&rsquo;actualit&eacute; du transport combin&eacute; :
          chiffres cl&eacute;s, dossiers strat&eacute;giques, vie de la fili&egrave;re, agenda des &eacute;v&eacute;nements.
        </p>
      </div>

      {/* Archive list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMBILETTRES.map((cl) => (
          <div key={cl.number} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-blue/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-display font-bold text-blue">#{cl.number}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-text text-sm">COMBILETTRE n&deg;{cl.number}</h3>
                <div className="text-xs text-muted mb-1">{cl.date}</div>
                <p className="text-xs text-muted leading-relaxed">{cl.title}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50">
              <span className="text-xs text-muted italic">PDF bient&ocirc;t disponible</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe CTA */}
      <section className="mt-12 bg-white rounded-xl border border-gray-100 p-6 sm:p-8 text-center">
        <h2 className="text-lg font-display font-bold text-text mb-2">S&rsquo;abonner &agrave; la COMBILETTRE</h2>
        <p className="text-sm text-muted mb-4 max-w-md mx-auto">
          Recevez gratuitement la COMBILETTRE par email tous les deux mois.
        </p>
        <a
          href="mailto:secretariat@gntc.fr?subject=Inscription%20COMBILETTRE"
          className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          S&rsquo;inscrire par email
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>
    </PageLayout>
  );
}
