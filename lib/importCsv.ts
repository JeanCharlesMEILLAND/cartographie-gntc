import { Service } from './types';

export interface CsvImportResult {
  services: Service[];
  errors: string[];
  skipped: number;
}

const DAY_ALIASES: Record<string, string> = {
  lundi: 'Lu', lu: 'Lu', lun: 'Lu',
  mardi: 'Ma', ma: 'Ma', mar: 'Ma',
  mercredi: 'Me', me: 'Me', mer: 'Me',
  jeudi: 'Je', je: 'Je', jeu: 'Je',
  vendredi: 'Ve', ve: 'Ve', ven: 'Ve',
  samedi: 'Sa', sa: 'Sa', sam: 'Sa',
  dimanche: 'Di', di: 'Di', dim: 'Di',
};

function normalizeDay(raw: string): string {
  const trimmed = raw.trim();
  return DAY_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function normalizeTime(raw: string): string {
  const trimmed = raw.trim().replace(/[hH]/, ':');
  if (/^\d{3,4}$/.test(trimmed)) {
    // "0830" → "08:30"
    const padded = trimmed.padStart(4, '0');
    return `${padded.slice(0, 2)}:${padded.slice(2)}`;
  }
  return trimmed;
}

function normalizeYesNo(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (lower === 'oui' || lower === 'o' || lower === 'yes' || lower === 'y' || lower === '1') return 'Oui';
  if (lower === 'non' || lower === 'n' || lower === 'no' || lower === '0' || lower === '') return 'Non';
  return 'Non';
}

/** Parse a CSV string (semicolon or comma separated) into Service objects.
 *  If defaultOperator is provided, the "Opérateur" column becomes optional. */
export function parseCsvServices(csvText: string, defaultOperator?: string): CsvImportResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { services: [], errors: ['Fichier vide ou sans données'], skipped: 0 };
  }

  // Auto-detect separator
  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/^"(.*)"$/, '$1').toLowerCase());

  // Map headers to field names
  const colMap: Record<string, number> = {};
  const aliases: Record<string, string[]> = {
    operator: ['opérateur', 'operateur', 'operator', 'op'],
    from: ['départ', 'depart', 'from', 'origine', 'plateforme exp', 'plateformeexp'],
    to: ['destination', 'to', 'dest', 'arrivée', 'arrivee', 'plateforme dest', 'plateformedest'],
    dayDep: ['jour départ', 'jour depart', 'jourdep', 'j.dép', 'j.dep', 'jour dép'],
    timeDep: ['heure départ', 'heure depart', 'hlr', 'timedep', 'heure dép'],
    dayArr: ['jour arrivée', 'jour arrivee', 'jourarr', 'j.arr', 'jour arr'],
    timeArr: ['heure arrivée', 'heure arrivee', 'mad', 'timearr', 'heure arr'],
    acceptsCM: ['cm', 'caisses mobiles', 'caissesmobiles'],
    acceptsCont: ['cont', 'conteneurs', 'containers'],
    acceptsSemiPre: ['s.pr', 'semi préhensibles', 'semipre', 'semi préh', 'semi prehensibles'],
    acceptsSemiNon: ['s.np', 'semi non-préh', 'seminon', 'semi non-prehensibles', 'semi non préhensibles'],
    acceptsP400: ['p400'],
  };

  for (const [field, names] of Object.entries(aliases)) {
    const idx = headers.findIndex((h) => names.includes(h));
    if (idx !== -1) colMap[field] = idx;
  }

  const errors: string[] = [];
  const services: Service[] = [];
  let skipped = 0;

  // Check required fields
  if (colMap.operator === undefined && !defaultOperator) errors.push('Colonne "Opérateur" non trouvée');
  if (colMap.from === undefined) errors.push('Colonne "Départ" non trouvée');
  if (colMap.to === undefined) errors.push('Colonne "Destination" non trouvée');

  if (errors.length > 0) return { services: [], errors, skipped: 0 };

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(sep).map((c) => c.trim().replace(/^"(.*)"$/, '$1'));

    const operator = colMap.operator !== undefined ? cells[colMap.operator]?.trim() : defaultOperator;
    const from = cells[colMap.from]?.trim();
    const to = cells[colMap.to]?.trim();

    if (!operator || !from || !to) {
      skipped++;
      continue;
    }

    services.push({
      operator,
      from,
      to,
      dayDep: colMap.dayDep !== undefined ? normalizeDay(cells[colMap.dayDep] || '') : '',
      timeDep: colMap.timeDep !== undefined ? normalizeTime(cells[colMap.timeDep] || '') : '',
      dayArr: colMap.dayArr !== undefined ? normalizeDay(cells[colMap.dayArr] || '') : '',
      timeArr: colMap.timeArr !== undefined ? normalizeTime(cells[colMap.timeArr] || '') : '',
      acceptsCM: normalizeYesNo(colMap.acceptsCM !== undefined ? cells[colMap.acceptsCM] || '' : ''),
      acceptsCont: normalizeYesNo(colMap.acceptsCont !== undefined ? cells[colMap.acceptsCont] || '' : ''),
      acceptsSemiPre: normalizeYesNo(colMap.acceptsSemiPre !== undefined ? cells[colMap.acceptsSemiPre] || '' : ''),
      acceptsSemiNon: normalizeYesNo(colMap.acceptsSemiNon !== undefined ? cells[colMap.acceptsSemiNon] || '' : ''),
      acceptsP400: normalizeYesNo(colMap.acceptsP400 !== undefined ? cells[colMap.acceptsP400] || '' : ''),
    });
  }

  return { services, errors, skipped };
}
