// ভার্সন পরিবর্তন করা হয়েছে যাতে ব্রাউজার নতুন ফাইল নেয়
const CACHE_NAME = 'gold-app-v21';

const ASSETS = [
  './',
  './index.html',
  './rate_new.html',      // নাম পরিবর্তন করা হয়েছে (rate.html -> rate_new.html)
  './converter.html',
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
  // শুধু http/https রিকোয়েস্ট ক্যাশ হবে (chrome-extension বা অন্যান্য স্কিম বাদ)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // যদি ক্যাশে থাকে তবে সেখান থেকে দাও, নাহলে নেটওয়ার্ক থেকে আনো
      return cachedResponse || fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // নতুন ফাইল ক্যাশে সেভ করে রাখো
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // যদি নেটওয়ার্ক না থাকে এবং ক্যাশেও না থাকে (Fallback)
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
