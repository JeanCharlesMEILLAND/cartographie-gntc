import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { transportDataSchema, parseBody } from '@/lib/validations';
import { readTransportData, writeTransportData } from '@/lib/db/transportData';

interface ServiceRecord {
  operator: string;
  from: string;
  to: string;
  dayDep: string;
  timeDep: string;
  dayArr: string;
  timeArr: string;
  [key: string]: string;
}

function serviceKey(s: ServiceRecord) {
  return `${s.operator}||${s.from}||${s.to}||${s.dayDep}||${s.timeDep}`;
}

interface PlatformRecord {
  site: string;
  lat: number;
  lon: number;
  [key: string]: unknown;
}

interface RouteRecord {
  from: string;
  to: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  freq: number;
  operators: string[];
}

function rebuildRoutes(services: ServiceRecord[], platforms: PlatformRecord[]): RouteRecord[] {
  const coordMap = new Map<string, { lat: number; lon: number }>();
  for (const p of platforms) {
    if (p.lat && p.lon) coordMap.set(p.site, { lat: p.lat, lon: p.lon });
  }

  // Group services by sorted site pair
  const pairMap = new Map<string, { from: string; to: string; operators: Set<string>; freq: number }>();
  for (const s of services) {
    if (!s.from || !s.to || s.from === s.to) continue;
    const key = [s.from, s.to].sort().join('||');
    let entry = pairMap.get(key);
    if (!entry) {
      const [a, b] = key.split('||');
      entry = { from: a, to: b, operators: new Set(), freq: 0 };
      pairMap.set(key, entry);
    }
    if (s.operator) entry.operators.add(s.operator);
    entry.freq++;
  }

  const routes: RouteRecord[] = [];
  for (const entry of pairMap.values()) {
    const c1 = coordMap.get(entry.from);
    const c2 = coordMap.get(entry.to);
    if (!c1 || !c2) continue;
    routes.push({
      from: entry.from,
      to: entry.to,
      fromLat: c1.lat,
      fromLon: c1.lon,
      toLat: c2.lat,
      toLon: c2.lon,
      freq: entry.freq,
      operators: Array.from(entry.operators),
    });
  }
  return routes;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>)?.role as string;
  const userOperator = (session.user as Record<string, unknown>)?.operator as string | undefined;
  const userId = (session.user as Record<string, unknown>)?.id as string | undefined;
  const userName = session.user?.name || session.user?.email || 'inconnu';

  try {
    const raw = await request.json();
    const parsed = parseBody(transportDataSchema, raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const data = parsed.data;

    const oldData = await readTransportData();
    const hasOldData = oldData.uploadedAt !== '';

    // Operator scope validation: only allow modifying own services
    if (role === 'operator' && userOperator && hasOldData) {
      // Operators can add new platforms but not modify/delete existing ones
      const serverSites = new Set((oldData.platforms as { site: string }[]).map((p) => p.site));
      const newPlatforms = data.platforms.filter((p) => !serverSites.has(p.site));
      data.platforms = [...(oldData.platforms as typeof data.platforms), ...newPlatforms];

      // Operators can only modify their own services:
      // keep their services from the client, force all others from the server
      const myServices = data.services.filter(
        (s) => s.operator === userOperator
      );
      const otherServices = (oldData.services as unknown as ServiceRecord[]).filter(
        (s) => s.operator !== userOperator
      );
      data.services = [...otherServices, ...myServices] as typeof data.services;
    }

    // Recompute operators list from actual services to keep it in sync
    const operatorSet = new Set<string>();
    for (const s of data.services) {
      if (s.operator) operatorSet.add(s.operator);
    }
    data.operators = Array.from(operatorSet).sort();

    // Rebuild routes from merged services to ensure consistency
    data.routes = rebuildRoutes(data.services, data.platforms);

    // Compute audit diffs before saving
    if (hasOldData) {
      try {
        await writeAuditLogs(oldData.services as unknown as ServiceRecord[], data.services, userId, userName);
      } catch {
        // Audit logging failure should not block the save
      }
    }

    await writeTransportData(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 });
  }
}

async function writeAuditLogs(
  oldServices: ServiceRecord[],
  newServices: ServiceRecord[],
  userId: string | undefined,
  userName: string
) {
  const oldMap = new Map<string, ServiceRecord>();
  for (const s of oldServices) {
    oldMap.set(serviceKey(s), s);
  }

  const newMap = new Map<string, ServiceRecord>();
  for (const s of newServices) {
    newMap.set(serviceKey(s), s);
  }

  const entries: {
    userId: number | null;
    userName: string;
    action: string;
    tableName: string;
    recordId: string;
    oldValue: string | null;
    newValue: string | null;
  }[] = [];

  const uid = userId ? parseInt(userId) : null;

  // Detect new services (in new but not in old)
  for (const [key, s] of newMap) {
    if (!oldMap.has(key)) {
      entries.push({
        userId: uid,
        userName,
        action: 'create',
        tableName: 'services',
        recordId: `${s.operator}: ${s.from} → ${s.to} (${s.dayDep})`,
        oldValue: null,
        newValue: JSON.stringify(s),
      });
    }
  }

  // Detect deleted services (in old but not in new)
  for (const [key, s] of oldMap) {
    if (!newMap.has(key)) {
      entries.push({
        userId: uid,
        userName,
        action: 'delete',
        tableName: 'services',
        recordId: `${s.operator}: ${s.from} → ${s.to} (${s.dayDep})`,
        oldValue: JSON.stringify(s),
        newValue: null,
      });
    }
  }

  // Detect modified services (same key, different content)
  for (const [key, newS] of newMap) {
    const oldS = oldMap.get(key);
    if (oldS && JSON.stringify(oldS) !== JSON.stringify(newS)) {
      entries.push({
        userId: uid,
        userName,
        action: 'update',
        tableName: 'services',
        recordId: `${newS.operator}: ${newS.from} → ${newS.to} (${newS.dayDep})`,
        oldValue: JSON.stringify(oldS),
        newValue: JSON.stringify(newS),
      });
    }
  }

  // Batch insert (max 50 entries to avoid issues)
  if (entries.length > 0) {
    await db.insert(auditLog).values(entries.slice(0, 50));
  }
}
