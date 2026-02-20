import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/Site/PageLayout';

/* -------------------------------------------------------------------------- */
/*  DATA                                                                       */
/* -------------------------------------------------------------------------- */

const PDF_URL =
  'https://gntc.fr/wp-content/uploads/2025/05/Guide-Transport-combine-GNTC-Digitale-Mai-2025.pdf';

const SOMMAIRE_P1 = [
  'Le mot du GNTC',
  'Le transport combin\u00e9 aujourd\u2019hui',
  'Un mode de transport qui maille le territoire',
  'Les acteurs du combin\u00e9 rail-route',
  'L\u2019unit\u00e9 de transport intermodal (UTI)',
  'Quelle marchandise pouvez-vous transporter ?',
  'La plateforme multimodale',
  'Les op\u00e9rateurs de transport combin\u00e9',
  'Cas concret',
  'Outil de la d\u00e9carbonation',
];

const SOMMAIRE_P2 = [
  '\u00c9tape 1 : Lister les flux',
  '\u00c9tape 2 : Construire le cahier des charges',
  '\u00c9tape 3 : Qui consulter ?',
  '\u00c9tape 4 : R\u00e9ception des offres',
  'Incitations au report modal et aides',
  'Ils l\u2019ont fait ! (t\u00e9moignages)',
  '\u00c9tape 5 : Conduire le changement',
  'Retour d\u2019exp\u00e9rience',
  'Bibliographie & Glossaire',
];

const CHIFFRES = [
  { value: '41 %', label: 'Part du TC dans le fret ferroviaire (tonnes.km)' },
  { value: '1 train', label: '= 40/45 camions retir\u00e9s de la route' },
  { value: '1 000 000', label: 'camions en moins sur les routes chaque ann\u00e9e' },
  { value: '6x', label: 'moins d\u2019\u00e9nergie consomm\u00e9e vs routier' },
  { value: '1 Mt', label: 'CO\u2082 \u00e9conomis\u00e9es par an' },
  { value: '~15 OTC', label: '40 plateformes, 1 125 000 UTI/an' },
];

const UTI_DATA = [
  {
    type: 'Conteneurs',
    share: 41,
    color: 'bg-blue',
    desc: 'Bo\u00eetes m\u00e9talliques normalis\u00e9es (20\u2019, 40\u2019, 45\u2019) utilis\u00e9es pour le transport maritime et terrestre. Manutention par le haut (grue, portique).',
  },
  {
    type: 'Caisses mobiles',
    share: 39,
    color: 'bg-cyan',
    desc: 'Unit\u00e9s sp\u00e9cifiques au transport combin\u00e9 terrestre, plus l\u00e9g\u00e8res, avec pieds r\u00e9tractables. Tr\u00e8s r\u00e9pandues en Europe continentale.',
  },
  {
    type: 'Semi-remorques',
    share: 20,
    color: 'bg-orange',
    desc: 'La semi-remorque enti\u00e8re est charg\u00e9e sur le wagon. Technique dite de \u00ab\u00a0route roulante\u00a0\u00bb ou \u00ab\u00a0autoroute ferroviaire\u00a0\u00bb.',
  },
];

const ETAPES = [
  {
    num: 1,
    title: 'Lister les flux',
    desc: 'Identifiez vos flux \u00e9ligibles : distance minimale de 500 km environ, avec un pr\u00e9/post-acheminement routier de 150 km maximum.',
    tips: ['Distance totale > 500 km', 'Pr\u00e9/post-acheminement < 150 km', 'Volume r\u00e9gulier et r\u00e9current'],
  },
  {
    num: 2,
    title: 'Construire le cahier des charges',
    desc: 'Pr\u00e9cisez le type de marchandise, les volumes, le type d\u2019UTI souhait\u00e9, les d\u00e9lais et la fr\u00e9quence.',
    tips: ['Type de marchandise', 'Volumes et fr\u00e9quences', 'Type d\u2019UTI (conteneur, caisse mobile, SR)'],
  },
  {
    num: 3,
    title: 'Qui consulter ?',
    desc: 'Contactez les op\u00e9rateurs de transport combin\u00e9 (OTC), utilisez le plan de transport du GNTC ou les plateformes num\u00e9riques.',
    tips: ['Op\u00e9rateurs de TC (OTC)', 'Plan de transport GNTC', 'Plateformes num\u00e9riques'],
  },
  {
    num: 4,
    title: 'R\u00e9ception des offres',
    desc: 'Analysez les propositions : prix par UTI, d\u00e9lais de transit, qualit\u00e9 de service, documents CMR.',
    tips: ['Prix par UTI', 'D\u00e9lais de transit', 'Documents CMR'],
  },
  {
    num: 5,
    title: 'Conduire le changement',
    desc: 'Int\u00e9grez le report modal dans votre d\u00e9marche RSE, d\u00e9signez des ambassadeurs internes et adoptez une approche test & learn.',
    tips: ['D\u00e9marche RSE', 'Ambassadeurs internes', 'Test & learn progressif'],
  },
];

const TEMOIGNAGES = [
  {
    company: 'VELUX',
    persons: 'Marc Lachaize & Mouloud Frah',
    quote: 'Gr\u00e2ce au transport combin\u00e9, nous avons r\u00e9duit de 70 % nos \u00e9missions de CO\u2082 sur les flux concern\u00e9s.',
    result: '-70 % \u00e9missions CO\u2082',
    color: 'border-blue',
    bg: 'bg-blue/5',
  },
  {
    company: 'IFCO Systems',
    persons: 'Serge-Edouard Ghesqui\u00e8res',
    quote: 'Le ferroutage longue distance nous permet de couvrir l\u2019Europe de mani\u00e8re fiable et \u00e9cologique.',
    result: 'Ferroutage longue distance',
    color: 'border-cyan',
    bg: 'bg-cyan/5',
  },
  {
    company: 'PepsiCo France',
    persons: 'Laurent Kamiel',
    quote: 'Nous avons atteint 15 % de nos kilom\u00e8tres en report modal gr\u00e2ce au transport combin\u00e9 rail-route.',
    result: '15 % des km en report modal',
    color: 'border-blue',
    bg: 'bg-blue/5',
  },
  {
    company: 'Lesieur',
    persons: 'Thomas Courtois',
    quote: '30 % de nos kilom\u00e8tres sont d\u00e9sormais effectu\u00e9s en train, ce qui a r\u00e9duit nos \u00e9missions de 40 %.',
    result: '30 % des km en train, -40 % \u00e9missions',
    color: 'border-cyan',
    bg: 'bg-cyan/5',
  },
];

const AIDES = [
  {
    title: 'Dispositif REMO',
    desc: 'Le R\u00e9gime d\u2019aide au report modal (REMO) soutient financi\u00e8rement les op\u00e9rateurs de transport combin\u00e9 pour compenser le diff\u00e9rentiel de co\u00fbt avec le tout-routier.',
  },
  {
    title: 'Fiches CEE',
    desc: 'Trois op\u00e9rations CEE sont directement li\u00e9es au transport combin\u00e9, permettant de financer l\u2019acquisition d\u2019UTI et de wagons.',
    codes: ['TRA-EQ-101', 'TRA-EQ-108', 'TRA-SE-116'],
  },
  {
    title: 'Fiscalit\u00e9 avantageuse',
    desc: 'Les v\u00e9hicules de pr\u00e9/post-acheminement b\u00e9n\u00e9ficient d\u2019une d\u00e9rogation de poids (44 t + 2 t) et d\u2019exon\u00e9rations fiscales sp\u00e9cifiques.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Inline SVG icons                                                           */
/* -------------------------------------------------------------------------- */

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8m0 0L5 7m3 3l3-3M3 12h10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 3h4.5a1.5 1.5 0 011.5 1.5V13a1 1 0 00-1-1H2V3zM14 3H9.5A1.5 1.5 0 008 4.5V13a1 1 0 011-1h5V3z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-200" aria-hidden="true">
      <path
        d="M10 8H6a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V8zm8 0h-4a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V8z"
        fill="currentColor"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  PAGE COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function GuidePage() {
  return (
    <PageLayout
      title="Guide du Transport Combin&eacute; Rail-Route"
      subtitle="Publi&eacute; par le GNTC en partenariat avec l&rsquo;ADEME, ce guide de 35 pages est destin&eacute; aux chargeurs, transporteurs routiers et commissionnaires souhaitant d&eacute;couvrir ou d&eacute;velopper le transport combin&eacute;."
      hero
      breadcrumbs={[{ label: 'Guide' }]}
    >
      {/* ================================================================== */}
      {/*  1. HERO DOWNLOAD CTA                                              */}
      {/* ================================================================== */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Cover image */}
            <div className="relative lg:w-[340px] flex-shrink-0 bg-gray-50">
              <Image
                src="/images/actualites/guide-tc.jpg"
                alt="Couverture du Guide du Transport Combin\u00e9 Rail-Route GNTC / ADEME"
                width={340}
                height={480}
                className="w-full h-64 lg:h-full object-cover"
                priority
              />
            </div>

            {/* Text + CTA */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white gntc-gradient-bg px-3 py-1 rounded-full">
                  <BookIcon />
                  Mai 2025
                </span>
                <span className="text-xs font-medium text-muted bg-gray-100 px-3 py-1 rounded-full">
                  35 pages
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-display font-bold text-text mb-3">
                T&eacute;l&eacute;chargez le guide complet
              </h2>

              <p className="text-sm text-muted leading-relaxed mb-2">
                Ce guide pratique aborde en deux parties tout ce qu&rsquo;il faut savoir pour se lancer
                dans le transport combin&eacute; rail-route : pr&eacute;sentation du mode, acteurs,
                &eacute;quipements, et un parcours en 5 &eacute;tapes pour concr&eacute;tiser un projet
                de report modal.
              </p>
              <p className="text-sm text-muted leading-relaxed mb-6">
                Disponible en <strong className="text-text">version num&eacute;rique et papier</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <DownloadIcon />
                  T&eacute;l&eacute;charger le PDF
                </a>
                <a
                  href="https://librairie.ademe.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:text-blue/80 transition-colors"
                >
                  &Eacute;galement disponible sur la librairie ADEME
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  2. SOMMAIRE                                                        */}
      {/* ================================================================== */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Sommaire</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Partie 1 */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg gntc-gradient-bg flex items-center justify-center text-white font-display font-bold text-xs">
                1
              </span>
              <h3 className="font-display font-bold text-text text-sm leading-snug">
                Pr&eacute;sentation du transport combin&eacute; rail-route
              </h3>
            </div>
            <ol className="space-y-2">
              {SOMMAIRE_P1.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="text-blue font-mono text-xs font-bold mt-0.5 w-5 flex-shrink-0 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {/* Partie 2 */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg gntc-gradient-bg flex items-center justify-center text-white font-display font-bold text-xs">
                2
              </span>
              <h3 className="font-display font-bold text-text text-sm leading-snug">
                Je me lance ! Concr&eacute;tiser un projet de report modal
              </h3>
            </div>
            <ol className="space-y-2">
              {SOMMAIRE_P2.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="text-blue font-mono text-xs font-bold mt-0.5 w-5 flex-shrink-0 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  3a. CHIFFRES CL\u00c9S                                              */}
      {/* ================================================================== */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-6">Chiffres cl&eacute;s</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CHIFFRES.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl font-display font-bold gntc-gradient mb-1">
                {c.value}
              </div>
              <div className="text-xs sm:text-sm text-muted leading-snug">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/*  3b. LES UTI                                                        */}
      {/* ================================================================== */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-2">
          Les Unit&eacute;s de Transport Intermodales (UTI)
        </h2>
        <p className="text-sm text-muted mb-8 max-w-2xl">
          R&eacute;partition des UTI transport&eacute;es en transport combin&eacute; rail-route en France.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {UTI_DATA.map((uti) => (
            <div key={uti.type} className="bg-white rounded-xl border border-gray-100 p-6">
              {/* Visual bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${uti.color} rounded-full transition-all`}
                    style={{ width: `${uti.share}%` }}
                  />
                </div>
                <span className="text-lg font-display font-bold text-text flex-shrink-0">
                  {uti.share} %
                </span>
              </div>
              <h3 className="font-display font-bold text-text mb-2">{uti.type}</h3>
              <p className="text-sm text-muted leading-relaxed">{uti.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/*  3c. LES 5 \u00c9TAPES POUR SE LANCER                               */}
      {/* ================================================================== */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-2">
          Les 5 &eacute;tapes pour se lancer
        </h2>
        <p className="text-sm text-muted mb-8 max-w-2xl">
          Le guide d&eacute;taille un parcours en 5 &eacute;tapes pour concr&eacute;tiser votre
          projet de report modal vers le transport combin&eacute;.
        </p>

        <div className="space-y-6">
          {ETAPES.map((etape, i) => (
            <div key={etape.num} className="relative flex gap-5">
              {/* Connector line */}
              {i < ETAPES.length - 1 && (
                <div className="absolute left-6 top-14 w-px h-[calc(100%-2rem)] bg-gradient-to-b from-blue/30 to-blue/10" />
              )}

              {/* Number circle */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full gntc-gradient-bg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">{etape.num}</span>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 flex-1">
                <h3 className="font-display font-bold text-text mb-2">{etape.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-3">{etape.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {etape.tips.map((tip) => (
                    <span
                      key={tip}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue bg-blue/5 px-2.5 py-1 rounded-full"
                    >
                      <CheckIcon />
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/*  3d. T\u00c9MOIGNAGES                                               */}
      {/* ================================================================== */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-2">
          Ils l&rsquo;ont fait !
        </h2>
        <p className="text-sm text-muted mb-8 max-w-2xl">
          Des chargeurs t&eacute;moignent de leur exp&eacute;rience du transport combin&eacute;.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {TEMOIGNAGES.map((t) => (
            <div
              key={t.company}
              className={`relative rounded-xl border-l-4 ${t.color} ${t.bg} p-6`}
            >
              <QuoteIcon />
              <blockquote className="text-sm text-muted leading-relaxed mt-2 mb-4 italic">
                &laquo;&nbsp;{t.quote}&nbsp;&raquo;
              </blockquote>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="font-display font-bold text-text text-sm">{t.company}</div>
                  <div className="text-xs text-muted">{t.persons}</div>
                </div>
                <div className="text-xs font-bold gntc-gradient whitespace-nowrap">
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/*  3e. AIDES ET INCITATIONS                                           */}
      {/* ================================================================== */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-2">
          Aides et incitations au report modal
        </h2>
        <p className="text-sm text-muted mb-8 max-w-2xl">
          Plusieurs dispositifs publics encouragent le d&eacute;veloppement du transport combin&eacute;.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {AIDES.map((aide) => (
            <div
              key={aide.title}
              className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col"
            >
              <h3 className="font-display font-bold text-text mb-2">{aide.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-3 flex-1">{aide.desc}</p>
              {aide.codes && (
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  {aide.codes.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-xs font-medium text-blue bg-blue/5 px-2.5 py-1 rounded-full"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-muted">
          En savoir plus sur{' '}
          <Link href="/les-cee" className="text-blue hover:underline font-medium">
            les Certificats d&rsquo;&Eacute;conomie d&rsquo;&Eacute;nergie (CEE)
          </Link>{' '}
          et{' '}
          <Link href="/transport-combine/aides" className="text-blue hover:underline font-medium">
            les aides au transport combin&eacute;
          </Link>
          .
        </div>
      </section>

      {/* ================================================================== */}
      {/*  4. BOTTOM CTA                                                      */}
      {/* ================================================================== */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-lg font-display font-bold text-text mb-2">
              Pr&ecirc;t &agrave; vous lancer ?
            </h2>
            <p className="text-sm text-muted max-w-lg">
              T&eacute;l&eacute;chargez le guide complet de 35 pages ou contactez le GNTC pour
              &ecirc;tre accompagn&eacute; dans votre d&eacute;marche de report modal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <DownloadIcon />
              T&eacute;l&eacute;charger le PDF
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-text font-semibold text-sm px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              Contacter le GNTC
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
