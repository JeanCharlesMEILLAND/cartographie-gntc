import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load .env.local
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=["']?([^"']*)["']?$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found. Check .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// ── Seed transport_data ──
const currentJsonPath = path.join(projectRoot, 'data', 'current.json');
if (fs.existsSync(currentJsonPath)) {
  const data = JSON.parse(fs.readFileSync(currentJsonPath, 'utf-8'));
  console.log('Seeding transport_data...');
  console.log(`  Platforms: ${data.platforms?.length || 0}`);
  console.log(`  Routes: ${data.routes?.length || 0}`);
  console.log(`  Services: ${data.services?.length || 0}`);
  console.log(`  Operators: ${data.operators?.length || 0}`);

  await sql`
    INSERT INTO transport_data (data, file_name, uploaded_at, updated_at)
    VALUES (${JSON.stringify(data)}::jsonb, ${data.fileName || 'seed'}, NOW(), NOW())
  `;
  console.log('  -> transport_data seeded.');
} else {
  console.log('No data/current.json found, skipping.');
}

// ── Seed rail_geometries ──
const geoPath = path.join(projectRoot, 'public', 'rail-geometries.json');
if (fs.existsSync(geoPath)) {
  const geoData = JSON.parse(fs.readFileSync(geoPath, 'utf-8'));
  const entryCount = Object.keys(geoData).length;
  console.log(`Seeding rail_geometries (${entryCount} entries)...`);

  await sql`
    INSERT INTO rail_geometries (data, updated_at)
    VALUES (${JSON.stringify(geoData)}::jsonb, NOW())
  `;
  console.log('  -> rail_geometries seeded.');
} else {
  console.log('No public/rail-geometries.json found, skipping.');
}

console.log('\nDone.');
