// ভার্সন আপডেট করা হয়েছে (v27)
const CACHE_NAME = 'gold-app-v27';

const ASSETS = [
  './',
  './index.html',
  './rate.html',       // আমরা ফাইলের নাম rate.html ঠিক করেছি
  './converter.html',
  './price.html',      // <-- নতুন Price Calc পেজ যোগ করা হয়েছে
  './casio.html',
  './settings.html',
  './manifest.json',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap',
  'https://fonts.cdnfonts.com/css/digital-7-mono',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting(); // নতুন ভার্সন সাথে সাথে অ্যাক্টিভ হবে
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets including price.html...');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event (পুরনো ক্যাশ ডিলিট করা)
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
    })
  );
  return self.clients.claim();
});

// Fetch Event (অফলাইন সাপোর্ট)
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
