/* ------------------------------------------------------------------ */
/*  Données des actualités — articles réels issus de gntc.fr          */
/* ------------------------------------------------------------------ */

export type ArticleCategory = 'actualite' | 'communique' | 'ferroviaire' | 'vie-adherents' | 'evenement';

export interface Article {
  slug: string;
  title: string;
  date: string;       // YYYY-MM-DD
  category: ArticleCategory;
  excerpt: string;
  content: string;     // HTML content
  image?: string;
  videoId?: string;    // YouTube video ID
}

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  actualite: 'Actualit\u00e9',
  communique: 'Communiqu\u00e9',
  ferroviaire: 'Ferroviaire',
  'vie-adherents': 'Vie des adh\u00e9rents',
  evenement: '\u00c9v\u00e9nement',
};

export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  actualite: '#1a4d2e',
  communique: '#8b6f47',
  ferroviaire: '#b45309',
  'vie-adherents': '#65a30d',
  evenement: '#c4783e',
};

export const ARTICLES: Article[] = [
  /* ---- 2026 ---- */
  {
    slug: 'la-vie-des-adherents',
    title: 'La vie des adh\u00e9rents',
    date: '2026-02-17',
    category: 'vie-adherents',
    excerpt: "Toutes les informations d'actualit\u00e9 sur les adh\u00e9rents du GNTC, leurs offres, leurs m\u00e9tiers, leurs \u00e9quipes\u2026",
    content: "<p>Toutes les informations d'actualit\u00e9 sur les adh\u00e9rents du GNTC, leurs offres, leurs m\u00e9tiers, leurs \u00e9quipes. Retrouvez les derni\u00e8res nouvelles de nos membres : nouveaux services, d\u00e9veloppements, partenariats et innovations au sein de la fili\u00e8re du transport combin\u00e9.</p>",
    image: '/images/actualites/vie-adherents.png',
  },
  {
    slug: 'rendez-vous-au-sitl-2026',
    title: 'Rendez-vous au SITL 2026',
    date: '2026-02-16',
    category: 'evenement',
    excerpt: "SITL 2026 \u2014 31 mars au 2 avril \u2014 Paris Nord Villepinte \u2014 Hall 7. Le GNTC sera pr\u00e9sent pour repr\u00e9senter la fili\u00e8re du transport combin\u00e9.",
    content: "<p>Le GNTC sera pr\u00e9sent au SITL 2026, du 31 mars au 2 avril, \u00e0 Paris Nord Villepinte, Hall 7. Venez d\u00e9couvrir notre stand et \u00e9changer avec les acteurs de la fili\u00e8re du transport combin\u00e9.</p>",
    image: '/images/actualites/sitl-2026.png',
  },
  {
    slug: 'nouveau-partenaire-rail-flow',
    title: 'Nouveau partenaire du GNTC : Rail-Flow',
    date: '2026-02-15',
    category: 'actualite',
    excerpt: "Le GNTC est heureux d'annoncer l'arriv\u00e9e de Rail-Flow comme nouveau partenaire au sein de notre organisation.",
    content: "<p>Le GNTC est heureux d'annoncer l'arriv\u00e9e de Rail-Flow comme nouveau partenaire. Rail-Flow est une entreprise europ\u00e9enne de freight-tech sp\u00e9cialis\u00e9e dans la digitalisation de la logistique ferroviaire et intermodale.</p>",
    image: '/images/actualites/rail-flow.png',
  },
  {
    slug: 'webinaire-remo',
    title: 'Webinaire REMO',
    date: '2026-02-07',
    category: 'actualite',
    excerpt: "D\u00e9couvrez le nouveau dispositif d'aide REMO lundi 16 f\u00e9vrier 2026 de 9h \u00e0 9h45.",
    content: "<p>D\u00e9couvrez le nouveau dispositif d'aide REMO (Report Modal) lors d'un webinaire organis\u00e9 le lundi 16 f\u00e9vrier 2026 de 9h \u00e0 9h45. Ce dispositif vise \u00e0 accompagner le report modal de la route vers le rail et le fluvial.</p>",
    image: '/images/actualites/webinaire-remo.png',
  },
  {
    slug: 'report-modal-nouvel-appel-a-projet-remove',
    title: 'Report modal : nouvel Appel \u00e0 projet REMOVE',
    date: '2026-01-27',
    category: 'actualite',
    excerpt: "L'ADEME lance le nouvel appel \u00e0 projet ReMoVe pour le soutien financier au report modal de la route vers le rail, le maritime et le fluvial. Date limite : 30 juin 2026.",
    content: "<p>L'ADEME lance un nouvel appel \u00e0 projet ReMoVe (Report Modal Valoris\u00e9) pour accompagner financi\u00e8rement le report modal de la route vers le rail, le maritime et le fluvial. Les entreprises ont jusqu'au 30 juin 2026 pour d\u00e9poser leur dossier.</p>",
    image: '/images/actualites/remove-ademe.png',
  },
  {
    slug: 'barcelone-la-llagosta-transport-combine-espagne',
    title: 'Barcelone La Llagosta : nouvelle avanc\u00e9e du transport combin\u00e9 en Espagne',
    date: '2026-01-16',
    category: 'actualite',
    excerpt: "Ouverture du terminal intermodal de La Llagosta \u00e0 Barcelone. Investissement de 123 M\u20ac, 130 000 unit\u00e9s de transport par an via 2 600 trains.",
    content: "<p>Le nouveau terminal intermodal de La Llagosta, \u00e0 proximit\u00e9 de Barcelone, a ouvert ses portes. Cet investissement de 123 millions d'euros permettra le traitement de 130 000 unit\u00e9s de transport par an gr\u00e2ce \u00e0 2 600 trains. Une avanc\u00e9e majeure pour le transport combin\u00e9 sur le corridor franco-espagnol.</p>",
    image: '/images/actualites/barcelone-llagosta.png',
  },

  /* ---- 2025 ---- */
  {
    slug: 'montee-en-puissance-fret-ferroviaire-2025',
    title: 'Une ann\u00e9e de mont\u00e9e en puissance pour le fret ferroviaire fran\u00e7ais',
    date: '2025-12-15',
    category: 'actualite',
    excerpt: "L'ann\u00e9e 2025 marque une mont\u00e9e en puissance significative du fret ferroviaire en France, port\u00e9e par les investissements publics et la mobilisation de la fili\u00e8re.",
    content: "<p>L'ann\u00e9e 2025 aura \u00e9t\u00e9 marqu\u00e9e par une mont\u00e9e en puissance du fret ferroviaire fran\u00e7ais. Les investissements dans les terminaux, le renforcement des aides publiques et la mobilisation de l'ensemble des acteurs de la fili\u00e8re portent leurs fruits.</p>",
    image: '/images/actualites/fret-ferroviaire-2025.png',
  },
  {
    slug: 'alain-maliverney-president-commission-fluviale',
    title: 'Alain MALIVERNEY, nouveau Pr\u00e9sident de la Commission fluviale du GNTC',
    date: '2025-12-10',
    category: 'communique',
    excerpt: "Alain Maliverney est \u00e9lu pr\u00e9sident de la Commission fluviale du GNTC, renfor\u00e7ant l'engagement du groupement sur le transport combin\u00e9 fleuve-route.",
    content: "<p>Alain Maliverney a \u00e9t\u00e9 \u00e9lu pr\u00e9sident de la Commission fluviale du GNTC. Cette nomination renforce l'engagement du groupement en faveur du transport combin\u00e9 fleuve-route et du d\u00e9veloppement des liaisons fluviales en France.</p>",
    image: '/images/actualites/maliverney-fluvial.png',
  },
  {
    slug: 'manutention-art-discret-transport-combine',
    title: "La manutention, l'art discret du transport combin\u00e9",
    date: '2025-11-17',
    category: 'actualite',
    excerpt: "Zoom sur la manutention, maillon essentiel mais souvent m\u00e9connu de la cha\u00eene du transport combin\u00e9.",
    content: "<p>La manutention est un maillon essentiel mais souvent m\u00e9connu de la cha\u00eene du transport combin\u00e9. Cet article explore les techniques, les \u00e9quipements et les enjeux de cette \u00e9tape cl\u00e9 qui permet le transfert des UTI entre la route et le rail ou le fluvial.</p>",
    image: '/images/actualites/manutention.png',
  },
  {
    slug: 'journee-transport-combine-2025',
    title: 'La Journ\u00e9e du transport combin\u00e9 2025',
    date: '2025-10-15',
    category: 'evenement',
    excerpt: "Retour sur la Journ\u00e9e du transport combin\u00e9 2025, \u00e9v\u00e9nement annuel r\u00e9unissant l'ensemble des acteurs de la fili\u00e8re. Retrouvez la vid\u00e9o de la conf\u00e9rence.",
    content: "<p>La Journ\u00e9e du transport combin\u00e9 2025 a r\u00e9uni l'ensemble des acteurs de la fili\u00e8re pour \u00e9changer sur les enjeux et perspectives du secteur. Conf\u00e9rences, tables rondes et networking au programme de cet \u00e9v\u00e9nement annuel incontournable.</p><p>Retrouvez la vid\u00e9o de cette journ\u00e9e ci-dessous.</p>",
    image: '/images/actualites/journee-tc-2025.png',
    videoId: 'mY1DAoMd76Y',
  },
  {
    slug: 'programme-europeen-cef-transport-combine',
    title: "Le programme europ\u00e9en Connecting Europe Facility (CEF)",
    date: '2025-09-20',
    category: 'actualite',
    excerpt: "Le programme europ\u00e9en CEF et son int\u00e9r\u00eat pour le transport combin\u00e9 : financements disponibles pour les projets d'infrastructures intermodales.",
    content: "<p>Le programme europ\u00e9en Connecting Europe Facility (CEF) offre des opportunit\u00e9s de financement pour les projets d'infrastructures de transport combin\u00e9. D\u00e9couvrez les conditions d'\u00e9ligibilit\u00e9 et les montants disponibles pour la fili\u00e8re intermodale.</p>",
    image: '/images/actualites/cef-programme.png',
  },
  {
    slug: 'fermeture-rocade-avignon-poids-lourds',
    title: "Fermeture de la rocade d'Avignon aux poids lourds",
    date: '2025-09-15',
    category: 'communique',
    excerpt: "Communiqu\u00e9 de presse du GNTC sur la fermeture de la rocade d'Avignon aux poids lourds et ses cons\u00e9quences pour le transport combin\u00e9.",
    content: "<p>Le GNTC r\u00e9agit \u00e0 la d\u00e9cision de fermeture de la rocade d'Avignon aux poids lourds. Cette mesure impacte directement les op\u00e9rations de pr\u00e9 et post-acheminement du transport combin\u00e9 dans la r\u00e9gion et renforce la n\u00e9cessit\u00e9 du report modal.</p>",
    image: '/images/actualites/rocade-avignon.jpg',
  },
  {
    slug: 'conference-ambition-france-transport',
    title: 'La Conf\u00e9rence Ambition France Transport',
    date: '2025-07-10',
    category: 'actualite',
    excerpt: "Le GNTC a particip\u00e9 \u00e0 la Conf\u00e9rence Ambition France Transport pour porter la voix du transport combin\u00e9.",
    content: "<p>Le GNTC \u00e9tait pr\u00e9sent \u00e0 la Conf\u00e9rence Ambition France Transport pour d\u00e9fendre les int\u00e9r\u00eats de la fili\u00e8re du transport combin\u00e9 et promouvoir le report modal comme levier de la transition \u00e9cologique du fret.</p>",
    image: '/images/actualites/ambition-france.png',
  },
  {
    slug: 'communique-paris-nord',
    title: 'Communiqu\u00e9 sur Paris-Nord',
    date: '2025-07-05',
    category: 'communique',
    excerpt: "Communiqu\u00e9 du GNTC concernant la situation du terminal Paris-Nord et ses enjeux pour la fili\u00e8re.",
    content: "<p>Le GNTC publie un communiqu\u00e9 concernant la situation du terminal Paris-Nord, plateforme strat\u00e9gique pour le transport combin\u00e9 en \u00cele-de-France.</p>",
    image: '/images/actualites/paris-nord.jpg',
  },
  {
    slug: 'regles-assurance-transport-combine',
    title: "Les r\u00e8gles d'assurance dans le transport combin\u00e9",
    date: '2025-06-15',
    category: 'actualite',
    excerpt: "Point sur les r\u00e8gles d'assurance sp\u00e9cifiques au transport combin\u00e9 et les responsabilit\u00e9s des diff\u00e9rents acteurs de la cha\u00eene.",
    content: "<p>Les r\u00e8gles d'assurance dans le transport combin\u00e9 pr\u00e9sentent des sp\u00e9cificit\u00e9s li\u00e9es \u00e0 la multiplicit\u00e9 des acteurs et des modes de transport impliqu\u00e9s. Cet article fait le point sur les responsabilit\u00e9s et les couvertures n\u00e9cessaires.</p>",
    image: '/images/actualites/assurance-tc.jpg',
  },
  {
    slug: 'soiree-80-ans-gntc',
    title: 'Soir\u00e9e des 80 ans du GNTC',
    date: '2025-05-20',
    category: 'evenement',
    excerpt: "Le GNTC a c\u00e9l\u00e9br\u00e9 ses 80 ans au Mus\u00e9e des Arts Forains, r\u00e9unissant l'ensemble de la fili\u00e8re.",
    content: "<p>Le GNTC a c\u00e9l\u00e9br\u00e9 ses 80 ans lors d'une soir\u00e9e exceptionnelle au Mus\u00e9e des Arts Forains \u00e0 Paris, r\u00e9unissant adh\u00e9rents, partenaires et repr\u00e9sentants des pouvoirs publics pour c\u00e9l\u00e9brer 80 ans au service du transport combin\u00e9 en France.</p>",
    image: '/images/actualites/80ans-soiree.jpg',
  },
  {
    slug: 'publication-guide-transport-combine-rail-route',
    title: 'Guide du Transport combin\u00e9 rail-route',
    date: '2025-05-15',
    category: 'actualite',
    excerpt: "Publication du Guide du Transport combin\u00e9 rail-route par le GNTC, ouvrage de r\u00e9f\u00e9rence pour la fili\u00e8re.",
    content: "<p>Le GNTC publie son Guide du Transport combin\u00e9 rail-route, un ouvrage de r\u00e9f\u00e9rence pr\u00e9sentant l'ensemble de la fili\u00e8re : d\u00e9finition, acteurs, r\u00e9glementation, aides, et perspectives. T\u00e9l\u00e9chargez-le gratuitement.</p>",
    image: '/images/actualites/guide-tc.jpg',
  },
  {
    slug: '80-ans-gntc-transport-combine-france',
    title: '80 ans du GNTC et du transport combin\u00e9 en France',
    date: '2025-05-10',
    category: 'actualite',
    excerpt: "Retour sur 80 ans d'histoire du GNTC et du transport combin\u00e9 en France, de 1945 \u00e0 aujourd'hui.",
    content: "<p>En 2025, le GNTC f\u00eate ses 80 ans. De la cr\u00e9ation du Syndicat National des Transporteurs Mixtes en 1945 \u00e0 aujourd'hui, retour sur huit d\u00e9cennies au service du transport combin\u00e9 en France.</p>",
    image: '/images/actualites/80ans-gntc.png',
  },
  {
    slug: 'capacite-ferroviaire-ressource-strategique',
    title: 'La capacit\u00e9 ferroviaire : une ressource strat\u00e9gique',
    date: '2025-04-20',
    category: 'ferroviaire',
    excerpt: "La capacit\u00e9 ferroviaire est une ressource strat\u00e9gique pour le transport combin\u00e9. Analyse des enjeux de sillons et d'infrastructure.",
    content: "<p>La capacit\u00e9 ferroviaire constitue un enjeu strat\u00e9gique pour le d\u00e9veloppement du transport combin\u00e9. L'acc\u00e8s aux sillons, la qualit\u00e9 de l'infrastructure et les investissements n\u00e9cessaires sont au c\u0153ur des pr\u00e9occupations de la fili\u00e8re.</p>",
    image: '/images/actualites/capacite-ferroviaire.png',
  },
  {
    slug: 'rapport-2025-observatoire-transport-combine',
    title: "Rapport 2025 de l'Observatoire du transport combin\u00e9",
    date: '2025-04-10',
    category: 'actualite',
    excerpt: "La 3\u00e8me \u00e9dition de l'Observatoire du transport combin\u00e9 est parue. Donn\u00e9es de trafics 2024.",
    content: "<p>La 3\u00e8me \u00e9dition de l'Observatoire du transport combin\u00e9 est parue. Ce rapport pr\u00e9sente les donn\u00e9es de trafics 2024, les tendances du march\u00e9 et les perspectives pour la fili\u00e8re.</p>",
    image: '/images/actualites/observatoire-2025.jpg',
  },
  {
    slug: 'rapport-2024-uic-uirr-combine-europeen',
    title: 'Le rapport 2024 UIC-UIRR et le combin\u00e9 europ\u00e9en',
    date: '2025-03-15',
    category: 'ferroviaire',
    excerpt: "Le rapport 2024 UIC-UIRR pr\u00e9sente des chiffres et des donn\u00e9es d\u00e9crivant un combin\u00e9 europ\u00e9en dynamique.",
    content: "<p>Le rapport annuel UIC-UIRR 2024 dresse un panorama du transport combin\u00e9 en Europe. Les donn\u00e9es montrent un secteur dynamique, en croissance, port\u00e9 par les objectifs de d\u00e9carbonation du fret.</p>",
    image: '/images/actualites/uic-uirr-2024.jpg',
  },
  {
    slug: 'transporter-camions-sur-trains',
    title: 'Transporter les camions sur les trains',
    date: '2025-02-20',
    category: 'ferroviaire',
    excerpt: "L'autre d\u00e9fi du transport combin\u00e9 : l'autoroute ferroviaire et le transport de semi-remorques sur wagons sp\u00e9cialis\u00e9s.",
    content: "<p>L'autoroute ferroviaire permet de transporter des semi-remorques compl\u00e8tes sur des wagons surbaiss\u00e9s sp\u00e9cialis\u00e9s. D\u00e9couvrez cette technique et les lignes en op\u00e9ration en France et en Europe.</p>",
    image: '/images/actualites/camions-sur-trains.jpg',
  },
  {
    slug: 'certificats-economies-energie-cee',
    title: "Les Certificats d'\u00c9conomies d'\u00c9nergie (CEE)",
    date: '2025-01-15',
    category: 'actualite',
    excerpt: "Tout savoir sur le dispositif CEE et son application au transport combin\u00e9 : principes, \u00e9ligibilit\u00e9, montants.",
    content: "<p>Le dispositif des Certificats d'\u00c9conomies d'\u00c9nergie (CEE) permet de valoriser le report modal. D\u00e9couvrez les op\u00e9rations \u00e9ligibles, les montants de primes et la proc\u00e9dure \u00e0 suivre.</p>",
    image: '/images/actualites/cee-article.png',
  },

  /* ---- 2024 ---- */
  {
    slug: '2025-annee-bons-augures-combine',
    title: '2025, une ann\u00e9e sous de bons augures pour le combin\u00e9',
    date: '2024-12-20',
    category: 'actualite',
    excerpt: "V\u0153ux 2025 du GNTC : une ann\u00e9e sous de bons augures pour le transport combin\u00e9 en France.",
    content: "<p>Le GNTC adresse ses v\u0153ux pour 2025, une ann\u00e9e qui s'annonce sous de bons augures pour le transport combin\u00e9 avec le renforcement des aides, l'ouverture de nouveaux terminaux et la poursuite de la croissance du trafic.</p>",
    image: '/images/actualites/voeux-2025.jpg',
  },
  {
    slug: 'journee-transport-combine-2024',
    title: 'Journ\u00e9e du Transport Combin\u00e9 2024',
    date: '2024-10-24',
    category: 'evenement',
    excerpt: "Retrouvez la vid\u00e9o de la matin\u00e9e de conf\u00e9rences de la Journ\u00e9e du Transport Combin\u00e9 2024, organis\u00e9e par le GNTC.",
    content: "<p>La Journ\u00e9e du Transport Combin\u00e9 2024 s'est tenue le 24 octobre 2024. Cette matin\u00e9e de conf\u00e9rences a r\u00e9uni l'ensemble des acteurs de la fili\u00e8re pour \u00e9changer sur les enjeux et perspectives du transport combin\u00e9 en France.</p><p>Retrouvez la vid\u00e9o de cette matin\u00e9e de conf\u00e9rences ci-dessous.</p>",
    image: '/images/actualites/journee-tc-2025.png',
    videoId: 'VgEJpVqpw0A',
  },

  /* ---- 2023 ---- */
  {
    slug: 'journee-transport-combine-2023',
    title: 'Journ\u00e9e du Transport Combin\u00e9 2023',
    date: '2023-10-26',
    category: 'evenement',
    excerpt: "Retrouvez en vid\u00e9o l'ensemble de la matin\u00e9e de la Journ\u00e9e du Transport Combin\u00e9 2023.",
    content: "<p>La Journ\u00e9e du Transport Combin\u00e9 2023 s'est d\u00e9roul\u00e9e le 26 octobre 2023. Vous pouvez retrouver en vid\u00e9o l'ensemble de cette matin\u00e9e ci-dessous.</p>",
    videoId: 'wjoksD263PE',
  },
];

export function getArticlesByCategory(cat?: ArticleCategory): Article[] {
  const sorted = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  if (!cat) return sorted;
  return sorted.filter((a) => a.category === cat);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getLatestArticles(n: number): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
}

export const COMBILETTRES = [
  { number: 35, date: 'F\u00e9vrier 2026', title: 'Bilan 2025 et perspectives 2026' },
  { number: 34, date: 'D\u00e9cembre 2025', title: 'Terminal de Dunkerque & SITL 2025' },
  { number: 33, date: 'Octobre 2025', title: "Aide \u00e0 l'exploitation : renouvellement" },
  { number: 32, date: 'Juillet 2025', title: 'Terminal de S\u00e8te & perspectives' },
  { number: 31, date: 'Avril 2025', title: '\u00c9lection du nouveau pr\u00e9sident' },
  { number: 30, date: 'F\u00e9vrier 2025', title: '80 ans du GNTC' },
  { number: 29, date: 'D\u00e9cembre 2024', title: 'Bilan 2024 et SNFF' },
  { number: 28, date: 'Octobre 2024', title: 'CEE et report modal' },
  { number: 27, date: 'Juillet 2024', title: 'Canal Seine-Nord & investissements' },
  { number: 26, date: 'Avril 2024', title: 'Qualit\u00e9 de service ferroviaire' },
  { number: 25, date: 'F\u00e9vrier 2024', title: 'Assembl\u00e9e g\u00e9n\u00e9rale 2024' },
  { number: 24, date: 'D\u00e9cembre 2023', title: 'Bilan 2023' },
];
