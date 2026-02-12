import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// We need to run parseExcel but it's TypeScript. Let's do a simplified parse here.
import XLSX from 'xlsx';

const excelPath = process.argv[2];
if (!excelPath) {
  console.error('Usage: node scripts/init-data.mjs <path-to-excel>');
  process.exit(1);
}

console.log('Reading Excel file:', excelPath);
const workbook = XLSX.readFile(excelPath);
console.log('Sheets found:', workbook.SheetNames);

// Geocode dictionary
const GEOCODE = {"Aiton": [45.56, 6.26], "Antwerp Combinant": [51.26, 4.35], "Anvers K730": [51.26, 4.35], "Anvers Main Hub": [51.26, 4.35], "Anvers_1700": [51.26, 4.35], "Anvers_1718": [51.26, 4.35], "Anvers_1742": [51.26, 4.35], "Anvers_869": [51.26, 4.35], "Anvers_913": [51.26, 4.35], "Aproport Châlon sur Saône": [46.78, 4.86], "Aproport Mâcon": [46.3, 4.83], "Arles - C2M": [43.68, 4.63], "Avignon Courtine": [43.95, 4.81], "Basel - Weil am Rhein": [47.59, 7.62], "Bègles (Bordeaux) - Naviland Cargo": [44.79, -0.55], "Bègles (Bordeaux) - Novatrans": [44.79, -0.55], "Bethune conteneurs Terminal": [50.53, 2.64], "Bettembourg": [49.52, 6.1], "Blainville": [48.65, 6.32], "Bonneuil -BTM": [48.77, 2.49], "BONNEUIL Cinérites Transport & Logistique": [48.77, 2.49], "Bonneuil-sur-marne": [48.77, 2.49], "Bordeaux Izon": [44.91, -0.37], "Bruyères-sur-Oise": [49.16, 2.33], "Busto Arsizio-Gallarate": [45.61, 8.85], "Calais - Cargobeamer": [50.95, 1.86], "Calais autoroute ferroviaire": [50.95, 1.86], "Candiolo": [44.96, 7.6], "Cherbourg": [49.63, -1.62], "Clermont Ferrand La Combaude": [45.78, 3.08], "Cognac": [45.69, -0.33], "Domodossola 2 - DB Cargo  Transa": [46.12, 8.29], "Dourges": [50.44, 2.97], "Dunkerque Terminal Des Flandres": [51.01, 2.19], "EUROFOS": [43.39, 4.88], "Fenouillet (Toulouse) - Naviland": [43.67, 1.39], "Fenouillet (Toulouse) -BTM": [43.67, 1.39], "Fos 2XL _ Seayard": [43.42, 4.89], "Fos -Amato": [43.44, 4.94], "Fos Graveleau - Naviland": [43.44, 4.94], "Fos ZSP (Zone de Service Portuaire)": [43.44, 4.94], "Gerzat (Clermont Ferrand)": [45.82, 3.14], "Gevrey (Dijon)": [47.24, 5.01], "Hendaye": [43.36, -1.77], "Karlsruhe": [49.01, 8.4], "Lauterbourg": [48.97, 8.18], "Le Boulou": [42.52, 2.83], "Le Boulou autoroute ferroviaire": [42.52, 2.83], "Le Havre - LHTE": [49.49, 0.28], "Le Havre - Naviland": [49.49, 0.28], "Le Havre - Terminal de France": [49.49, 0.12], "Le Havre Atlantique": [49.49, 0.12], "Lille Conteneurs Terminal": [50.63, 3.07], "Livorno": [43.55, 10.31], "Loire Sur Rhône": [45.57, 4.8], "Lyon Vénissieux": [45.71, 4.88], "Marseille": [43.3, 5.37], "MATSUD - Le Mans": [48.0, 0.2], "Mattrappes - Trappes": [48.77, 2.0], "Mortara": [45.25, 8.74], "Mouguerre - Ambrogio": [43.48, -1.45], "Mouguerre - Brittany Ferries": [43.48, -1.45], "Mouguerre - Novatrans": [43.48, -1.45], "Nancy - Champigneulles": [48.74, 6.16], "Noisy le Sec": [48.89, 2.45], "Novara Boschetto": [45.45, 8.62], "Novara CIM": [45.45, 8.62], "Parma - Castelguelfo": [44.81, 10.33], "Perpignan St Charles": [42.7, 2.9], "Perpignan St Charles PSCCT": [42.7, 2.9], "Port de Gennevilliers": [48.93, 2.29], "Port de Marseille Fos (GPMM)": [43.33, 5.35], "Port Edouard Hérriot (Lyon)": [45.73, 4.84], "Rennes": [48.11, -1.68], "Riom (Clermont Ferrand)": [45.89, 3.11], "Rotterdam": [51.92, 4.48], "Rouen Quevilly": [49.44, 1.09], "San Giuseppe di Cairo": [44.41, 8.26], "Sète": [43.4, 3.7], "Société des Carrières de Voutré": [48.1, -0.44], "St Pierre des Corps (Tours)": [47.39, 0.74], "Terminal à conteneurs TDF - Port de Dunkerque": [51.05, 2.35], "Terminal Clé Sud Exploitation - Miramas": [43.58, 5.0], "Terminal conteneur du Port Metz": [49.12, 6.18], "Terminal conteneurs Nord de Strasbourg": [48.62, 7.74], "Terminal conteneurs Nord de Strasbourg - Naviland": [48.62, 7.74], "Terminal conteneurs Sud de Strasbourg": [48.55, 7.75], "Terminal Ouest Provence - Miramas": [43.58, 5.0], "Valence - Naviland Cargo": [44.87, 4.88], "Valenton - BTM": [48.77, 2.49], "Valenton - Naviland Cargo": [48.77, 2.49], "Valenton - Novatrans": [48.77, 2.49], "Veauche - Combronde": [45.56, 4.28], "Veauche - Naviland": [45.56, 4.28], "Vénissieux - St Priest - Naviland": [45.7, 4.94], "Vénissieux - St Priest - Novatrans": [45.7, 4.94], "Vergèze": [43.74, 4.22], "Vierzon": [47.22, 2.07], "Zeebrugge C. Ro. Terminal": [51.33, 3.18], "Zeebrugge P&O": [51.33, 3.18], "Valenton": [48.77, 2.49], "Antwerp Noordzee Terminal": [51.28, 4.28], "Barcelona APM Terminal": [41.35, 2.15], "Barcelona Hutchinson Ports BEST Terminal": [41.35, 2.15], "Barcelona Port Nou Terminal": [41.35, 2.15], "BARCELONE": [41.35, 2.15], "Bari Ferruccio": [41.12, 16.87], "Borgo San Dalmazzo": [44.33, 7.49], "Domodossola - CargoBeamer": [46.12, 8.29], "Manopello": [42.26, 14.06], "Pomezia": [41.67, 12.5], "Vicenza": [45.55, 11.55]};

function geocode(name) {
  const t = (name || '').trim();
  if (GEOCODE[t]) return GEOCODE[t];
  const lower = t.toLowerCase();
  for (const [key, coords] of Object.entries(GEOCODE)) {
    if (key.toLowerCase() === lower) return coords;
  }
  return null;
}

// Parse Platforms
let platformSheet = null;
for (const name of workbook.SheetNames) {
  if (name.toLowerCase().includes('plateforme') || name.toLowerCase().includes('site')) {
    platformSheet = workbook.Sheets[name];
    console.log('Found platform sheet:', name);
    break;
  }
}

const platforms = [];
const unmatchedSet = new Set();

if (platformSheet) {
  const rows = XLSX.utils.sheet_to_json(platformSheet);
  console.log('Platform rows:', rows.length);
  for (const row of rows) {
    const site = (row['Site'] || '').toString().trim();
    if (!site) continue;
    const coords = geocode(site);
    if (coords) {
      platforms.push({
        site,
        ville: (row['Ville'] || '').toString().trim(),
        exploitant: (row['Exploitant du site'] || '').toString().trim(),
        groupe: (row['Groupe'] || '').toString().trim(),
        departement: (row['Département'] || row['Departement'] || '').toString().trim(),
        pays: (row['Pays'] || '').toString().trim(),
        lat: coords[0],
        lon: coords[1],
        chantierSNCF: (row['Chantier Transport Combiné SNCF Reseau'] || row['Chantier Transport Combiné SNCF Réseau'] || '').toString().toLowerCase() === 'oui',
      });
    } else {
      unmatchedSet.add(site);
    }
  }
}

// Parse Flux
let fluxSheet = null;
for (const name of workbook.SheetNames) {
  if (name.toLowerCase().includes('flux') || name.toLowerCase().includes('base')) {
    fluxSheet = workbook.Sheets[name];
    console.log('Found flux sheet:', name);
    break;
  }
}

const operatorSet = new Set();

// Step 1: Deduplicate by operator + directed pair → take freq once per service
// Each row in Excel = 1 departure day. "Fréquence Hebdo" = total trains/week for that service.
const serviceMap = new Map();

if (fluxSheet) {
  const rows = XLSX.utils.sheet_to_json(fluxSheet);
  console.log('Flux rows:', rows.length);

  for (const row of rows) {
    const fromName = (row['Plateforme Exp'] || '').toString().trim();
    const toName = (row['Plateforme Dest'] || '').toString().trim();
    const operator = (row['Opérateur'] || row['Operateur'] || '').toString().trim();
    const freq = Number(row['Fréquence Hebdo'] || row['Frequence Hebdo'] || 0);

    if (!fromName || !toName) continue;
    if (operator) operatorSet.add(operator);

    const fromCoords = geocode(fromName);
    const toCoords = geocode(toName);

    if (!fromCoords) unmatchedSet.add(fromName);
    if (!toCoords) unmatchedSet.add(toName);
    if (!fromCoords || !toCoords) continue;

    // Key by operator + directed pair (take freq once per service)
    const serviceKey = `${operator}||${fromName}||${toName}`;
    if (!serviceMap.has(serviceKey)) {
      serviceMap.set(serviceKey, {
        from: fromName, to: toName,
        fromCoords, toCoords, operator, freq,
      });
    }
  }
}

// Step 2: Aggregate by platform pair (both directions merged), summing across operators
const routeMap = new Map();
for (const svc of serviceMap.values()) {
  const key = [svc.from, svc.to].sort().join('||');
  if (routeMap.has(key)) {
    const existing = routeMap.get(key);
    existing.freq += svc.freq;
    if (svc.operator) existing.operators.add(svc.operator);
  } else {
    routeMap.set(key, {
      from: svc.from, to: svc.to,
      fromLat: svc.fromCoords[0], fromLon: svc.fromCoords[1],
      toLat: svc.toCoords[0], toLon: svc.toCoords[1],
      freq: svc.freq,
      operators: new Set(svc.operator ? [svc.operator] : []),
    });
  }
}

const routes = Array.from(routeMap.values()).map(r => ({
  ...r,
  operators: Array.from(r.operators),
}));

const data = {
  platforms,
  routes,
  operators: Array.from(operatorSet).sort(),
  unmatchedPlatforms: Array.from(unmatchedSet),
  uploadedAt: new Date().toISOString(),
  fileName: path.basename(excelPath),
};

const outPath = path.join(projectRoot, 'data', 'current.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('\n--- Results ---');
console.log('Platforms:', platforms.length);
console.log('Routes:', routes.length);
console.log('Operators:', data.operators.length);
console.log('Unmatched:', data.unmatchedPlatforms.length);
if (data.unmatchedPlatforms.length > 0) {
  console.log('Unmatched list:', data.unmatchedPlatforms.join(', '));
}
console.log('\nData written to:', outPath);
