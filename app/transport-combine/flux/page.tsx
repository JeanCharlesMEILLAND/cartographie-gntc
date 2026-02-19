import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

const CORRIDORS = [
  {
    name: 'Axe Nord-Sud',
    routes: ['Lille \u2013 Lyon', 'Dourges \u2013 Marseille', 'Lille \u2013 Perpignan', 'Paris \u2013 Marseille'],
    desc: 'L\u2019axe principal du transport combin\u00e9 en France, reliant les grands p\u00f4les \u00e9conomiques du Nord au bassin m\u00e9diterran\u00e9en.',
    volume: '~60% du trafic combin\u00e9',
  },
  {
    name: 'Axes transversaux',
    routes: ['Bordeaux \u2013 Lyon', 'Nantes \u2013 Lyon', 'Toulouse \u2013 Paris'],
    desc: 'Liaisons est-ouest et reliant les m\u00e9tropoles r\u00e9gionales. En d\u00e9veloppement pour r\u00e9duire la d\u00e9pendance \u00e0 l\u2019axe rhodanien.',
    volume: '~20% du trafic combin\u00e9',
  },
  {
    name: 'Corridors internationaux',
    routes: ['France \u2013 Italie (Modane)', 'France \u2013 Espagne (Le Boulou)', 'France \u2013 Benelux', 'France \u2013 Allemagne'],
    desc: 'Le transport combin\u00e9 est par nature europ\u00e9en. Les corridors internationaux relient la France aux grands r\u00e9seaux europ\u00e9ens.',
    volume: '~15% du trafic combin\u00e9',
  },
  {
    name: 'Axe fluvial',
    routes: ['Seine : Le Havre \u2013 Paris', 'Rh\u00f4ne : Lyon \u2013 Marseille', 'Nord : Dunkerque \u2013 Valenciennes'],
    desc: 'Le transport combin\u00e9 fleuve-route se d\u00e9veloppe sur les axes fluviaux \u00e0 grand gabarit, notamment la Seine et le Rh\u00f4ne.',
    volume: '~5% du trafic combin\u00e9',
  },
];

export default function FluxPage() {
  return (
    <PageLayout
      title="Les flux de transport combin\u00e9 en France"
      subtitle="Le r&eacute;seau de transport combin&eacute; fran&ccedil;ais s&rsquo;organise autour de grands corridors structurants."
      breadcrumbs={[
        { label: 'Transport combin\u00e9', href: '/transport-combine' },
        { label: 'Flux' },
      ]}
    >
      {/* Corridors */}
      <div className="space-y-6 mb-16">
        {CORRIDORS.map((c) => (
          <div key={c.name} className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-display font-bold text-text mb-2">{c.name}</h2>
                <p className="text-sm text-muted leading-relaxed mb-3">{c.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {c.routes.map((r) => (
                    <span key={r} className="text-xs bg-blue/5 text-blue px-3 py-1 rounded-full font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xl font-display font-bold gntc-gradient">{c.volume}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key figures */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Le r&eacute;seau en chiffres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '~40', label: 'plateformes multimodales' },
            { value: '21', label: 'op\u00e9rateurs actifs' },
            { value: '~150', label: 'liaisons r\u00e9guli\u00e8res' },
            { value: '~500', label: 'trains/semaine' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <div className="text-2xl font-display font-bold gntc-gradient">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA carte */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-display font-bold text-text mb-2">
          Explorez le r&eacute;seau complet
        </h2>
        <p className="text-sm text-muted mb-6">
          Visualisez toutes les liaisons, plateformes et op&eacute;rateurs sur notre carte interactive.
        </p>
        <Link
          href="/carte"
          className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Ouvrir la carte interactive
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </section>
    </PageLayout>
  );
}
