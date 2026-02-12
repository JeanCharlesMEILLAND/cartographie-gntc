import * as XLSX from 'xlsx';
import { Platform, RawFlux, RawPlatform, AggregatedRoute, Service } from './types';
import { geocodePlatform } from './geocode';
import { aggregateRoutes } from './aggregateRoutes';

// Column mapping for "BASE Flux" sheet
const FLUX_COLUMNS: Record<string, keyof RawFlux> = {
  'Opérateur': 'operateur',
  'Operateur': 'operateur',
  'Pays Exp': 'paysExp',
  'Dpt Exp': 'dptExp',
  'Plateforme Exp': 'plateformeExp',
  'Exploitant PF Exp': 'exploitantPFExp',
  'Pays Dest': 'paysDest',
  'Dpt Dest': 'dptDest',
  'Plateforme Dest': 'plateformeDest',
  'Exploitant PF Dest': 'exploitantPFDest',
  'Fréquence Hebdo': 'frequenceHebdo',
  'Frequence Hebdo': 'frequenceHebdo',
  'Jour Départ': 'jourDepart',
  'Jour Depart': 'jourDepart',
  'HLR Départ': 'hlrDepart',
  'HLR Depart': 'hlrDepart',
  'Jour Arrivée': 'jourArrivee',
  'Jour Arrivee': 'jourArrivee',
  'MAD Arrivée': 'madArrivee',
  'MAD Arrivee': 'madArrivee',
  'Accepte caisses mobiles': 'accepteCaissesMobiles',
  'Accepte conteneurs': 'accepteConteneurs',
  'Accepte semi-remorques préhensibles': 'accepteSemiPrehensibles',
  'Accepte semi-remorques prehensibles': 'accepteSemiPrehensibles',
  'Accepte semi-remorques non-préhensibles': 'accepteSemiNonPrehensibles',
  'Accepte semi-remorques non-prehensibles': 'accepteSemiNonPrehensibles',
  'Accepte semi-remorque type P400': 'accepteSemiP400',
  'Commentaires': 'commentaires',
  'Travail': 'travail',
};

// Column mapping for "Plateformes multimodales" sheet
const PLATFORM_COLUMNS: Record<string, keyof RawPlatform> = {
  'Site': 'site',
  'Exploitant du site': 'exploitant',
  'Groupe': 'groupe',
  'Chantier Transport Combiné SNCF Reseau': 'chantierSNCF',
  'Chantier Transport Combiné SNCF Réseau': 'chantierSNCF',
  'Chantier Transport Combine SNCF Reseau': 'chantierSNCF',
  'Département': 'departement',
  'Departement': 'departement',
  'Rue': 'rue',
  'CP': 'cp',
  'Ville': 'ville',
  'Pays': 'pays',
};

function findSheet(workbook: XLSX.WorkBook, candidates: string[]): XLSX.WorkSheet | null {
  for (const name of candidates) {
    if (workbook.Sheets[name]) return workbook.Sheets[name];
  }
  // Try partial match
  for (const sheetName of workbook.SheetNames) {
    const lower = sheetName.toLowerCase();
    for (const candidate of candidates) {
      if (lower.includes(candidate.toLowerCase())) return workbook.Sheets[sheetName];
    }
  }
  return null;
}

function mapRow<T>(row: Record<string, unknown>, mapping: Record<string, keyof T>): Partial<T> {
  const result: Partial<T> = {};
  for (const [excelCol, propName] of Object.entries(mapping)) {
    if (row[excelCol] !== undefined) {
      (result as Record<string, unknown>)[propName as string] = typeof row[excelCol] === 'string'
        ? (row[excelCol] as string).trim()
        : row[excelCol];
    }
  }
  return result;
}

function excelTimeToString(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  // Already a time string like "12:00:00" or "08:30"
  if (typeof value === 'string') {
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    return value;
  }
  // Excel fraction (0.5 = 12:00)
  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  return '';
}

export async function parseTransportExcel(buffer: Buffer): Promise<{
  platforms: Platform[];
  routes: AggregatedRoute[];
  services: Service[];
  operators: string[];
  unmatchedPlatforms: string[];
}> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // 1. Parse Platforms sheet
  const platformSheet = findSheet(workbook, ['Plateformes multimodales', 'Plateformes', 'Sites']);
  const rawPlatforms: RawPlatform[] = [];

  if (platformSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(platformSheet);
    for (const row of rows) {
      const mapped = mapRow<RawPlatform>(row, PLATFORM_COLUMNS);
      if (mapped.site) {
        rawPlatforms.push({
          site: String(mapped.site || '').trim(),
          exploitant: String(mapped.exploitant || '').trim(),
          groupe: String(mapped.groupe || '').trim(),
          chantierSNCF: String(mapped.chantierSNCF || '').trim(),
          departement: String(mapped.departement || '').trim(),
          rue: String(mapped.rue || '').trim(),
          cp: String(mapped.cp || '').trim(),
          ville: String(mapped.ville || '').trim(),
          pays: String(mapped.pays || '').trim(),
        });
      }
    }
  }

  // 2. Parse Flux sheet
  const fluxSheet = findSheet(workbook, ['BASE Flux', 'Flux', 'Base Flux']);
  const rawFluxes: RawFlux[] = [];

  if (fluxSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(fluxSheet);
    for (const row of rows) {
      const mapped = mapRow<RawFlux>(row, FLUX_COLUMNS);
      if (mapped.plateformeExp && mapped.plateformeDest) {
        rawFluxes.push({
          operateur: String(mapped.operateur || '').trim(),
          paysExp: String(mapped.paysExp || '').trim(),
          dptExp: String(mapped.dptExp || '').trim(),
          plateformeExp: String(mapped.plateformeExp || '').trim(),
          exploitantPFExp: String(mapped.exploitantPFExp || '').trim(),
          paysDest: String(mapped.paysDest || '').trim(),
          dptDest: String(mapped.dptDest || '').trim(),
          plateformeDest: String(mapped.plateformeDest || '').trim(),
          exploitantPFDest: String(mapped.exploitantPFDest || '').trim(),
          frequenceHebdo: Number(mapped.frequenceHebdo) || 0,
          jourDepart: String(mapped.jourDepart || '').trim(),
          hlrDepart: String(mapped.hlrDepart || '').trim(),
          jourArrivee: String(mapped.jourArrivee || '').trim(),
          madArrivee: String(mapped.madArrivee || '').trim(),
          accepteCaissesMobiles: String(mapped.accepteCaissesMobiles || '').trim(),
          accepteConteneurs: String(mapped.accepteConteneurs || '').trim(),
          accepteSemiPrehensibles: String(mapped.accepteSemiPrehensibles || '').trim(),
          accepteSemiNonPrehensibles: String(mapped.accepteSemiNonPrehensibles || '').trim(),
          accepteSemiP400: String(mapped.accepteSemiP400 || '').trim(),
          commentaires: String(mapped.commentaires || '').trim(),
          travail: String(mapped.travail || '').trim(),
        });
      }
    }
  }

  // 2b. Build services array (individual train services with schedules)
  // We need the raw mapped values for time fields (before string conversion)
  const rawRows = fluxSheet ? XLSX.utils.sheet_to_json<Record<string, unknown>>(fluxSheet) : [];
  const services: Service[] = rawRows
    .filter((row) => {
      const from = row['Plateforme Exp'];
      const to = row['Plateforme Dest'];
      return from && to;
    })
    .map((row) => ({
      operator: String(row['Opérateur'] || row['Operateur'] || '').trim(),
      from: String(row['Plateforme Exp'] || '').trim(),
      to: String(row['Plateforme Dest'] || '').trim(),
      dayDep: String(row['Jour Départ'] || row['Jour Depart'] || '').trim(),
      timeDep: excelTimeToString(row['HLR Départ'] || row['HLR Depart']),
      dayArr: String(row['Jour Arrivée'] || row['Jour Arrivee'] || '').trim(),
      timeArr: excelTimeToString(row['MAD Arrivée'] || row['MAD Arrivee']),
      acceptsCM: String(row['Accepte caisses mobiles'] || '').trim(),
      acceptsCont: String(row['Accepte conteneurs'] || '').trim(),
      acceptsSemiPre: String(row['Accepte semi-remorques préhensibles'] || row['Accepte semi-remorques prehensibles'] || '').trim(),
      acceptsSemiNon: String(row['Accepte semi-remorques non-préhensibles'] || row['Accepte semi-remorques non-prehensibles'] || '').trim(),
      acceptsP400: String(row['Accepte semi-remorque type P400'] || '').trim(),
    }));

  // 3. Geocode platforms
  const platforms: Platform[] = [];
  const unmatchedFromPlatforms = new Set<string>();

  for (const rp of rawPlatforms) {
    const coords = geocodePlatform(rp.site);
    if (coords) {
      platforms.push({
        site: rp.site,
        ville: rp.ville,
        exploitant: rp.exploitant,
        groupe: rp.groupe,
        departement: rp.departement,
        pays: rp.pays,
        lat: coords[0],
        lon: coords[1],
        chantierSNCF: rp.chantierSNCF?.toLowerCase() === 'oui',
      });
    } else {
      unmatchedFromPlatforms.add(rp.site);
    }
  }

  // 4. Aggregate routes
  const { routes, unmatchedPlatforms: unmatchedFromRoutes } = aggregateRoutes(rawFluxes);

  // 5. Collect all operators
  const operatorSet = new Set<string>();
  for (const flux of rawFluxes) {
    if (flux.operateur) operatorSet.add(flux.operateur);
  }

  // Merge unmatched
  const allUnmatched = new Set<string>();
  unmatchedFromPlatforms.forEach((p) => allUnmatched.add(p));
  unmatchedFromRoutes.forEach((p) => allUnmatched.add(p));

  return {
    platforms,
    routes,
    services,
    operators: Array.from(operatorSet).sort(),
    unmatchedPlatforms: Array.from(allUnmatched),
  };
}
