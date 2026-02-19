import PageLayout from '@/components/Site/PageLayout';

const TIMELINE = [
  {
    year: '1945',
    title: 'Cr\u00e9ation du GNTC',
    desc: 'Fondation du Groupement National des Transports Combin\u00e9s dans le cadre de la reconstruction de l\u2019apr\u00e8s-guerre, pour organiser la compl\u00e9mentarit\u00e9 rail-route.',
  },
  {
    year: '1960s',
    title: 'D\u00e9veloppement du ferroutage',
    desc: 'Premiers services r\u00e9guliers de transport combin\u00e9 rail-route en France. Mise en place des premi\u00e8res plateformes multimodales.',
  },
  {
    year: '1970s',
    title: 'Conteneurisation',
    desc: 'Arriv\u00e9e massive du conteneur maritime. Le transport combin\u00e9 s\u2019adapte avec les conteneurs terrestres et les caisses mobiles.',
  },
  {
    year: '1984',
    title: 'Cr\u00e9ation de Novatrans',
    desc: 'Novatrans devient le premier op\u00e9rateur de transport combin\u00e9 en France, filiale de la SNCF d\u00e9di\u00e9e au combin\u00e9 rail-route.',
  },
  {
    year: '1991',
    title: 'Directive europ\u00e9enne 91/440',
    desc: 'Ouverture du march\u00e9 ferroviaire europ\u00e9en. Le transport combin\u00e9 est reconnu comme priorit\u00e9 europ\u00e9enne pour le report modal.',
  },
  {
    year: '2003',
    title: 'Lib\u00e9ralisation du fret',
    desc: 'Ouverture du fret ferroviaire \u00e0 la concurrence en France. Arriv\u00e9e de nouveaux op\u00e9rateurs priv\u00e9s sur le march\u00e9 du combin\u00e9.',
  },
  {
    year: '2009',
    title: 'Grenelle de l\u2019Environnement',
    desc: 'Le transport combin\u00e9 est identifi\u00e9 comme levier majeur de la transition \u00e9cologique du fret. Objectif de 25% de part modale non-routi\u00e8re.',
  },
  {
    year: '2018',
    title: 'Plan fret ferroviaire',
    desc: 'Lancement du plan de relance du fret ferroviaire avec un objectif de doublement de la part modale d\u2019ici 2030.',
  },
  {
    year: '2020',
    title: 'R\u00e9silience face au COVID',
    desc: 'Le transport combin\u00e9 d\u00e9montre sa r\u00e9silience pendant la crise sanitaire en maintenant les flux essentiels de marchandises.',
  },
  {
    year: '2023',
    title: 'Strat\u00e9gie Nationale Fret Ferroviaire',
    desc: 'Le gouvernement adopte la SNFF avec un objectif ambitieux : doubler la part du fret ferroviaire d\u2019ici 2030 pour atteindre 18%.',
  },
  {
    year: '2024',
    title: 'Aide \u00e0 l\u2019exploitation renforc\u00e9e',
    desc: 'Revalorisation de l\u2019aide \u00e0 l\u2019exploitation du transport combin\u00e9 \u00e0 47 M\u20ac/an pour accompagner le d\u00e9veloppement de la fili\u00e8re.',
  },
  {
    year: '2026',
    title: 'Vers le num\u00e9rique',
    desc: 'Modernisation de l\u2019image du GNTC, lancement de la cartographie interactive du r\u00e9seau et digitalisation des services aux adh\u00e9rents.',
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
                  <div className="bg-white rounded-xl border border-gray-100 p-6 inline-block text-left hover:shadow-md transition-shadow">
                    <div className="text-xs font-mono font-bold text-blue mb-1">{item.year}</div>
                    <h3 className="font-display font-bold text-text mb-1">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue border-2 border-white shadow-sm z-10 mt-2" />

                {/* Desktop: empty other side */}
                <div className={`hidden md:block w-1/2 ${isLeft ? 'order-2' : ''}`} />

                {/* Mobile card */}
                <div className="md:hidden pl-10">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="text-xs font-mono font-bold text-blue mb-1">{item.year}</div>
                    <h3 className="font-display font-bold text-text mb-1">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
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
