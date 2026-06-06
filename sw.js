// ඔබ දුන් code එක මෙතැනට ගැලපෙන ලෙස:
const CACHE_NAME = 'kwin-ecard-v38' + Date.now();
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
// 6. Notification එකක් ක්ලික් කළ විට App එක Open කිරීම
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Notification එක අයින් කරන්න

  // App එක දැනටමත් open නම් ඒ tab එකට යන්න, නැත්නම් අලුතින් open කරන්න
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./');
    })
  );
});
