import { TransportData, Platform, AggregatedRoute, Service } from './types';

const SEP = ';';

function escape(val: string | number | boolean | undefined | null): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(SEP) || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: (string | number | boolean | undefined | null)[][]): string {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel FR
  const head = headers.map(escape).join(SEP);
  const body = rows.map((row) => row.map(escape).join(SEP)).join('\n');
  return bom + head + '\n' + body;
}

function download(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPlatforms(platforms: Platform[]) {
  const headers = ['Site', 'Ville', 'Exploitant', 'Groupe', 'Département', 'Pays', 'Latitude', 'Longitude', 'Chantier SNCF'];
  const rows = platforms.map((p) => [
    p.site, p.ville, p.exploitant, p.groupe, p.departement, p.pays, p.lat, p.lon, p.chantierSNCF ? 'Oui' : 'Non',
  ]);
  download(toCsv(headers, rows), `plateformes_${dateTag()}.csv`);
}

export function exportRoutes(routes: AggregatedRoute[]) {
  const headers = ['Départ', 'Destination', 'Fréquence/sem', 'Opérateurs', 'Lat Départ', 'Lon Départ', 'Lat Dest', 'Lon Dest'];
  const rows = routes.map((r) => [
    r.from, r.to, r.freq, r.operators.join(', '), r.fromLat, r.fromLon, r.toLat, r.toLon,
  ]);
  download(toCsv(headers, rows), `liaisons_${dateTag()}.csv`);
}

export function exportServices(services: Service[]) {
  const headers = [
    'Opérateur', 'Départ', 'Destination',
    'Jour Départ', 'Heure Départ', 'Jour Arrivée', 'Heure Arrivée',
    'Caisses Mobiles', 'Conteneurs', 'Semi Préhensibles', 'Semi Non-Préh.', 'P400',
  ];
  const rows = services.map((s) => [
    s.operator, s.from, s.to,
    s.dayDep, s.timeDep, s.dayArr, s.timeArr,
    s.acceptsCM, s.acceptsCont, s.acceptsSemiPre, s.acceptsSemiNon, s.acceptsP400,
  ]);
  download(toCsv(headers, rows), `services_${dateTag()}.csv`);
}

export function exportSynthese(data: TransportData) {
  const totalTrains = data.routes.reduce((s, r) => s + r.freq, 0);
  const headers = ['Indicateur', 'Valeur'];
  const rows: (string | number)[][] = [
    ['Plateformes', data.platforms.length],
    ['Liaisons', data.routes.length],
    ['Services', data.services.length],
    ['Opérateurs', data.operators.length],
    ['Trains/semaine', totalTrains],
    ['Fichier source', data.fileName],
    ['Dernière MAJ', data.uploadedAt],
    ['', ''],
    ['--- Détail par opérateur ---', ''],
  ];

  const opMap = new Map<string, { routes: number; trains: number; services: number; platforms: Set<string> }>();
  for (const r of data.routes) {
    for (const op of r.operators) {
      if (!opMap.has(op)) opMap.set(op, { routes: 0, trains: 0, services: 0, platforms: new Set() });
      const o = opMap.get(op)!;
      o.routes++;
      o.trains += r.freq;
      o.platforms.add(r.from);
      o.platforms.add(r.to);
    }
  }
  for (const s of data.services) {
    const o = opMap.get(s.operator);
    if (o) o.services++;
  }

  rows.push(['Opérateur', 'Plateformes', 'Liaisons', 'Trains/sem', 'Services'] as unknown as (string | number)[]);
  for (const [op, stats] of [...opMap.entries()].sort((a, b) => b[1].trains - a[1].trains)) {
    rows.push([op, stats.platforms.size, stats.routes, stats.trains, stats.services]);
  }

  download(toCsv(headers, rows), `synthese_transport_combine_${dateTag()}.csv`);
}

function dateTag(): string {
  return new Date().toISOString().slice(0, 10);
}
