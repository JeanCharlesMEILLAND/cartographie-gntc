import Image from 'next/image';
import PageLayout from '@/components/Site/PageLayout';

/* ------------------------------------------------------------------ */
/*  Data: company news articles grouped by time period                */
/* ------------------------------------------------------------------ */

interface Article {
  title: string;
  content: string;
  image?: string;
}

interface TimePeriod {
  label: string;
  articles: Article[];
}

const PERIODS: TimePeriod[] = [
  {
    label: 'F\u00e9vrier 2026',
    articles: [
      {
        title: 'Combipass \u2013 Changements de direction',
        content:
          'Joris Bours a \u00e9t\u00e9 nomm\u00e9 Directeur des Op\u00e9rations en juin\u00a02025. Ren\u00e9 Schifferings prend quant \u00e0 lui la fonction de Directeur Dry Bulk depuis janvier\u00a02026. Ces nominations renforcent l\u2019\u00e9quipe dirigeante de Combipass pour accompagner la croissance de l\u2019entreprise.',
      },
      {
        title: 'VNF cr\u00e9e \u00ab\u00a0Ports de Lorraine\u00a0\u00bb',
        content:
          'Voies navigables de France (VNF) a cr\u00e9\u00e9 une nouvelle SAS baptis\u00e9e \u00ab\u00a0Ports de Lorraine\u00a0\u00bb, regroupant 34\u00a0plateformes sur 22\u00a0communes. Un programme d\u2019investissement de 30\u00a0millions d\u2019euros est pr\u00e9vu pour la p\u00e9riode 2026\u20132033, visant \u00e0 moderniser les infrastructures portuaires et \u00e0 d\u00e9velopper le report modal vers le fluvial.',
        image: '/images/vie-adherents/vnf-lorraine.png',
      },
      {
        title: 'Naviland Cargo \u2013 Acquisitions et expansion',
        content:
          'Naviland Cargo poursuit son expansion avec l\u2019acquisition de Seatruck (Geodis). La nouvelle marque \u00ab\u00a0Seatruck by Naviland Cargo\u00a0\u00bb g\u00e9n\u00e8re un chiffre d\u2019affaires additionnel de 55\u00a0millions d\u2019euros. L\u2019entreprise ouvre \u00e9galement une agence \u00e0 Brest et dispose d\u00e9sormais de 750\u00a0tracteurs et 1\u00a0200\u00a0ch\u00e2ssis sur l\u2019ensemble du territoire.',
        image: '/images/vie-adherents/naviland-logo.png',
      },
      {
        title: 'T3M \u2013 Expansion du r\u00e9seau',
        content:
          'T3M lance de nouveaux trains sur les axes Lille\u2013Miramas et Paris\u2013Miramas d\u00e8s mars\u00a02026. Le transfert de ses activit\u00e9s vers Dourges s\u2019accompagne d\u2019une mont\u00e9e en puissance : de 3\u00a0fr\u00e9quences par semaine actuellement, l\u2019op\u00e9rateur vise 5\u00a0fr\u00e9quences hebdomadaires d\u2019ici fin 2026.',
        image: '/images/vie-adherents/t3m-dourges.jpg',
      },
      {
        title: 'Haropa Ports \u2013 Plan strat\u00e9gique',
        content:
          'Haropa Ports d\u00e9voile son plan strat\u00e9gique 2026\u20132030, articul\u00e9 autour de 13\u00a0ambitions strat\u00e9giques. Le plan met l\u2019accent sur le d\u00e9veloppement multimodal et la d\u00e9carbonation des activit\u00e9s portuaires de l\u2019axe Seine.',
        image: '/images/vie-adherents/haropa-logo.png',
      },
    ],
  },
  {
    label: 'D\u00e9cembre 2025',
    articles: [
      {
        title: 'Modalis & Terminal Dunkerque-Port',
        content:
          'Un investissement de 25\u00a0millions d\u2019euros pour un nouveau terminal de ferroutage \u00e0 Dunkerque-Port, ouverture pr\u00e9vue au printemps\u00a02026. L\u2019infrastructure pourra accueillir 130 \u00e0 150\u00a0semi-remorques et permettra de retirer environ 50\u00a0000\u00a0unit\u00e9s de la route chaque ann\u00e9e.',
        image: '/images/vie-adherents/modalis-dunkerque.png',
      },
      {
        title: 'Metrocargo Italia \u2013 Extension r\u00e9seau',
        content:
          'Metrocargo Italia poursuit le d\u00e9veloppement de son r\u00e9seau avec de nouvelles dessertes depuis Naples (Nola) et Bari, ainsi que les liaisons Paris\u2013Savone, Paris\u2013G\u00eanes et Dourges\u2013G\u00eanes. Ces nouveaux axes renforcent les connexions intermodales entre la France et l\u2019Italie.',
        image: '/images/vie-adherents/metrocargo-map.jpg',
      },
      {
        title: 'Terminal intermodal de S\u00e8te \u2013 Inauguration',
        content:
          'Inaugur\u00e9 le 25\u00a0novembre\u00a02025, le terminal intermodal de S\u00e8te s\u2019\u00e9tend sur 6\u00a0hectares pour un investissement de 20\u00a0millions d\u2019euros. \u00c9quip\u00e9 du syst\u00e8me Modalohr, il permettra le transit de 22\u00a0500\u00a0semi-remorques par an sur l\u2019axe S\u00e8te\u2013Calais.',
        image: '/images/vie-adherents/terminal-sete.png',
      },
      {
        title: 'VNF \u2013 \u00c9v\u00e9nements Rivertraining',
        content:
          'Le Riverdating de Lyon a rassembl\u00e9 plus de 650\u00a0participants. Pour 2026, VNF propose un programme gratuit financ\u00e9 par les Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie (CEE), renfor\u00e7ant l\u2019accessibilit\u00e9 de la formation aux m\u00e9tiers du fluvial.',
        image: '/images/vie-adherents/vnf-riverdating.png',
      },
      {
        title: 'Brittany Ferries \u2013 Expansion',
        content:
          'Brittany Ferries d\u00e9veloppe l\u2019autoroute ferroviaire Mouguerre\u2013Cherbourg, passant de 5 \u00e0 6\u00a0rotations par semaine sur un axe de plus de 950\u00a0kilom\u00e8tres. Cette mont\u00e9e en cadence r\u00e9pond \u00e0 une demande croissante de solutions de transport d\u00e9carbon\u00e9es.',
        image: '/images/vie-adherents/brittany-ferries.jpg',
      },
    ],
  },
  {
    label: 'Octobre 2025',
    articles: [
      {
        title: 'Paris Terminal \u2013 Gennevilliers 24h/24',
        content:
          'Paris Terminal passe \u00e0 un fonctionnement 24\u00a0h/24, 5\u00a0jours par semaine sur le site de Gennevilliers. La navette fluviale Gennevilliers\u2013Bonneuil assure d\u00e9sormais 400\u00a0EVP par semaine, \u00e9vitant la circulation de 8\u00a0000 \u00e0 10\u00a0000\u00a0camions sur les routes franciliennes.',
        image: '/images/vie-adherents/paris-terminal.png',
      },
      {
        title: 'Logi Ports Shuttle (Sogestran) \u2013 R\u00e9organisation',
        content:
          'Sogestran restructure ses activit\u00e9s sous la marque Logi Ports Shuttle. Alain Maliverney est nomm\u00e9 Expert Multimodal et Damien Fran\u00e7oise prend la Direction des Op\u00e9rations. Cette r\u00e9organisation vise \u00e0 renforcer l\u2019offre multimodale du groupe.',
        image: '/images/vie-adherents/sogestran.png',
      },
      {
        title: 'Combipass CombiSwap \u2013 Innovation',
        content:
          'Co-d\u00e9velopp\u00e9e avec Lecitrailer (Espagne), la semi-remorque CombiSwap offre +10\u00a0% de capacit\u00e9 suppl\u00e9mentaire et un toit isol\u00e9 de 30\u00a0mm. Elle a \u00e9t\u00e9 \u00e9lue \u00ab\u00a0Semi-remorque de l\u2019ann\u00e9e\u00a0\u00bb au salon de Madrid, r\u00e9compensant une innovation au service du transport combin\u00e9.',
        image: '/images/vie-adherents/combiswap.jpg',
      },
      {
        title: 'Combronde \u2013 Terminal Arles & Service Bordeaux',
        content:
          'Combronde a inaugur\u00e9 en septembre\u00a02025 le terminal \u00ab\u00a0Mistral\u00a0\u00bb au port d\u2019Arles, en partenariat avec Froidcombi et CNR. Le r\u00e9seau propose d\u00e9sormais 5\u00a0connexions Lille\u2013Arles et un sch\u00e9ma triangulaire Le\u00a0Havre\u2013Bordeaux\u2013Arles, \u00e9largissant consid\u00e9rablement sa couverture g\u00e9ographique.',
        image: '/images/vie-adherents/combronde-reseau.png',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function VieDesAdherentsPage() {
  return (
    <PageLayout
      title="La vie des adh\u00e9rents"
      subtitle="Les entreprises adh\u00e9rentes du GNTC sont \u00e0 votre service pour rendre le transport combin\u00e9 rail-route et fleuve-route toujours plus accessible et performant."
      breadcrumbs={[
        { label: 'Actualit\u00e9s', href: '/actualites' },
        { label: 'Vie des adh\u00e9rents' },
      ]}
    >
      {/* Timeline container */}
      <div className="relative max-w-4xl mx-auto">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[19px] sm:left-[23px] top-0 bottom-0 w-px"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to bottom, #1a4d2e 0%, #84cc16 50%, rgba(88,123,189,0.15) 100%)',
          }}
        />

        {PERIODS.map((period, periodIdx) => (
          <section key={period.label} className={periodIdx > 0 ? 'mt-16' : ''}>
            {/* Period heading -- sticky date label */}
            <div className="sticky top-0 z-20 pb-4">
              <div className="flex items-center gap-3">
                {/* Dot on the timeline */}
                <div className="relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue flex items-center justify-center shadow-md">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-white"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="14"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M3 8H17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 2V5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13 2V5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-text bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                  {period.label}
                </h2>
              </div>
            </div>

            {/* Articles for this period */}
            <div className="space-y-6 pl-[19px] sm:pl-[23px] ml-5 sm:ml-6 border-l-0">
              {period.articles.map((article, articleIdx) => (
                <article
                  key={articleIdx}
                  className="relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Connector line from timeline to card */}
                  <div
                    className="absolute -left-5 sm:-left-6 top-8 w-5 sm:w-6 h-px bg-gray-200"
                    aria-hidden="true"
                  />
                  {/* Small dot on the timeline */}
                  <div
                    className="absolute -left-[22px] sm:-left-[27px] top-[29px] w-2 h-2 rounded-full bg-white border-2 border-blue"
                    aria-hidden="true"
                  />

                  <div className="flex flex-col sm:flex-row">
                    {/* Image -- left side on desktop, top on mobile */}
                    {article.image && (
                      <div className="sm:w-56 md:w-64 lg:w-72 flex-shrink-0">
                        <div className="relative aspect-[16/10] sm:aspect-auto sm:h-full min-h-[140px]">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-contain sm:object-cover bg-gray-50 p-2 sm:p-0"
                            sizes="(max-width: 640px) 100vw, 288px"
                          />
                        </div>
                      </div>
                    )}

                    {/* Content -- right side */}
                    <div className="flex-1 p-5 sm:p-6">
                      <h3 className="font-display font-bold text-text text-base sm:text-lg leading-snug group-hover:text-blue transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {article.content}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* Timeline end cap */}
        <div className="flex items-center gap-3 mt-12 pl-1">
          <div className="relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-muted"
            >
              <circle
                cx="9"
                cy="9"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9 2V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M9 14V16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M2 9H4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M14 9H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-sm text-muted italic">
            D&rsquo;autres actualit&eacute;s seront publi&eacute;es prochainement&hellip;
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
