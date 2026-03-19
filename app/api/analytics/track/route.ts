import { NextRequest, NextResponse } from 'next/server';
import { db } from '@cartographie/shared/db';
import { pageViews } from '@cartographie/shared/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function parseUA(ua: string): { browser: string; device: string } {
  let browser = 'Autre';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  let device: string = 'desktop';
  if (/Mobile|Android.*Mobile|iPhone|iPod/.test(ua)) device = 'mobile';
  else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) device = 'tablet';

  return { browser, device };
}

function getGeo(req: NextRequest): { country: string; city: string } {
  const country = req.headers.get('x-vercel-ip-country') || '';
  const city = req.headers.get('x-vercel-ip-city') || '';
  return { country: country.slice(0, 5), city: decodeURIComponent(city).slice(0, 100) };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, app, visitorId, path } = body;

    const today = new Date().toISOString().slice(0, 10);

    if (type === 'pageview') {
      if (!app || !visitorId) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
      const ua = req.headers.get('user-agent') || '';
      const { browser, device } = parseUA(ua);
      const { country, city } = getGeo(req);

      await db.insert(pageViews).values({
        app: app as string,
        day: today,
        visitorId: visitorId as string,
        path: (path as string) || '/',
        country: country || null,
        city: city || null,
        device,
        browser,
        durationSec: 0,
      });
      return NextResponse.json({ ok: true });
    }

    if (type === 'heartbeat') {
      if (!visitorId || !app) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
      const duration = Number(body.duration) || 0;
      await db
        .update(pageViews)
        .set({ durationSec: duration })
        .where(and(eq(pageViews.visitorId, visitorId as string), eq(pageViews.day, today), eq(pageViews.app, app as string)));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Analytics track error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
