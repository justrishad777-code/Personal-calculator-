// Version Update (v28 - Force Cache Clear)
const CACHE_NAME = 'gold-app-v28';

const ASSETS = [
  './',
  './index.html',
  './rate.html',       
  './converter.html',
  './price.html',      
  './casio.html',
  './settings.html',
  './manifest.json',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap',
  'https://fonts.cdnfonts.com/css/digital-7-mono',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install Event (Force Download Fresh Files)
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Activate new version immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching fresh assets for v28...');
      // cache: 'no-cache' ensures it fetches from the network, not the browser's old cache
      let requests = ASSETS.map(url => new Request(url, { cache: 'no-cache' }));
      return cache.addAll(requests);
    })
  );
});

// Activate Event (Delete old cache)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch Event (Network-First for HTML, Cache-First for others)
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;

  // Network-First for HTML files to ensure the latest code is loaded
  if (e.request.mode === 'navigate' || e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(e.request).then((cachedResponse) => {
             return cachedResponse || caches.match('./index.html');
          });
        })
    );
  } else {
    // Cache-First for assets (images, fonts, etc.) for better performance
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
