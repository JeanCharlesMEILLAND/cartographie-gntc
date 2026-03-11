export interface OperatorContact {
  contact?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Mapping from app operator names to contact info (source: gntc.fr/plan-de-transport – mars 2026)
const CONTACTS: Record<string, OperatorContact> = {
  'Ambrogio Intermodal': {
    contact: 'Alberto AMBROGIO',
    address: '14, avenue d\'Alegera – BP 10036 – 64990 MOUGUERRE',
    phone: '+33 5 59 42 63 00',
    email: 'commercial.mg@ambrogiointermodal.com',
    website: 'www.ambrogiointermodal.com',
    logo: '/logos/ambrogio.png',
  },
  'Novatrans': {
    address: '10, rue Vandrezanne – CS 91397 – 75634 Paris Cedex 13',
    phone: '+33 1 85 34 49 11',
    email: 'contact.commercial@novatrans.eu',
    website: 'www.novatrans.eu',
    logo: '/logos/novatrans.png',
  },
  'Greenmodal': {
    contact: 'Vincent BELLANGE (Dir. commercial)',
    address: '10, rue Vandrezanne – CS 91397 – 75634 Paris Cedex 13',
    phone: '+33 1 85 34 49 11',
    email: 'contact.commercial@novatrans.eu',
    website: 'novatrans-greenmodal.eu',
    logo: '/logos/greenmodal.png',
  },
  'T3M': {
    contact: 'Núria VALMAÑA PI',
    address: '11 Rue Maryse Bastié, ZI de la Lauze, 34430 Saint Jean de Védas',
    phone: '+33 4 67 27 18 51',
    email: 'sales@t3m.fr',
    website: 'www.t3m.fr',
    logo: '/logos/t3m.png',
  },
  'Naviland Cargo': {
    address: '26, Quai Charles Pasqua – 92309 LEVALLOIS PERRET',
    phone: '+33 2 35 25 75 21',
    email: 'booking.national@naviland-cargo.com',
    website: 'www.naviland-cargo.com',
    logo: '/logos/naviland.svg',
  },
  'VIIA': {
    address: '26 quai Charles Pasqua, 92309 LEVALLOIS PERRET Cedex',
    email: 'sales@viia.com',
    phone: '+352 24 87 681',
    website: 'www.viia.com',
    logo: '/logos/viia.png',
  },
  'HUPAC': {
    contact: 'André FLESCH',
    phone: '+41 58 855 87 80',
    email: 'aflesch@hupac.com',
    website: 'www.hupac.com',
    logo: '/logos/hupac.png',
  },
  'Cargo Beamer': {
    contact: 'Christian KAMPF (DG France)',
    email: 'ckampf@cargobeamer.com',
    website: 'www.cargobeamer.fr',
    logo: '/logos/cargobeamer.svg',
  },
  'DB Cargo France': {
    contact: 'Louis-Félix TOURON',
    phone: '+33 6 72 64 74 75',
    email: 'louis-felix.touron@deutschebahn.com',
    website: 'www.dbcargo.com/fr',
    logo: '/logos/dbcargo.png',
  },
  'Froidcombi': {
    contact: 'Rémy CROCHET',
    address: 'Allée des Jardiniers, Z.A. du Barret, 13160 Châteaurenard',
    email: 'contact@froidcombi.fr',
    website: 'froidcombi.fr',
    logo: '/logos/froidcombi.png',
  },
  'Froid Combi': {
    contact: 'Rémy CROCHET',
    address: 'Allée des Jardiniers, Z.A. du Barret, 13160 Châteaurenard',
    email: 'contact@froidcombi.fr',
    website: 'froidcombi.fr',
    logo: '/logos/froidcombi.png',
  },
  'Transports Vigneron': {
    contact: 'Christophe PFUND',
    address: '1135 rue Lavoisier, 54710 LUDRES',
    email: 'commercial@transports-vigneron.fr',
    phone: '+33 6 12 50 25 02',
    website: 'www.transports-vigneron.fr',
    logo: '/logos/vigneron.png',
  },
  'Combronde': {
    contact: 'Jérôme BAUDY',
    address: '2, rue de l\'Industrie – 63360 GERZAT',
    phone: '+33 6 21 90 78 64',
    email: 'j.baudy@groupecombronde.com',
    website: 'www.groupecombronde.com',
    logo: '/logos/combronde.png',
  },
  'Be Modal Intermodal Transport': {
    contact: 'Christophe HUARD',
    address: '21 avenue Chardonnet, 35000 RENNES',
    phone: '+33 2 23 06 05 84',
    email: 'contact@be-modal-solutions.com',
    website: 'be-modal-solutions.fr',
    logo: '/logos/bemodal.png',
  },
  'Delta Rail': {
    contact: 'Kenji JASON',
    email: 'service.client@deltarail.fr',
    phone: '+33 4 42 70 71 80',
    website: 'www.deltarail.fr',
    logo: '/logos/deltarail.png',
  },
  'Cinerites': {
    email: 'contact@cinerites.fr',
    phone: '+33 2 43 75 57 63',
    website: 'www.cinerites.fr',
    logo: '/logos/cinerites.png',
  },
  'Brittany Ferries': {
    contact: 'Jonathan GONORD / Fabrice TURQUET',
    email: 'Jonathan.Gonord@brittany-ferries.fr',
    phone: '+33 7 59 67 88 21',
    website: 'www.brittanyferriesfreight.com',
    logo: '/logos/brittanyferries.png',
  },
  'Metrocargo italia srl': {
    contact: 'Melania MOLINI',
    address: 'Via Operai 8, I-16149 Genova',
    phone: '+39 010 6520502',
    email: 'melania.molini@metrocargoitalia.it',
    website: 'www.metrocargoitalia.it',
    logo: '/logos/metrocargo.png',
  },
  'TP Nova': {
    contact: 'Maylis DE NUCÉ',
    phone: '+33 6 12 14 54 59',
    email: 'mdenuce@tpnova.com',
    website: 'www.tpnova.com',
  },
  'MGE Intermodal': {
    contact: 'Magali FOURRIQUES',
    phone: '+33 3 29 68 10 10',
    email: 'commerce@mge.fr',
    website: 'www.mge.fr',
  },
  'Mercitalia Intermodal': {
    address: 'Via Anton Cechov, 50/2, 20151 Milano, Italy',
    phone: '+39 02 66895.1',
    email: 'sales@mercitaliaintermodal.it',
    website: 'www.mercitaliaintermodal.it',
  },
  'Logi Ports Shuttle': {
    contact: 'Pierre COSSART',
    address: '11 rue du pont V, 76600 Le Havre',
    website: 'www.sogestran-logistics.com',
  },
};

export function getOperatorContact(operator: string): OperatorContact | null {
  return CONTACTS[operator] || null;
}

export function hasContact(operator: string): boolean {
  const c = CONTACTS[operator];
  if (!c) return false;
  return !!(c.email || c.phone || c.website);
}

export function getOperatorLogo(operator: string): string | null {
  return CONTACTS[operator]?.logo || null;
}

/** Returns all operator contacts (for the contacts modal) */
export function getAllContacts(): { operator: string; contact: OperatorContact }[] {
  return Object.entries(CONTACTS)
    // Deduplicate Froidcombi / Froid Combi
    .filter(([name]) => name !== 'Froid Combi')
    .map(([operator, contact]) => ({ operator, contact }))
    .sort((a, b) => a.operator.localeCompare(b.operator, 'fr'));
}
