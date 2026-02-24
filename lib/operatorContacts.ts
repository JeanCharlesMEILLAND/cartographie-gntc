export interface OperatorContact {
  contact?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Mapping from app operator names to contact info (from Operateurs_GNTC_Contacts.xlsx)
const CONTACTS: Record<string, OperatorContact> = {
  'Ambrogio Intermodal': {
    contact: 'Alberto AMBROGIO',
    address: '14 avenue d\'Alegera, BP 10036, 64990 Mouguerre',
    phone: '+33 5 59 42 63 00',
    email: 'commercial.mg@ambrogiointermodal.com',
    website: 'www.ambrogiointermodal.com',
    logo: '/logos/ambrogio.png',
  },
  'Novatrans': {
    address: '10 rue Vandrezanne, CS 91397, 75634 Paris Cedex 13',
    phone: '+33 1 85 34 49 11',
    email: 'contact.commercial@novatrans.eu',
    website: 'www.novatrans.eu',
    logo: '/logos/novatrans.png',
  },
  'Greenmodal': {
    contact: 'Vincent BELLANGE (Dir. commercial)',
    address: '42 Rue de Ruffi, 13003 Marseille',
    phone: '+33 4 75 00 47 00',
    email: 'contact@novatrans-greenmodal.eu',
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
    address: 'Levallois-Perret (siège)',
    phone: '+33 1 41 05 33 01',
    website: 'www.naviland-cargo.com',
    logo: '/logos/naviland.svg',
  },
  'VIIA': {
    email: 'info@viia.com',
    phone: '+33 4 68 81 56 74',
    website: 'www.viia.com',
    logo: '/logos/viia.png',
  },
  'HUPAC': {
    contact: 'A. Flesch',
    phone: '+41 58 855 81 10',
    email: 'line1@hupac.com',
    website: 'www.hupac.com',
    logo: '/logos/hupac.png',
  },
  'Cargo Beamer': {
    email: 'sales@cargobeamer.com',
    website: 'www.cargobeamer.com',
    logo: '/logos/cargobeamer.svg',
  },
  'DB Cargo France': {
    website: 'www.dbcargo.com/fr',
    logo: '/logos/dbcargo.png',
  },
  'Froidcombi': {
    website: 'froidcombi.fr',
    logo: '/logos/froidcombi.png',
  },
  'Transports Vigneron': {
    email: 'commercial@transports-vigneron.fr',
    phone: '+33 6 12 50 25 02',
    website: 'www.transports-vigneron.fr',
    logo: '/logos/vigneron.png',
  },
  'Combronde': {
    contact: 'J. Baudy',
    address: 'Groupe Combronde',
    phone: '+33 4 73 23 22 92',
    email: 'j.baudy@groupecombronde.com',
    website: 'www.groupecombronde.com',
    logo: '/logos/combronde.png',
  },
  'Be Modal Intermodal Transport': {
    website: 'be-modal-solutions.fr',
    logo: '/logos/bemodal.png',
  },
  'Delta Rail': {
    email: 'contact@deltarail.fr',
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
    website: 'www.brittany-ferries.fr',
    logo: '/logos/brittanyferries.png',
  },
  'Metrocargo italia srl': {
    phone: '+39 010 6520502',
    website: 'www.metrocargoitalia.it',
    logo: '/logos/metrocargo.png',
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
