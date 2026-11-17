/**
 * KrishiSahay PWA Service Worker
 * Version: 2.0.0
 * Provides offline capabilities, shell caching, background revalidation, and offline fallback.
 */

const CACHE_NAME = 'krishisahay-v2.0';

const PRECACHE_URLS = [
  '/',
  '/welcome',
  '/login',
  '/app',
  '/app/dashboard',
  '/app/chat',
  '/app/disease-detection',
  '/app/crop-recommendation',
  '/app/weather',
  '/app/irrigation',
  '/app/fertilizer',
  '/app/market',
  '/app/news',
  '/app/schemes',
  '/app/reports',
  '/app/profile',
  '/app/settings',
  '/offline',
  '/static/css/app.css',
  '/static/js/app.js',
  '/static/js/api.js',
  '/static/js/i18n.js',
  '/static/js/pages.js',
  '/static/manifest.webmanifest',
  '/static/favicon.svg',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/apple-touch-icon.png',
];

// Install: pre-cache application shell and static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Promise.allSettled so one missing non-critical URL doesn't abort the whole precache
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache failed for ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: smart caching strategies depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // 1. Navigation requests (HTML pages) -> Network First with cache fallback and offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('/offline');
          return fallback || new Response(
            '<h1>Offline</h1><p>Please check your internet connection.</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static assets (/static/...) -> Cache First, Network fallback
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. API endpoints -> Network First, stale cache fallback if network fails
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/weather/') ||
    url.pathname.startsWith('/market/') ||
    url.pathname.startsWith('/schemes/') ||
    url.pathname.startsWith('/news/')
  ) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ offline: true, detail: 'Network offline. Using cached data when available.' }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          );
        })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
