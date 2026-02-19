'use client';

import { useState } from 'react';
import PageLayout from '@/components/Site/PageLayout';

const ENV_STATS = [
  { value: '1 000 000', label: 'camions retir\u00e9s des routes chaque ann\u00e9e', detail: 'gr\u00e2ce au report modal vers le rail et le fluvial' },
  { value: '-85%', label: 'd\u2019\u00e9missions de CO\u2082', detail: 'par rapport \u00e0 un transport tout-routier \u00e9quivalent' },
  { value: '1 000 000', label: 'tonnes de CO\u2082 \u00e9conomis\u00e9es/an', detail: 'soit l\u2019\u00e9quivalent de 500 000 voitures retir\u00e9es' },
  { value: '-50%', label: 'de consommation \u00e9nerg\u00e9tique', detail: 'le rail consomme 6x moins d\u2019\u00e9nergie par tonne-km' },
];

const BENEFITS = [
  {
    title: 'R\u00e9duction des \u00e9missions',
    desc: 'Le transport ferroviaire \u00e9met 14g de CO\u2082 par tonne-km contre 96g pour le routier. Le fluvial \u00e9met 30g par tonne-km.',
    icon: '\uD83C\uDF0D',
  },
  {
    title: 'D\u00e9congestion routi\u00e8re',
    desc: 'Un seul train de combin\u00e9 remplace 30 \u00e0 40 poids-lourds sur les autoroutes. Moins de bouchons, moins d\u2019usure des routes.',
    icon: '\uD83D\uDE9B',
  },
  {
    title: 'S\u00e9curit\u00e9 routi\u00e8re',
    desc: 'Moins de camions = moins d\u2019accidents. Le ferroviaire est 10 fois plus s\u00fbr que le routier par tonne-km.',
    icon: '\uD83D\uDEE1\uFE0F',
  },
  {
    title: 'Qualit\u00e9 de l\u2019air',
    desc: 'R\u00e9duction des particules fines, des NOx et du bruit le long des corridors routiers les plus satur\u00e9s.',
    icon: '\uD83D\uDCA8',
  },
  {
    title: '\u00c9lectrique par nature',
    desc: 'Plus de 50% du r\u00e9seau ferr\u00e9 fran\u00e7ais est \u00e9lectrifi\u00e9. La d\u00e9carbonation est d\u00e9j\u00e0 avanc\u00e9e sur le rail.',
    icon: '\u26A1',
  },
  {
    title: 'Efficacit\u00e9 \u00e9nerg\u00e9tique',
    desc: 'Le rail transporte 1 tonne sur 500 km avec 1 litre de carburant. Le routier : 100 km pour 1 litre.',
    icon: '\u2699\uFE0F',
  },
];

function CO2Calculator() {
  const [distance, setDistance] = useState(600);
  const [weight, setWeight] = useState(25);

  const routier = (distance * weight * 96) / 1_000_000; // tonnes CO2
  const combine = (distance * weight * 14 * 0.15 + distance * weight * 96 * 0.85 * 0) / 1_000_000;
  // Simplified: 15% route (150km) + 85% rail
  const routeKm = Math.min(distance * 0.15, 150);
  const railKm = distance - routeKm * 2;
  const co2Combine = ((routeKm * 2 * weight * 96) + (railKm * weight * 14)) / 1_000_000;
  const reduction = routier > 0 ? ((1 - co2Combine / routier) * 100).toFixed(0) : '0';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h3 className="text-lg font-display font-bold text-text mb-6">Calculateur CO&sup2;</h3>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Distance totale : <span className="text-blue">{distance} km</span>
          </label>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full accent-blue"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>100 km</span>
            <span>2 000 km</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Poids marchandise : <span className="text-blue">{weight} t</span>
          </label>
          <input
            type="range"
            min={1}
            max={44}
            step={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-blue"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>1 t</span>
            <span>44 t</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Tout-routier</div>
          <div className="text-2xl font-display font-bold text-red-700">{routier.toFixed(2)}</div>
          <div className="text-xs text-red-500">tonnes CO&sup2;</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Combin&eacute;</div>
          <div className="text-2xl font-display font-bold text-green-700">{co2Combine.toFixed(2)}</div>
          <div className="text-xs text-green-500">tonnes CO&sup2;</div>
        </div>
        <div className="bg-blue/5 rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-blue uppercase tracking-wider mb-1">R&eacute;duction</div>
          <div className="text-2xl font-display font-bold gntc-gradient">-{reduction}%</div>
          <div className="text-xs text-muted">d&rsquo;&eacute;missions</div>
        </div>
      </div>

      <p className="text-xs text-muted mt-4">
        Calcul simplifi&eacute; bas&eacute; sur : routier 96g CO&sup2;/t.km, ferroviaire 14g CO&sup2;/t.km.
        Pr&eacute;/post-acheminement routier estim&eacute; &agrave; {Math.round(routeKm)} km chaque extr&eacute;mit&eacute;, transport principal rail {Math.round(railKm)} km.
      </p>
    </div>
  );
}

export default function DurabilitePage() {
  return (
    <PageLayout
      title="Un mode de transport durable"
      subtitle="Le transport combin&eacute; est le fer de lance de la transition &eacute;cologique du fret. D&eacute;couvrez ses b&eacute;n&eacute;fices environnementaux."
      hero
      breadcrumbs={[
        { label: 'Transport combin\u00e9', href: '/transport-combine' },
        { label: 'Durabilit\u00e9' },
      ]}
    >
      {/* Key stats */}
      <section className="mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENV_STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-2xl sm:text-3xl font-display font-bold gntc-gradient mb-1">{s.value}</div>
              <div className="text-sm font-medium text-text mb-1">{s.label}</div>
              <div className="text-xs text-muted">{s.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Les b&eacute;n&eacute;fices environnementaux</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="text-2xl mb-3">{b.icon}</div>
              <h3 className="font-display font-bold text-text mb-2">{b.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CO2 Calculator */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Estimez vos &eacute;conomies</h2>
        <CO2Calculator />
      </section>

      {/* Sources */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-display font-bold text-text mb-2">Sources</h3>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside">
          <li>ADEME &mdash; Base Carbone : facteurs d&rsquo;&eacute;mission par mode de transport</li>
          <li>Minist&egrave;re de la Transition &eacute;cologique &mdash; Chiffres cl&eacute;s du transport 2024</li>
          <li>UIRR &mdash; Combined Transport in Europe, Statistics 2024</li>
          <li>GNTC &mdash; Observatoire du transport combin&eacute; 2024</li>
        </ul>
      </section>
    </PageLayout>
  );
}
