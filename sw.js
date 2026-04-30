const CACHE_NAME = 'kwin-ecard-v' + Date.now();
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 1. Install Event - Assets Cache කිරීම
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('K-Win: Caching new assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Event - පැරණි Cache ඉවත් කිරීම
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
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
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// 4. Notification Logic (Background Sync)
self.addEventListener('sync', (e) => {
  if (e.tag === 'data-on-check') {
    e.waitUntil(checkScheduleAndNotify());
  }
});

async function checkScheduleAndNotify() {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (clientList.length > 0) return; // App එක open නම් Notification යවන්නේ නැත

  const now = new Date();
  const hour = now.getHours();
  let title = "K-Win Production 🎬";
  let message = "";
  let uniqueTag = "";

  if (isFullMoon(now)) {
    message = "අද පෝය දිනය බැවින් සේවාවන් තාවකාලිකව නවතා ඇත. | Poya Day Holiday";
    uniqueTag = "poya-closed";
  } 
  else if (hour >= 8 && hour < 9) {
    message = "සුභ උදෑසනක්! ඔබගේ ඩිජිටල් අවශ්‍යතා සඳහා K-Win සූදානම්.";
    uniqueTag = "morning-promo";
  } else if (hour >= 20 && hour < 21) {
    message = "K-Win සේවාවන් අද දිනට අවසන්. හෙට නැවත හමුවෙමු!";
    uniqueTag = "night-closed";
  }

  if (message !== "") {
    return self.registration.showNotification(title, {
      body: message,
      icon: 'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg',
      badge: 'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg',
      vibrate: [200, 100, 200],
      tag: uniqueTag,
      renotify: true,
      data: { url: './index.html' }
    });
  }
}

// පෝය දින ගණනය කිරීමේ ඇල්ගොරිතම
function isFullMoon(date) {
  const baseDate = new Date(1900, 0, 1);
  const diffDays = (date - baseDate) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.530588853;
  const daysSinceNewMoon = (diffDays - 0.2) % lunarCycle;
  return (daysSinceNewMoon >= 14.2 && daysSinceNewMoon <= 15.8);
}

// 5. Notification Click - App එක Open කිරීම
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('./index.html');
    })
  );
});

// 6. Manual Push Notification
self.addEventListener('push', (e) => {
  let message = e.data ? e.data.text() : 'K-Win New Update!';
  e.waitUntil(
    self.registration.showNotification('K-Win Production', {
      body: message,
      icon: 'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg',
      tag: 'kwin-push'
    })
  );
});
