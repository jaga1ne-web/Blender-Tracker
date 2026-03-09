const CACHE_NAME = 'blender-tracker-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// Handle push notifications from server (if using web push)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🎨 Blender習慣チェック', {
      body: data.body || '今日の制作物をまだ納品していません！',
      icon: '/blender-tracker/icon.png',
      badge: '/blender-tracker/icon.png',
      vibrate: [200, 100, 200],
      tag: 'daily-reminder',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'アプリを開く' },
        { action: 'dismiss', title: '後で' }
      ]
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('blender-tracker') && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('./');
      })
    );
  }
});

// Message handler for scheduled notifications from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: './icon.svg',
        vibrate: [200, 100, 200],
        tag: 'daily-reminder',
        requireInteraction: true,
      });
    }, delay);
  }
});
