/** Lightweight analytics tracker — records page views and session duration */

const APP_NAME = 'gntc';

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const stored = sessionStorage.getItem('_vid');
  if (stored) return stored;
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessionStorage.setItem('_vid', id);
  return id;
}

let tracked = false;
let startTime = 0;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

/** Track a page view + start session duration tracking */
export function trackPageView(path?: string) {
  if (typeof window === 'undefined' || tracked) return;
  tracked = true;
  startTime = Date.now();

  const visitorId = getVisitorId();
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'pageview',
      app: APP_NAME,
      visitorId,
      path: path || window.location.pathname,
    }),
  }).catch(() => {});

  // Heartbeat every 30 seconds
  heartbeatInterval = setInterval(() => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'heartbeat',
        app: APP_NAME,
        visitorId: getVisitorId(),
        duration,
      }),
    }).catch(() => {});
  }, 30000);

  window.addEventListener('beforeunload', () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    const duration = Math.round((Date.now() - startTime) / 1000);
    navigator.sendBeacon(
      '/api/analytics/track',
      new Blob(
        [JSON.stringify({ type: 'heartbeat', app: APP_NAME, visitorId: getVisitorId(), duration })],
        { type: 'application/json' }
      )
    );
  });
}
