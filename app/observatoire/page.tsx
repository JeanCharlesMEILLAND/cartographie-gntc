'use client';

import PageLayout from '@/components/Site/PageLayout';
import { ACTEURS } from '@/lib/acteurs';

const KPI = [
  { value: '~40', label: 'plateformes actives', icon: '🏭' },
  { value: '~500', label: 'trains / semaine', icon: '🚂' },
  { value: '~150', label: 'liaisons régulières', icon: '🗺️' },
  { value: String(ACTEURS.filter((a) => a.category === 'operateur').length), label: 'opérateurs', icon: '🏢' },
  { value: '1 000 000', label: 'camions retirés / an', icon: '🚛' },
  { value: '-85%', label: 'CO₂ vs routier', icon: '🌿' },
];

const MAIN_CORRIDORS = [
  'Paris – Lyon – Marseille (axe rhodanien)',
  'Lille – Lyon / Marseille',
  'Bettembourg – Perpignan (autoroute ferroviaire)',
  'Le Havre – Paris / régions',
  'Paris – Bordeaux / Toulouse',
  'Paris – Rennes / Nantes',
  'Strasbourg – Lyon',
  'Dunkerque – régions',
  'France – Italie (Modane)',
  'France – Espagne (Le Boulou)',
];

const REPORTS = [
  { year: '2024', title: 'Rapport annuel 2024', desc: 'Bilan complet de la filière du transport combiné en France.', cover: '/images/infographies/observatoire-2024-cover.jpg' },
  { year: '2023', title: 'Rapport annuel 2023', desc: 'Chiffres clés, évolution des trafics et perspectives.', cover: '/images/infographies/observatoire-2023-cover.jpg' },
  { year: '2022', title: 'Rapport annuel 2022', desc: 'Création de l\'Observatoire du transport combiné.' },
];

export default function ObservatoirePage() {
  return (
    <PageLayout
      title="Observatoire du transport combiné"
      subtitle="Données clés, statistiques et rapports sur la filière du transport combiné en France."
      hero
      breadcrumbs={[{ label: 'Observatoire' }]}
    >
      {/* Présentation de l'Observatoire */}
      <section className="mb-12 bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <p className="text-sm text-muted leading-relaxed">
          En 2022, les principales parties prenantes du transport combin&eacute; fran&ccedil;ais se sont
          rapproch&eacute;es dans l&rsquo;id&eacute;e de constituer un Observatoire du transport combin&eacute;,
          structure en r&eacute;seau ayant pour objectif de mieux conna&icirc;tre les statistiques et
          donn&eacute;es strat&eacute;giques de cette activit&eacute;.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Ces parties prenantes sont le GNTC, les deux gestionnaires de r&eacute;seaux (SNCF R&eacute;seau
          pour le ferroviaire et VNF pour le fluvial), et l&rsquo;ADEME.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Le SDES et la DGITM suivent les travaux en qualit&eacute; d&rsquo;observateurs.
          L&rsquo;Autorit&eacute; de r&eacute;gulation des transports (ART) a contribu&eacute; au rapport.
        </p>
      </section>

      {/* KPIs */}
      <section className="mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {KPI.map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-2xl mb-2">{k.icon}</div>
              <div className="text-2xl sm:text-3xl font-display font-bold gntc-gradient">{k.value}</div>
              <div className="text-xs text-muted mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Two columns: operators + corridors */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        {/* Operators list */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-bold text-text mb-1">Opérateurs actifs</h2>
          <p className="text-xs text-muted mb-4">Les {ACTEURS.filter((a) => a.category === 'operateur').length} opérateurs de transport combiné adhérents du GNTC.</p>
          <div className="grid grid-cols-2 gap-2">
            {ACTEURS.filter((a) => a.category === 'operateur').map((a) => (
              <div key={a.slug} className="text-sm text-text flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full gntc-gradient-bg flex-shrink-0" />
                {a.name}
              </div>
            ))}
          </div>
        </section>

        {/* Top corridors */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-bold text-text mb-1">Principaux corridors</h2>
          <p className="text-xs text-muted mb-4">Les grands axes du transport combiné en France et en Europe.</p>
          <div className="space-y-2">
            {MAIN_CORRIDORS.map((c) => (
              <div key={c} className="flex items-center gap-3 text-sm text-text">
                <div className="w-1.5 h-1.5 rounded-full gntc-gradient-bg flex-shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Evolution highlights */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Évolution récente</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: 'Objectif SNFF 2030',
              value: 'x2',
              desc: 'La Stratégie Nationale Fret Ferroviaire vise un doublement de la part modale du fret ferroviaire d\'ici 2030.',
              color: 'text-purple-600',
            },
            {
              title: 'Nouveaux terminaux',
              value: '2',
              desc: 'Mise en service des terminaux de Dunkerque et Sète, renforçant le maillage national du transport combiné.',
              color: 'text-blue',
            },
            {
              title: 'Aide à l\'exploitation',
              value: '47 M€',
              desc: 'Budget annuel de l\'aide à l\'exploitation du transport combiné, essentielle pour la compétitivité du mode.',
              color: 'text-green-600',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className={`text-3xl font-display font-bold ${item.color} mb-2`}>{item.value}</div>
              <h3 className="font-display font-bold text-text mb-2">{item.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reports */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Rapports annuels</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {REPORTS.map((r) => (
            <div key={r.year} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {r.cover && (
                <img src={r.cover} alt={r.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-6">
                <div className="text-xs font-mono font-bold text-blue mb-2">{r.year}</div>
                <h3 className="font-display font-bold text-text mb-2">{r.title}</h3>
                <p className="text-xs text-muted leading-relaxed mb-4">{r.desc}</p>
                <span className="text-xs text-muted italic">PDF bientôt disponible</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sources */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-display font-bold text-text mb-2">Sources</h3>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside">
          <li>GNTC — Enquêtes auprès des opérateurs adhérents</li>
          <li>SNCF Réseau — Statistiques de circulation fret</li>
          <li>VNF — Trafic fluvial de conteneurs</li>
          <li>DGITM — Enquête TRM, Comptes des transports de la Nation</li>
          <li>UIRR — Combined Transport in Europe, annual report</li>
        </ul>
      </section>
    </PageLayout>
  );
}
