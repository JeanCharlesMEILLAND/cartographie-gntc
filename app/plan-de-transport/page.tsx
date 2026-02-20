import PageLayout from '@/components/Site/PageLayout';
import { getActeursByCategory, CATEGORY_META } from '@/lib/acteurs';

const OPERATORS = getActeursByCategory('operateur');

export default function PlanDeTransportPage() {
  return (
    <PageLayout
      title="Plan de transport"
      subtitle="Les op&eacute;rateurs de transport combin&eacute; en France et leurs services r&eacute;guliers."
      hero
      breadcrumbs={[{ label: 'Plan de transport' }]}
    >
      {/* Key figures */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: String(OPERATORS.length), label: 'opérateurs' },
            { value: '~150', label: 'liaisons régulières' },
            { value: '~500', label: 'trains / semaine' },
            { value: '~40', label: 'plateformes desservies' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <div className="text-2xl font-display font-bold gntc-gradient">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Operator grid */}
      <section className="mb-12">
        <h2 className="text-xl font-display font-bold text-text mb-6">Les op&eacute;rateurs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPERATORS.map((op) => (
            <div
              key={op.slug}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4 mb-4">
                {op.logo ? (
                  <img src={op.logo} alt={op.name} className="w-12 h-12 object-contain rounded flex-shrink-0" />
                ) : (
                  <div
                    className="w-12 h-12 rounded flex-shrink-0 flex items-center justify-center font-display font-bold text-sm"
                    style={{ background: (op.color || '#1a4d2e') + '15', color: op.color || '#1a4d2e' }}
                  >
                    {op.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-text text-sm group-hover:text-blue transition-colors">{op.name}</h3>
                  {op.location && <div className="text-xs text-muted">{op.location}</div>}
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">{op.description}</p>

              {/* Specialties */}
              {op.specialites && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {op.specialites.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-blue/5 text-blue">{s}</span>
                  ))}
                </div>
              )}

              {/* Contact links */}
              <div className="flex items-center gap-3 text-xs">
                {op.website && (
                  <a
                    href={op.website.startsWith('http') ? op.website : `https://${op.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue hover:underline"
                  >
                    Site web
                  </a>
                )}
                {op.email && (
                  <a href={`mailto:${op.email}`} className="text-blue hover:underline">Email</a>
                )}
                {op.phone && (
                  <a href={`tel:${op.phone.replace(/\s/g, '')}`} className="text-blue hover:underline">T&eacute;l</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map CTA */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8 mb-12">
        <h2 className="text-lg font-display font-bold text-text mb-2">Carte des liaisons</h2>
        <p className="text-sm text-muted mb-4">
          Visualisez l&rsquo;ensemble des liaisons de transport combin&eacute; sur notre carte interactive.
          Filtrez par op&eacute;rateur, type de trafic ou fr&eacute;quence.
        </p>
        <a
          href="/carte"
          className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Explorer la carte interactive
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>

      {/* Documents */}
      <section>
        <h2 className="text-xl font-display font-bold text-text mb-6">Documents t&eacute;l&eacute;chargeables</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Plan de transport 2025', format: 'Excel', icon: '📄' },
            { title: 'Guide du combiné rail-route', format: 'PDF', icon: '📘' },
            { title: 'Annuaire des opérateurs', format: 'PDF', icon: '📂' },
          ].map((doc) => (
            <div key={doc.title} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="text-2xl">{doc.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-display font-bold text-text">{doc.title}</h3>
                <div className="text-xs text-muted">{doc.format}</div>
              </div>
              <span className="text-xs text-muted italic">Bient&ocirc;t disponible</span>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
