import { NextResponse } from 'next/server';
import { db } from '@cartographie/shared/db';
import { ports } from '@cartographie/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import type { FeatureCollection } from 'geojson';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes max for Overpass

// Verify cron secret or admin auth
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  // Also allow manual trigger from admin (checked via session in admin route)
  if (authHeader === `Bearer ${process.env.ADMIN_SYNC_SECRET || 'admin-sync'}`) return true;
  return false;
}

// ---- Sandre maritime ports ----
const GEOJSON_FORMAT = encodeURIComponent('application/json; subtype=geojson');
const PORTS_URL = `https://services.sandre.eaufrance.fr/geo/pts?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typename=PortMaritime&SRSNAME=EPSG:4326&OUTPUTFORMAT=${GEOJSON_FORMAT}`;

const FRET_EXCLUDED = new Set(['Plaisance', 'Peche', 'Pêche']);

async function syncSandrePorts(): Promise<number> {
  const res = await fetch(PORTS_URL);
  if (!res.ok) throw new Error(`Sandre returned ${res.status}`);
  const fc: FeatureCollection = await res.json();

  let count = 0;
  for (const f of fc.features) {
    const p = f.properties || {};
    const nature = p['MnNaturePort'] || '';
    const activities: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const act = p[`MnActivitePortuaire_${i}`] || '';
      if (act) activities.push(act);
    }
    const hasCommerce = activities.includes('Commerce');

    // Freight filter
    let keep = false;
    if (nature === 'Maritime') keep = hasCommerce;
    else if (nature === 'Fluvial' || nature === 'Fluvio-maritime') {
      if (hasCommerce) keep = true;
      else if (activities.length === 0) keep = true;
      else keep = !activities.every((a) => FRET_EXCLUDED.has(a));
    } else {
      keep = hasCommerce;
    }
    if (!keep) continue;
    if (!f.geometry || f.geometry.type !== 'Point') continue;

    const [lon, lat] = (f.geometry as GeoJSON.Point).coordinates;
    const cdPort = String(p['CdPort'] || '');
    if (!cdPort) continue;

    // Upsert by source + sourceId
    const existing = await db.select({ id: ports.id })
      .from(ports)
      .where(and(eq(ports.source, 'sandre'), eq(ports.sourceId, cdPort)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(ports).set({
        name: p['NomPort'] || 'Port',
        latitude: String(lat),
        longitude: String(lon),
        nature,
        commune: p['LbCommune'] || null,
        gestion: p['MnModeGestionPort'] || null,
        zone: p['NomZonePortuaire'] || null,
        hasCommerce: hasCommerce ? 1 : 0,
        updatedAt: new Date(),
      }).where(eq(ports.id, existing[0].id));
    } else {
      await db.insert(ports).values({
        name: p['NomPort'] || 'Port',
        latitude: String(lat),
        longitude: String(lon),
        nature,
        source: 'sandre',
        sourceId: cdPort,
        commune: p['LbCommune'] || null,
        gestion: p['MnModeGestionPort'] || null,
        zone: p['NomZonePortuaire'] || null,
        hasCommerce: hasCommerce ? 1 : 0,
      });
    }
    count++;
  }
  return count;
}

// ---- Overpass inland ports ----
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OVERPASS_QUERY = `[out:json][timeout:120];area["ISO3166-1"="FR"][admin_level=2]->.fr;(way["industrial"="port"](area.fr);relation["industrial"="port"](area.fr););out center tags;`;

interface OverpassElement {
  type: string;
  id: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function syncOverpassPorts(): Promise<number> {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });
  if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
  const data = await res.json();

  const elements: OverpassElement[] = data.elements || [];
  let count = 0;

  for (const el of elements) {
    if (!el.center) continue;
    const tags = el.tags || {};
    // Skip seaports (already covered by Sandre)
    if (tags['seamark:type']) continue;
    if (tags['port:type'] === 'seaport') continue;

    const osmId = String(el.id);
    const name = tags.name || 'Port fluvial';

    const existing = await db.select({ id: ports.id })
      .from(ports)
      .where(and(eq(ports.source, 'osm'), eq(ports.sourceId, osmId)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(ports).set({
        name,
        latitude: String(el.center.lat),
        longitude: String(el.center.lon),
        operator: tags.operator || null,
        cargo: tags.cargo || null,
        updatedAt: new Date(),
      }).where(eq(ports.id, existing[0].id));
    } else {
      await db.insert(ports).values({
        name,
        latitude: String(el.center.lat),
        longitude: String(el.center.lon),
        nature: 'Fluvial',
        source: 'osm',
        sourceId: osmId,
        operator: tags.operator || null,
        cargo: tags.cargo || null,
        hasCommerce: 1,
      });
    }
    count++;
  }
  return count;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { sandre: 0, overpass: 0, errors: [] as string[] };

  try {
    results.sandre = await syncSandrePorts();
  } catch (err) {
    results.errors.push(`Sandre: ${(err as Error).message}`);
  }

  try {
    results.overpass = await syncOverpassPorts();
  } catch (err) {
    results.errors.push(`Overpass: ${(err as Error).message}`);
  }

  return NextResponse.json({
    ok: true,
    synced: { sandre: results.sandre, overpass: results.overpass },
    errors: results.errors,
    timestamp: new Date().toISOString(),
  });
}
