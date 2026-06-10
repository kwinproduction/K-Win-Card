// 1. Version එක (මෙහි අංකය වෙනස් කළ විට පමණක් පරණ Cache එක මැකේ - Date.now දාන්න එපා)
const CACHE_VERSION = 'v44'; 
const CACHE_NAME = `kwin-ecard-${CACHE_VERSION}`;

const ASSETS = [
    './',
    './index.html',
    'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// Install Event - අත්‍යවශ්‍ය ෆයිල් cache කිරීම
self.addEventListener('install', (e) => {
    console.log('K-Win Service Worker: Installing...');
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event - පැරණි cache ඉවත් කිරීම
self.addEventListener('activate', (e) => {
    console.log('K-Win Service Worker: Activated');
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('K-Win Service Worker: Deleting Old Cache...', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event - Offline වැඩ කිරීමට සහ API requests බේරීමට
self.addEventListener('fetch', (e) => {
    // 💡 Supabase, OneSignal වැනි Live API Requests Cache කිරීමෙන් වැළකීම (මෙය අනිවාර්යයි)
    if (e.request.url.includes('supabase.co') || e.request.url.includes('onesignal.com')) {
        e.respondWith(fetch(e.request));
        return; 
    }

    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        }).catch(() => {
            return caches.match('./index.html');
        })
    );
});

// Notification Click Event - Notification එකක් ක්ලික් කළ විට App එක Open කිරීම
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Notification එක Screen එකෙන් අයින් කරන්න

    // App එක දැනටමත් open නම් ඒ tab එකට යන්න, නැත්නම් අලුතින් open කරන්න
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === self.registration.scope && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
{
  "name": "K-Win",
  "short_name": "K-Win",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#00f2ff",
  "icons": [
    {
      "src": "./logo.jpeg",
      "sizes": "192x192",
      "type": "image/jpeg"
    },
    {
      "src": "./logo.jpeg",
      "sizes": "512x512",
      "type": "image/jpeg"
    }
  ]
}
