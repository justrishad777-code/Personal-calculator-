const CACHE_NAME = 'gold-app-offline-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://img.icons8.com/color/48/gold-bars.png',
  'https://img.icons8.com/color/192/gold-bars.png',
  'https://img.icons8.com/color/512/gold-bars.png'
];

// Install Event (Cache Files)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Event (Serve from Cache if Offline)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
