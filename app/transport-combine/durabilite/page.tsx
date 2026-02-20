'use client';

import { useState } from 'react';
import PageLayout from '@/components/Site/PageLayout';

const ENV_STATS = [
  { value: '1 000 000', label: 'camions retirés des routes chaque année', detail: 'grâce au report modal vers le rail et le fluvial' },
  { value: '-85%', label: 'd\'émissions de CO₂', detail: 'par rapport à un transport tout-routier équivalent' },
  { value: '1 000 000', label: 'tonnes de CO₂ économisées/an', detail: 'soit l\'équivalent de 500 000 voitures retirées' },
  { value: '6x', label: 'moins d\'énergie consommée', detail: 'le rail consomme 6 fois moins d\'énergie par tonne-km que la route' },
];

const BENEFITS = [
  {
    title: 'Réduction des émissions',
    desc: 'Le transport ferroviaire émet 14g de CO₂ par tonne-km contre 96g pour le routier. Le fluvial émet 30g par tonne-km.',
    icon: '🌍',
  },
  {
    title: 'Décongestion routière',
    desc: 'Un seul train de combiné remplace 30 à 40 poids-lourds sur les autoroutes. Moins de bouchons, moins d\'usure des routes.',
    icon: '🚛',
  },
  {
    title: 'Sécurité routière',
    desc: 'Moins de camions = moins d\'accidents. Le ferroviaire est nettement plus sûr que le routier par tonne-km transportée.',
    icon: '🛡️',
  },
  {
    title: 'Qualité de l\'air',
    desc: 'Réduction des particules fines, des NOx et du bruit le long des corridors routiers les plus saturés.',
    icon: '💨',
  },
  {
    title: 'Électrique par nature',
    desc: 'Plus de 50% du réseau ferré français est électrifié. La décarbonation est déjà avancée sur le rail.',
    icon: '⚡',
  },
  {
    title: 'Efficacité énergétique',
    desc: 'Le rail transporte 1 tonne sur 500 km avec 1 litre de carburant. Le routier : 100 km pour 1 litre.',
    icon: '⚙️',
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
        { label: 'Transport combiné', href: '/transport-combine' },
        { label: 'Durabilité' },
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
