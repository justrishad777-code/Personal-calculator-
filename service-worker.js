const CACHE_NAME = 'gold-app-v10'; // Bumped version to force update
const ASSETS = [
  './',
  './index.html',
  './rate.html',
  './converter.html',
  './casio.html',
  './settings.html',
  './manifest.json',
  './logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. INSTALL: Cache resources
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE: Cleanup old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. FETCH: The CRITICAL part for installation
// We use a "Stale-While-Revalidate" strategy here.
// It tries to serve from cache fast, but also updates the cache in the background.
self.addEventListener('fetch', (e) => {
  // Only handle http/https requests
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Even if we find it in cache, we kick off a fetch to update it for next time
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Clone response to put in cache
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return networkResponse;
      });

      // Return cached response right away if we have it, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
