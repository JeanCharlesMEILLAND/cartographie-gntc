/* ------------------------------------------------------------------ */
/*  Données des actualités (simulées en attendant le CMS/MDX)         */
/* ------------------------------------------------------------------ */

export type ArticleCategory = 'actualite' | 'communique' | 'ferroviaire' | 'vie-adherents' | 'evenement';

export interface Article {
  slug: string;
  title: string;
  date: string;       // YYYY-MM-DD
  category: ArticleCategory;
  excerpt: string;
  content: string;     // HTML content (simplified)
  image?: string;
}

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  actualite: 'Actualité',
  communique: 'Communiqué',
  ferroviaire: 'Ferroviaire',
  'vie-adherents': 'Vie des adhérents',
  evenement: 'Événement',
};

export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  actualite: '#3b82f6',
  communique: '#8b5cf6',
  ferroviaire: '#ef4444',
  'vie-adherents': '#10b981',
  evenement: '#f59e0b',
};

export const ARTICLES: Article[] = [
  {
    slug: 'inauguration-terminal-dunkerque-2025',
    title: 'Inauguration du nouveau terminal multimodal de Dunkerque',
    date: '2025-11-15',
    category: 'actualite',
    excerpt: 'Le port de Dunkerque inaugure son nouveau terminal multimodal d\'un investissement de 25 millions d\'euros, renforçant la capacité du transport combiné dans les Hauts-de-France.',
    content: `<p>Le 15 novembre 2025, le Grand Port Maritime de Dunkerque a inauguré son nouveau terminal multimodal, un investissement majeur de 25 millions d'euros qui marque une étape importante pour le transport combiné dans le nord de la France.</p>
<p>Ce terminal, d'une capacité de 100 000 UTI par an, permettra de connecter le port aux principaux corridors ferroviaires européens. Il dispose de 3 voies de 750 mètres et d'équipements de manutention dernière génération.</p>
<p>Rémy Crochet, président du GNTC, a salué "un investissement stratégique qui démontre la confiance de la filière dans l'avenir du transport combiné".</p>`,
  },
  {
    slug: 'aide-exploitation-47m-2025',
    title: 'Aide à l\'exploitation maintenue à 47 M\u20ac/an pour 2025-2027',
    date: '2025-10-02',
    category: 'communique',
    excerpt: 'Le gouvernement confirme le maintien de l\'aide à l\'exploitation du transport combiné à 47 millions d\'euros par an pour la période 2025-2027.',
    content: `<p>Le Ministère des Transports a confirmé le 2 octobre 2025 le maintien de l'aide à l'exploitation du transport combiné à hauteur de 47 millions d'euros par an pour la période triennale 2025-2027.</p>
<p>Cette aide, dite "aide à la pince", est essentielle pour compenser le différentiel de coût entre le transport combiné et le tout-routier. Elle permet aux opérateurs de proposer des tarifs compétitifs aux chargeurs.</p>
<p>Le GNTC se félicite de cette décision qui apporte la visibilité nécessaire aux investissements de la filière.</p>`,
  },
  {
    slug: 'sitl-2025-bilan',
    title: 'Retour sur le SITL 2025 : le transport combiné à l\'honneur',
    date: '2025-06-20',
    category: 'evenement',
    excerpt: 'Le GNTC était présent au SITL 2025 avec un stand dédié et plusieurs conférences sur l\'avenir du transport combiné.',
    content: `<p>Le Salon International du Transport et de la Logistique (SITL) 2025 a été un succès pour la filière du transport combiné. Le GNTC y tenait un stand où les visiteurs pouvaient découvrir la carte interactive du réseau.</p>
<p>Plusieurs conférences ont mis en lumière les enjeux du secteur : décarbonation du fret, digitalisation, et objectifs de la SNFF. Plus de 200 contacts ont été établis durant les 3 jours du salon.</p>`,
  },
  {
    slug: 'snff-objectif-2030',
    title: 'SNFF : le doublement du fret ferroviaire en bonne voie',
    date: '2025-05-10',
    category: 'ferroviaire',
    excerpt: 'La Stratégie Nationale Fret Ferroviaire affiche des résultats encourageants avec une croissance de 15% du trafic combiné depuis 2022.',
    content: `<p>La Stratégie Nationale Fret Ferroviaire (SNFF), lancée en 2021, vise un doublement de la part modale du fret ferroviaire d'ici 2030. Les dernières données montrent une croissance de 15% du trafic de transport combiné entre 2022 et 2024.</p>
<p>Cette dynamique est portée par le renforcement des aides publiques, l'ouverture de nouveaux terminaux et la montée en puissance de plusieurs opérateurs. Le GNTC estime que l'objectif de doublement est atteignable si les investissements se poursuivent.</p>`,
  },
  {
    slug: 'terminal-sete-inauguration',
    title: 'Le terminal multimodal de Sète entre en service',
    date: '2025-04-08',
    category: 'actualite',
    excerpt: 'Après 3 ans de travaux, le nouveau terminal multimodal de Sète (20 M\u20ac) ouvre ses portes, connectant le port méditerranéen au réseau ferroviaire.',
    content: `<p>Le nouveau terminal multimodal de Sète, fruit d'un investissement de 20 millions d'euros, est officiellement entré en service le 8 avril 2025. Cette infrastructure connecte le port méditerranéen au réseau ferroviaire national.</p>
<p>D'une capacité initiale de 50 000 UTI par an, le terminal est dimensionné pour monter en puissance avec la croissance du trafic méditerranéen. Il constitue un maillon essentiel du corridor transpyrénéen.</p>`,
  },
  {
    slug: 'election-remy-crochet-president',
    title: 'Rémy Crochet élu président du GNTC',
    date: '2024-12-12',
    category: 'vie-adherents',
    excerpt: 'Rémy Crochet (Froidcombi) est élu à la présidence du GNTC lors de l\'assemblée générale du 12 décembre 2024.',
    content: `<p>Lors de l'assemblée générale du GNTC tenue le 12 décembre 2024, Rémy Crochet, dirigeant de Froidcombi, a été élu président du Groupement National des Transports Combinés.</p>
<p>Il succède à Ivan Stempezynski qui avait assuré la présidence durant les années précédentes. Rémy Crochet a exprimé sa volonté de "poursuivre la dynamique de croissance du transport combiné et renforcer le dialogue avec les pouvoirs publics".</p>`,
  },
  {
    slug: 'trains-1500m-experimentation',
    title: 'Expérimentation de trains de 1 500 mètres pour le combiné',
    date: '2024-09-15',
    category: 'ferroviaire',
    excerpt: 'SNCF Réseau lance une expérimentation de trains de 1 500 mètres sur l\'axe Nord-Sud, doublant la capacité par convoi.',
    content: `<p>SNCF Réseau a annoncé le lancement d'une expérimentation de trains de 1 500 mètres sur l'axe Paris-Lyon-Marseille, principalement pour le transport combiné. Cette longueur, qui double la capacité actuelle des trains de 750 mètres, pourrait révolutionner l'économie du secteur.</p>
<p>Les premiers essais sont prévus pour le premier semestre 2025. Le GNTC soutient activement cette démarche qui permettrait de réduire significativement le coût par UTI transportée.</p>`,
  },
  {
    slug: 'cartographie-numerique-gntc',
    title: 'Le GNTC lance sa cartographie numérique interactive',
    date: '2026-01-20',
    category: 'actualite',
    excerpt: 'Le GNTC dévoile sa nouvelle cartographie interactive du réseau de transport combiné en France, un outil digital inédit pour la filière.',
    content: `<p>Le GNTC entre dans l'ère numérique avec le lancement de sa cartographie interactive du réseau de transport combiné. Cet outil, développé en partenariat avec des experts du digital, permet de visualiser l'ensemble des liaisons, plateformes et opérateurs en temps réel.</p>
<p>La carte offre des fonctionnalités de recherche d'itinéraires, de calcul d'empreinte carbone et de mise en relation avec les opérateurs. Elle sera présentée au SITL 2026.</p>`,
  },
  {
    slug: 'combilettre-35-publication',
    title: 'COMBILETTRE n°35 : Bilan 2025 et perspectives',
    date: '2026-02-01',
    category: 'communique',
    excerpt: 'Le dernier numéro de la COMBILETTRE dresse le bilan d\'une année 2025 record pour le transport combiné en France.',
    content: `<p>La COMBILETTRE n°35, publiée en février 2026, présente un bilan détaillé de l'année 2025, marquée par l'inauguration de deux terminaux majeurs (Dunkerque et Sète) et une croissance soutenue du trafic.</p>
<p>Au sommaire : interview du président Rémy Crochet, chiffres clés 2025, zoom sur les nouveaux services lancés par les opérateurs, et calendrier des événements 2026.</p>`,
  },
  {
    slug: 'canal-seine-nord-avancement',
    title: 'Canal Seine-Nord Europe : les travaux avancent',
    date: '2025-08-22',
    category: 'actualite',
    excerpt: 'Le chantier du Canal Seine-Nord Europe progresse avec la phase de terrassement principal. Mise en service prévue pour 2030.',
    content: `<p>Les travaux du Canal Seine-Nord Europe, le plus grand chantier d'infrastructure de transport en France, avancent selon le calendrier prévu. La phase de terrassement principal est en cours sur les 107 km du tracé.</p>
<p>Ce canal à grand gabarit reliera l'Oise au réseau des canaux du Nord de l'Europe, ouvrant un corridor fluvial majeur pour le transport combiné. Le GNTC suit de près ce dossier stratégique pour la filière.</p>`,
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
  { number: 33, date: 'Octobre 2025', title: 'Aide \u00e0 l\u2019exploitation : renouvellement' },
  { number: 32, date: 'Juillet 2025', title: 'Terminal de S\u00e8te & trains 1500m' },
  { number: 31, date: 'Avril 2025', title: '\u00c9lection du nouveau pr\u00e9sident' },
  { number: 30, date: 'F\u00e9vrier 2025', title: '80 ans du GNTC' },
  { number: 29, date: 'D\u00e9cembre 2024', title: 'Bilan 2024 et SNFF' },
  { number: 28, date: 'Octobre 2024', title: 'CEE et report modal' },
  { number: 27, date: 'Juillet 2024', title: 'Canal Seine-Nord & investissements' },
  { number: 26, date: 'Avril 2024', title: 'Qualit\u00e9 de service ferroviaire' },
  { number: 25, date: 'F\u00e9vrier 2024', title: 'Assembl\u00e9e g\u00e9n\u00e9rale 2024' },
  { number: 24, date: 'D\u00e9cembre 2023', title: 'Bilan 2023' },
];
