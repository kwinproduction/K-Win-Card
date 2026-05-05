// ඔබ දුන් code එක මෙතැනට ගැලපෙන ලෙස:
const CACHE_NAME = 'kwin-ecard-v11' + Date.now();
const ASSETS = [
    './',
    './index.html',
    'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// Install Event - අත්‍යවශ්‍ය ෆයිල් cache කිරීම
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event - පැරණි cache ඉවත් කිරීම
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch Event - Offline වැඩ කිරීමට උදවු වීම
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
