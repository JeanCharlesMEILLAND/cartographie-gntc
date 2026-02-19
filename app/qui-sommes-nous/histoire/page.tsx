import PageLayout from '@/components/Site/PageLayout';

const TIMELINE = [
  {
    year: '1945',
    title: 'Cr\u00e9ation de la SNTM',
    desc: 'La Soci\u00e9t\u00e9 Nationale des Transports de Marchandises (SNTM) est cr\u00e9\u00e9e pour organiser la compl\u00e9mentarit\u00e9 rail-route dans la France de l\u2019apr\u00e8s-guerre.',
  },
  {
    year: '1959',
    title: 'Technique Kangourou',
    desc: 'D\u00e9veloppement de la technique \u00ab\u00a0Kangourou\u00a0\u00bb permettant de charger les semi-remorques sur des wagons sp\u00e9ciaux. Une r\u00e9volution pour le transport combin\u00e9.',
  },
  {
    year: '1968',
    title: 'Naissance de Novatrans',
    desc: 'La SNTM devient la SNTC. Novatrans voit le jour comme premier op\u00e9rateur de transport combin\u00e9 en France, filiale de la SNCF.',
  },
  {
    year: '1976',
    title: 'Cr\u00e9ation du GNTC',
    desc: 'Le 23 juin 1976, le Groupement National des Transports Combin\u00e9s succ\u00e8de \u00e0 la SNTC. Le GNTC devient l\u2019organisation professionnelle de r\u00e9f\u00e9rence.',
  },
  {
    year: '1994',
    title: 'Premier train sous la Manche',
    desc: 'Le 27 juin 1994, le premier train de transport combin\u00e9 emprunte le tunnel sous la Manche, ouvrant un corridor majeur vers le Royaume-Uni.',
  },
  {
    year: '2004',
    title: 'L\u2019\u00e8re des caisses mobiles',
    desc: 'Les caisses mobiles repr\u00e9sentent d\u00e9sormais 98% du trafic terrestre de transport combin\u00e9. Le secteur s\u2019est profond\u00e9ment transform\u00e9.',
  },
  {
    year: '2007',
    title: 'Autoroute ferroviaire record',
    desc: 'Mise en service de l\u2019autoroute ferroviaire Bettembourg\u2013Perpignan, la plus longue d\u2019Europe. Un jalon pour le transport combin\u00e9 international.',
  },
  {
    year: '2012',
    title: 'Trains de 850 m\u00e8tres',
    desc: 'Obtention de l\u2019autorisation de faire circuler des trains de 850 m\u00e8tres, augmentant significativement la capacit\u00e9 du transport combin\u00e9.',
  },
  {
    year: '2020',
    title: 'R\u00e9silience face au COVID',
    desc: 'Le transport combin\u00e9 d\u00e9montre sa r\u00e9silience pendant la crise sanitaire en maintenant les flux essentiels de marchandises.',
  },
  {
    year: '2022',
    title: 'Cr\u00e9ation de l\u2019Observatoire',
    desc: 'Le GNTC, SNCF R\u00e9seau, VNF et l\u2019ADEME cr\u00e9ent l\u2019Observatoire du transport combin\u00e9 pour mieux conna\u00eetre les statistiques du secteur.',
  },
  {
    year: '2024',
    title: '\u00c9lection de R\u00e9my Crochet',
    desc: 'R\u00e9my Crochet (FROIDCOMBI) est \u00e9lu pr\u00e9sident du GNTC. L\u2019aide \u00e0 l\u2019exploitation est renforc\u00e9e \u00e0 47 M\u20ac/an.',
  },
  {
    year: '2025',
    title: '80 ans du GNTC',
    desc: 'Le GNTC c\u00e9l\u00e8bre ses 80 ans d\u2019existence. Inauguration des terminaux de Dunkerque (25 M\u20ac) et S\u00e8te (20 M\u20ac). La fili\u00e8re est en plein essor.',
  },
  {
    year: '2026',
    title: 'Vers le num\u00e9rique',
    desc: 'Lancement de la cartographie interactive du r\u00e9seau et digitalisation des services. Le GNTC entre dans l\u2019\u00e8re num\u00e9rique.',
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
