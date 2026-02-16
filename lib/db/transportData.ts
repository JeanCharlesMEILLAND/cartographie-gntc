import { db } from '@/lib/db';
import { transportData, railGeometries } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { TransportData } from '@/lib/types';

const EMPTY_TRANSPORT_DATA: TransportData = {
  platforms: [],
  routes: [],
  services: [],
  operators: [],
  unmatchedPlatforms: [],
  uploadedAt: '',
  fileName: '',
};

export async function readTransportData(): Promise<TransportData> {
  const rows = await db
    .select()
    .from(transportData)
    .orderBy(desc(transportData.id))
    .limit(1);

  if (rows.length === 0) {
    return EMPTY_TRANSPORT_DATA;
  }

  return rows[0].data as TransportData;
}

export async function writeTransportData(data: TransportData): Promise<void> {
  await db.insert(transportData).values({
    data: data as unknown as Record<string, unknown>,
    fileName: data.fileName,
    uploadedAt: data.uploadedAt ? new Date(data.uploadedAt) : new Date(),
  });
}

type GeometryCache = Record<string, [number, number][]>;

export async function readRailGeometries(): Promise<GeometryCache> {
  const rows = await db
    .select()
    .from(railGeometries)
    .orderBy(desc(railGeometries.id))
    .limit(1);

  if (rows.length === 0) {
    return {};
  }

  return rows[0].data as GeometryCache;
}

export async function writeRailGeometries(data: GeometryCache): Promise<void> {
  const existing = await db
    .select({ id: railGeometries.id })
    .from(railGeometries)
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(railGeometries)
      .set({
        data: data as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(railGeometries.id, existing[0].id));
  } else {
    await db.insert(railGeometries).values({
      data: data as unknown as Record<string, unknown>,
    });
  }
}
