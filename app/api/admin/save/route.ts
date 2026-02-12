import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import fs from 'fs';
import path from 'path';

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
    const data = await request.json();
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'current.json');

    let oldData: { services: ServiceRecord[]; platforms: unknown[] } | null = null;
    if (fs.existsSync(filePath)) {
      oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Operator scope validation: only allow modifying own services
    if (role === 'operator' && userOperator && oldData) {
      // Check platforms unchanged
      if (JSON.stringify(oldData.platforms) !== JSON.stringify(data.platforms)) {
        return NextResponse.json({ error: 'Non autorisé: modification des plateformes interdite' }, { status: 403 });
      }

      // Check other operators' services unchanged
      const otherServicesOld = oldData.services.filter(
        (s: ServiceRecord) => s.operator !== userOperator
      );
      const otherServicesNew = data.services.filter(
        (s: ServiceRecord) => s.operator !== userOperator
      );
      if (JSON.stringify(otherServicesOld) !== JSON.stringify(otherServicesNew)) {
        return NextResponse.json({ error: 'Non autorisé: modification hors périmètre' }, { status: 403 });
      }
    }

    // Compute audit diffs before saving
    if (oldData) {
      try {
        await writeAuditLogs(oldData.services, data.services, userId, userName);
      } catch {
        // Audit logging failure should not block the save
      }
    }

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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
