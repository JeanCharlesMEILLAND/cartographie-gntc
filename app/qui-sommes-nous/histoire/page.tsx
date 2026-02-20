import PageLayout from '@/components/Site/PageLayout';

const TIMELINE = [
  {
    year: '1945',
    title: 'Cr\u00e9ation de la SNTM',
    desc: 'Le Syndicat National des Transporteurs Mixtes (SNTM) est cr\u00e9\u00e9 pour organiser la compl\u00e9mentarit\u00e9 rail-route dans la France de l\'apr\u00e8s-guerre.',
    image: '/images/histoire/1945-syndicat.png',
  },
  {
    year: '1948',
    title: 'Cr\u00e9ation de la CNC',
    desc: 'Cr\u00e9ation de la Compagnie Nouvelle de Cadres (CNC) ayant pour vocation l\'organisation de l\'acheminement group\u00e9 de \u00ab\u00a0cadres\u00a0\u00bb, anc\u00eatre du conteneur.',
  },
  {
    year: '1959',
    title: 'Technique Kangourou',
    desc: 'La STEMA (Soci\u00e9t\u00e9 de Transports et d\'Entreposage du Midi et de l\'Atlantique) d\u00e9veloppe la technique \u00ab\u00a0Kangourou\u00a0\u00bb : des wagons sp\u00e9cialis\u00e9s \u00e0 poche permettant de charger les semi-remorques sur des positions surbaiss\u00e9es. Cette technique r\u00e9volutionne le transport combin\u00e9 en offrant une solution pratique de manutention verticale des unit\u00e9s routi\u00e8res.',
    image: '/images/histoire/1959-kangourou.jpg',
  },
  {
    year: '1963',
    title: 'La Route Roulante',
    desc: 'Entre 1963 et 1973, la technique de la Route Roulante utilise des wagons surbaiss\u00e9s \u00e0 petites roues acceptant tout type de v\u00e9hicules routiers. Abandonn\u00e9e en France pour des raisons techniques et \u00e9conomiques.',
  },
  {
    year: '1968',
    title: 'Naissance de Novatrans',
    desc: 'Le GTTM (Groupement Technique des Transports Mixtes) et la STEMA fusionnent pour cr\u00e9er Novatrans, premier op\u00e9rateur de transport combin\u00e9 en France, filiale de la SNCF. Dans les ann\u00e9es 1970, l\'\u00e9volution des grues au terminal de Pompadour permet de r\u00e9duire le temps de manutention de 15 minutes \u00e0 moins de 5 minutes par unit\u00e9.',
    image: '/images/histoire/1968-sntc.png',
  },
  {
    year: '1975',
    title: 'D\u00e9veloppement du conteneur et de la caisse mobile',
    desc: 'La technique de manutention verticale se g\u00e9n\u00e9ralise. Caisses et cuves mobiles aux normes routi\u00e8res sont l\'aboutissement de la logique visant \u00e0 restreindre les tares. Le conteneur et la caisse mobile deviennent les standards du transport combin\u00e9.',
  },
  {
    year: '1976',
    title: 'Cr\u00e9ation du GNTC',
    desc: 'Le 23 juin 1976, le Groupement National des Transports Combin\u00e9s succ\u00e8de \u00e0 la SNTC. Le GNTC devient l\'organisation professionnelle de r\u00e9f\u00e9rence du transport combin\u00e9 en France.',
    image: '/images/histoire/1976-gntc.jpg',
  },
  {
    year: '1979',
    title: 'La CNC devient Compagnie Nouvelle de Conteneurs',
    desc: 'La CNC (Compagnie Nouvelle de Cadres) est rebaptis\u00e9e Compagnie Nouvelle de Conteneurs, refl\u00e9tant l\'\u00e9volution vers la conteneurisation. Elle deviendra Naviland Cargo en 2006.',
  },
  {
    year: '1994',
    title: 'Premier train sous la Manche',
    desc: 'Le 27 juin 1994, le premier train de transport combin\u00e9 emprunte le tunnel sous la Manche, ouvrant un corridor majeur vers le Royaume-Uni et marquant une \u00e9tape historique pour le transport combin\u00e9 international.',
    image: '/images/histoire/tunnel-manche.jpg',
  },
  {
    year: '2000',
    title: 'Apparition de nouveaux op\u00e9rateurs',
    desc: 'Arriv\u00e9e de nouveaux op\u00e9rateurs sur le march\u00e9 : Froidcombi, T3M, Rail-Link (futur Greenmodal), ainsi que de nouveaux terminaux et plateformes intermodales. Le secteur s\'ouvre \u00e0 la concurrence.',
  },
  {
    year: '2003',
    title: 'Autoroute ferroviaire alpine',
    desc: 'Premi\u00e8re navette de l\'autoroute ferroviaire alpine (Aiton vers Orbassano). Des wagons surbaiss\u00e9s et articul\u00e9s permettent le chargement de semi-remorques standards pour la travers\u00e9e des Alpes.',
  },
  {
    year: '2004',
    title: 'L\'\u00e8re des caisses mobiles',
    desc: 'Les caisses mobiles repr\u00e9sentent d\u00e9sormais 98\u00a0% du trafic terrestre de transport combin\u00e9. Le secteur s\'est profond\u00e9ment transform\u00e9.',
  },
  {
    year: '2007',
    title: 'Autoroute ferroviaire record',
    desc: 'Mise en service de l\'autoroute ferroviaire Bettembourg\u2013Perpignan, la plus longue d\'Europe. Un jalon pour le transport combin\u00e9 international.',
    image: '/images/histoire/2007-autoroute-europeenne.jpg',
  },
  {
    year: '2008',
    title: 'GNTC \u00ab\u00a0Candidat autoris\u00e9\u00a0\u00bb',
    desc: 'Le GNTC obtient la qualification de \u00ab\u00a0Candidat autoris\u00e9\u00a0\u00bb pour les op\u00e9rateurs de combin\u00e9 aupr\u00e8s de RFF (devenu SNCF R\u00e9seau), renfor\u00e7ant son r\u00f4le institutionnel aupr\u00e8s du gestionnaire d\'infrastructure.',
  },
  {
    year: '2012',
    title: 'Trains de 850 m\u00e8tres',
    desc: 'Apr\u00e8s 5 ans de bataille men\u00e9e par le GNTC, obtention de l\'autorisation de faire circuler des trains de 850 m\u00e8tres, \u00e0 120\u00a0km/h sur l\'axe Paris/Marseille et 100\u00a0km/h sur Bettembourg/Perpignan. Cette avanc\u00e9e augmente significativement la capacit\u00e9 du transport combin\u00e9. Cr\u00e9ation \u00e9galement de la Commission Fluviale au sein du GNTC.',
    image: '/images/histoire/2012-train-extension.png',
  },
  {
    year: '2017',
    title: 'Plateforme de service PSOTC',
    desc: 'Mise en place chez SNCF R\u00e9seau de la Plateforme de Service aux Op\u00e9rateurs de Transport Combin\u00e9 (PSOTC) au b\u00e9n\u00e9fice des op\u00e9rateurs de transport combin\u00e9, \u00e0 la demande du GNTC.',
  },
  {
    year: '2020',
    title: 'R\u00e9silience face au COVID',
    desc: 'Le transport combin\u00e9 d\u00e9montre sa r\u00e9silience pendant la crise sanitaire en maintenant les flux essentiels de marchandises.',
  },
  {
    year: '2022',
    title: 'Cr\u00e9ation de l\'Observatoire',
    desc: 'Le GNTC, SNCF R\u00e9seau, VNF et l\'ADEME cr\u00e9ent l\'Observatoire du transport combin\u00e9 pour mieux conna\u00eetre les statistiques du secteur.',
  },
  {
    year: '2024',
    title: '\u00c9lection de R\u00e9my Crochet',
    desc: 'R\u00e9my Crochet (FROIDCOMBI) est \u00e9lu pr\u00e9sident du GNTC. L\'aide \u00e0 l\'exploitation est renforc\u00e9e \u00e0 47\u00a0M\u20ac/an.',
  },
  {
    year: '2025',
    title: '80 ans du GNTC',
    desc: 'Le GNTC c\u00e9l\u00e8bre ses 80 ans d\'existence. Inauguration des terminaux de Dunkerque (25\u00a0M\u20ac) et S\u00e8te (20\u00a0M\u20ac). La fili\u00e8re est en plein essor.',
  },
  {
    year: '2026',
    title: 'Vers le num\u00e9rique',
    desc: 'Lancement de la cartographie interactive du r\u00e9seau et digitalisation des services. Le GNTC entre dans l\'\u00e8re num\u00e9rique.',
  },
];

export default function HistoirePage() {
  return (
    <PageLayout
      title="Notre histoire"
      subtitle="Plus de 80 ans au service du transport combin&eacute; en France."
      hero
      breadcrumbs={[
        { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
        { label: 'Histoire' },
      ]}
    >
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue via-cyan to-blue/20" />

        <div className="space-y-8">
          {TIMELINE.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={item.year} className="relative flex items-start gap-8">
                {/* Desktop: alternating sides */}
                <div className={`hidden md:block w-1/2 ${isLeft ? 'text-right pr-12' : 'order-2 pl-12'}`}>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden inline-block text-left hover:shadow-md transition-shadow">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-6">
                      <div className="text-xs font-mono font-bold text-blue mb-1">{item.year}</div>
                      <h3 className="font-display font-bold text-text mb-1">{item.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue border-2 border-white shadow-sm z-10 mt-2" />

                {/* Desktop: empty other side */}
                <div className={`hidden md:block w-1/2 ${isLeft ? 'order-2' : ''}`} />

                {/* Mobile card */}
                <div className="md:hidden pl-10">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-28 object-cover" />
                    )}
                    <div className="p-5">
                      <div className="text-xs font-mono font-bold text-blue mb-1">{item.year}</div>
                      <h3 className="font-display font-bold text-text mb-1">{item.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
