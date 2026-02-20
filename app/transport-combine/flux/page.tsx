import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

const CORRIDORS = [
  {
    name: 'Axe Nord-Sud',
    routes: ['Lille – Lyon', 'Dourges – Marseille', 'Lille – Perpignan', 'Paris – Marseille'],
    desc: 'L\'axe principal du transport combiné en France, reliant les grands pôles économiques du Nord au bassin méditerranéen.',
    volume: 'Axe majeur',
  },
  {
    name: 'Axes transversaux',
    routes: ['Bordeaux – Lyon', 'Nantes – Lyon', 'Toulouse – Paris'],
    desc: 'Liaisons est-ouest reliant les métropoles régionales. En développement pour réduire la dépendance à l\'axe rhodanien.',
    volume: 'En croissance',
  },
  {
    name: 'Corridors internationaux',
    routes: ['France – Italie (Modane)', 'France – Espagne (Le Boulou)', 'France – Benelux', 'France – Allemagne'],
    desc: 'Le transport combiné est par nature européen. Les corridors internationaux relient la France aux grands réseaux européens.',
    volume: 'Trafic international',
  },
  {
    name: 'Axe fluvial',
    routes: ['Seine : Le Havre – Paris', 'Rhône : Lyon – Marseille', 'Nord : Dunkerque – Valenciennes'],
    desc: 'Le transport combiné fleuve-route se développe sur les axes fluviaux à grand gabarit, notamment la Seine et le Rhône.',
    volume: 'En développement',
  },
];

export default function FluxPage() {
  return (
    <PageLayout
      title="Les flux de transport combiné en France"
      subtitle="Le r&eacute;seau de transport combin&eacute; fran&ccedil;ais s&rsquo;organise autour de grands corridors structurants."
      breadcrumbs={[
        { label: 'Transport combiné', href: '/transport-combine' },
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
            { value: '21', label: 'opérateurs actifs' },
            { value: '~150', label: 'liaisons régulières' },
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
