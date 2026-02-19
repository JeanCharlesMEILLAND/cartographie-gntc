import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL);

// 1. Create ports table
console.log('Creating ports table...');
await sql`
  CREATE TABLE IF NOT EXISTS ports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    latitude TEXT NOT NULL,
    longitude TEXT NOT NULL,
    nature VARCHAR(50),
    source VARCHAR(20) NOT NULL,
    source_id VARCHAR(100),
    commune VARCHAR(255),
    operator VARCHAR(255),
    gestion VARCHAR(255),
    zone VARCHAR(255),
    cargo VARCHAR(255),
    has_commerce INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
  )
`;
console.log('Table ports created.');

// 2. Seed inland ports from static GeoJSON
console.log('Seeding inland ports from static file...');
const geojsonPath = join(__dirname, '..', 'public', 'data', 'inland-ports.geojson');
const geojson = JSON.parse(readFileSync(geojsonPath, 'utf-8'));

let inlandCount = 0;
for (const f of geojson.features) {
  const [lon, lat] = f.geometry.coordinates;
  const p = f.properties || {};
  await sql`
    INSERT INTO ports (name, latitude, longitude, nature, source, source_id, operator, cargo, has_commerce, visible)
    VALUES (
      ${p.name || 'Port fluvial'},
      ${String(lat)},
      ${String(lon)},
      ${'Fluvial'},
      ${'osm'},
      ${p.osmId ? String(p.osmId) : null},
      ${p.operator || null},
      ${p.cargo || null},
      ${1},
      ${1}
    )
    ON CONFLICT DO NOTHING
  `;
  inlandCount++;
}
console.log(`Seeded ${inlandCount} inland ports.`);

// 3. Seed maritime ports from Sandre
console.log('Fetching Sandre maritime ports...');
const GEOJSON_FORMAT = encodeURIComponent('application/json; subtype=geojson');
const PORTS_URL = `https://services.sandre.eaufrance.fr/geo/pts?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=PortMaritime&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

try {
  const res = await fetch(PORTS_URL);
  if (!res.ok) throw new Error(`Sandre returned ${res.status}`);
  const fc = await res.json();

  const fretExcluded = new Set(['Plaisance', 'Peche', 'Pêche']);
  let maritimeCount = 0;

  for (const f of fc.features) {
    const p = f.properties || {};
    const nature = p['MnNaturePort'] || '';
    const activities = [];
    for (let i = 1; i <= 6; i++) {
      const act = p[`MnActivitePortuaire_${i}`] || '';
      if (act) activities.push(act);
    }
    const hasCommerce = activities.includes('Commerce');

    // Same freight filter as before
    let keep = false;
    if (nature === 'Maritime') keep = hasCommerce;
    else if (nature === 'Fluvial' || nature === 'Fluvio-maritime') {
      if (hasCommerce) keep = true;
      else if (activities.length === 0) keep = true;
      else keep = !activities.every(a => fretExcluded.has(a));
    } else {
      keep = hasCommerce;
    }

    if (!keep) continue;
    if (!f.geometry || f.geometry.type !== 'Point') continue;

    const [lon, lat] = f.geometry.coordinates;
    const cdPort = p['CdPort'] || '';

    await sql`
      INSERT INTO ports (name, latitude, longitude, nature, source, source_id, commune, gestion, zone, has_commerce, visible)
      VALUES (
        ${p['NomPort'] || 'Port'},
        ${String(lat)},
        ${String(lon)},
        ${nature},
        ${'sandre'},
        ${cdPort ? String(cdPort) : null},
        ${p['LbCommune'] || null},
        ${p['MnModeGestionPort'] || null},
        ${p['NomZonePortuaire'] || null},
        ${hasCommerce ? 1 : 0},
        ${1}
      )
      ON CONFLICT DO NOTHING
    `;
    maritimeCount++;
  }
  console.log(`Seeded ${maritimeCount} maritime ports from Sandre.`);
} catch (err) {
  console.error('Failed to fetch Sandre ports:', err.message);
}

console.log('Migration complete!');
