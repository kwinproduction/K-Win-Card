// Version එක අතින් වෙනස් කරන්න (උදා: 1.1 සිට 1.2 ට)
const CACHE_NAME = 'kwin-ecard-v1.1'; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 1. Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('K-Win: Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Event - පැරණි Cache ඉවත් කිරීම
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('K-Win: Deleting old cache...', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event (Network First Strategy)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // අලුත් දත්ත ලැබුණොත් එය Cache එකට දමන්න
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Network නැතිනම් Cache එකෙන් ලබා දෙන්න
        return caches.match(e.request);
      })
  );
});
