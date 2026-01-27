const CACHE_NAME = 'gold-app-v2'; // I changed v1 to v2 to force a fresh update
const ASSETS = [
  './',
  './index.html',
  './rate.html',
  './converter.html',
  './casio.html',
  './settings.html',
  './manifest.json',
  './logo.png',
  // External library you are using
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. INSTALL EVENT
// Caches the files when the app is first loaded
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forces this SW to become active immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all files');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE EVENT (CRITICAL FOR UPDATES)
// Deletes old cache versions so the app doesn't freeze on old code
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Takes control of the page immediately
});

// 3. FETCH EVENT
// Serve from Cache first, then fall back to Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached file if found, otherwise try to fetch from network
      return response || fetch(e.request);
    })
  );
});
