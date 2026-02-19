'use client';

import PageLayout from '@/components/Site/PageLayout';
import { ACTEURS } from '@/lib/acteurs';

const KPI = [
  { value: '~40', label: 'plateformes actives', icon: '\uD83C\uDFED' },
  { value: '~500', label: 'trains / semaine', icon: '\uD83D\uDE82' },
  { value: '~150', label: 'liaisons r\u00e9guli\u00e8res', icon: '\uD83D\uDDFA\uFE0F' },
  { value: String(ACTEURS.filter((a) => a.category === 'operateur').length), label: 'op\u00e9rateurs', icon: '\uD83C\uDFE2' },
  { value: '1 000 000', label: 'camions retir\u00e9s / an', icon: '\uD83D\uDE9B' },
  { value: '-85%', label: 'CO\u2082 vs routier', icon: '\uD83C\uDF3F' },
];

const TOP_CORRIDORS = [
  { name: 'Paris \u2013 Lyon \u2013 Marseille', share: 22 },
  { name: 'Paris \u2013 Toulouse', share: 12 },
  { name: 'Paris \u2013 Bordeaux', share: 10 },
  { name: 'Lille \u2013 Lyon', share: 9 },
  { name: 'Bettembourg \u2013 Perpignan (AF)', share: 8 },
  { name: 'Le Havre \u2013 Paris / r\u00e9gions', share: 8 },
  { name: 'Paris \u2013 Rennes / Nantes', share: 6 },
  { name: 'Strasbourg \u2013 Lyon', share: 5 },
  { name: 'Dunkerque \u2013 r\u00e9gions', share: 4 },
  { name: 'Autres corridors', share: 16 },
];

const OPERATOR_SHARE = [
  { name: 'Novatrans', share: 25, color: '#f59e42' },
  { name: 'Naviland Cargo', share: 20, color: '#587bbd' },
  { name: 'VIIA', share: 12, color: '#a78bfa' },
  { name: 'T3M', share: 8, color: '#34d399' },
  { name: 'Greenmodal', share: 7, color: '#7dc243' },
  { name: 'HUPAC', share: 6, color: '#fbbf24' },
  { name: 'Combronde', share: 5, color: '#f472b6' },
  { name: 'Autres', share: 17, color: '#94a3b8' },
];

const REPORTS = [
  { year: '2024', title: 'Rapport annuel 2024', desc: 'Bilan complet de la fili\u00e8re du transport combin\u00e9 en France.' },
  { year: '2023', title: 'Rapport annuel 2023', desc: 'Chiffres cl\u00e9s, \u00e9volution des trafics et perspectives.' },
  { year: '2022', title: 'Rapport annuel 2022', desc: 'Cr\u00e9ation de l\u2019Observatoire du transport combin\u00e9.' },
];

function BarChart({ data, maxValue }: { data: { name: string; share: number; color?: string }[]; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map((d) => d.share));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <div className="w-40 text-xs text-text truncate flex-shrink-0">{d.name}</div>
          <div className="flex-1 bg-gray-50 rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${Math.max((d.share / max) * 100, 8)}%`, background: d.color || '#3b82f6' }}
            >
              <span className="text-[10px] font-bold text-white">{d.share}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ObservatoirePage() {
  return (
    <PageLayout
      title="Observatoire du transport combin&eacute;"
      subtitle="Donn&eacute;es cl&eacute;s, statistiques et rapports sur la fili&egrave;re du transport combin&eacute; en France."
      hero
      breadcrumbs={[{ label: 'Observatoire' }]}
    >
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        {/* Operator market share */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-bold text-text mb-1">R&eacute;partition par op&eacute;rateur</h2>
          <p className="text-xs text-muted mb-6">Part estim&eacute;e du trafic de transport combin&eacute; terrestre en France.</p>
          <BarChart data={OPERATOR_SHARE} maxValue={30} />
        </section>

        {/* Top corridors */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-bold text-text mb-1">Top 10 corridors</h2>
          <p className="text-xs text-muted mb-6">Principaux axes de transport combin&eacute; par volume de trafic.</p>
          <BarChart data={TOP_CORRIDORS} maxValue={25} />
        </section>
      </div>

      {/* Evolution highlights */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">&Eacute;volution r&eacute;cente</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: 'Croissance du trafic',
              value: '+15%',
              desc: 'Hausse du trafic de transport combin\u00e9 entre 2022 et 2024, port\u00e9e par la SNFF et les aides renforc\u00e9es.',
              color: 'text-green-600',
            },
            {
              title: 'Nouveaux terminaux',
              value: '3',
              desc: 'Ouverture des terminaux de Dunkerque (25 M\u20ac), S\u00e8te (20 M\u20ac) et extension de Delta 3 en 2024-2025.',
              color: 'text-blue',
            },
            {
              title: 'Objectif SNFF 2030',
              value: 'x2',
              desc: 'La Strat\u00e9gie Nationale Fret Ferroviaire vise un doublement de la part modale du fret ferroviaire d\u2019ici 2030.',
              color: 'text-purple-600',
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
            <div key={r.year} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="text-xs font-mono font-bold text-blue mb-2">{r.year}</div>
              <h3 className="font-display font-bold text-text mb-2">{r.title}</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">{r.desc}</p>
              <span className="text-xs text-muted italic">PDF bient&ocirc;t disponible</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sources */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-display font-bold text-text mb-2">Sources &amp; m&eacute;thodologie</h3>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside">
          <li>GNTC &mdash; Enqu&ecirc;tes aupr&egrave;s des op&eacute;rateurs adh&eacute;rents (2024)</li>
          <li>SNCF R&eacute;seau &mdash; Statistiques de circulation fret (2024)</li>
          <li>VNF &mdash; Trafic fluvial de conteneurs (2024)</li>
          <li>DGITM &mdash; Enqu&ecirc;te TRM, Comptes des transports de la Nation</li>
          <li>UIRR &mdash; Combined Transport in Europe, annual report 2024</li>
        </ul>
        <p className="text-xs text-muted mt-3 italic">
          Les parts de march&eacute; sont des estimations bas&eacute;es sur les donn&eacute;es publiques et les d&eacute;clarations des op&eacute;rateurs.
        </p>
      </section>
    </PageLayout>
  );
}
