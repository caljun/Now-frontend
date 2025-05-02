const CACHE_NAME = 'now-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/home.html',
  '/area.html',
  '/friends.html',
  '/profile.html',
  '/css/style.css',
  '/js/index.js',
  '/js/login.js',
  '/js/register.js',
  '/js/home.js',
  '/js/area.js',
  '/js/friends.js',
  '/js/profile.js',
  '/utils/map.js',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js'
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] インストール');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 有効化イベント
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] 有効化');
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// fetch時はキャッシュ優先
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) =>
      response || fetch(event.request)
    )
  );
});
