const VERSION = 'v1';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/site.webmanifest',
  '/favicon.ico',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  '/icons/android/launchericon-48x48.png',
  '/icons/android/launchericon-72x72.png',
  '/icons/android/launchericon-96x96.png',
  '/icons/android/launchericon-144x144.png',
  '/icons/android/launchericon-192x192.png',
  '/icons/android/launchericon-512x512.png',
  '/icons/ios/16.png',
  '/icons/ios/32.png',
  '/icons/ios/192.png',
  '/icons/ios/512.png',
  '/icons/apple-touch-icon.png',
  '/fonts/Georgia/Georgia-Italic.woff2',
  '/fonts/Georgia/Georgia-Italic.woff',
  '/fonts/Georgia/Georgia-Italic.ttf',
];

function isSameOrigin(requestUrl) {
  return new URL(requestUrl).origin === self.location.origin;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await cache.delete(keys[0]);
  await trimCache(cacheName, maxEntries);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    await cache.put('/index.html', response.clone());
    return response;
  } catch {
    const cachedShell = await caches.match('/index.html');
    if (cachedShell) return cachedShell;
    return caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      await cache.put(request, networkResponse.clone());
      await trimCache(RUNTIME_CACHE, 80);
      return networkResponse;
    })
    .catch(() => undefined);

  return (
    cachedResponse ?? (await fetchPromise) ?? cachedResponse ?? Response.error()
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!isSameOrigin(request.url)) return;

  async function cacheFirst(requestToHandle) {
    const cachedResponse = await caches.match(requestToHandle);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(requestToHandle);
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(requestToHandle, networkResponse.clone());
    await trimCache(RUNTIME_CACHE, 80);
    return networkResponse;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const destination = request.destination;
  if (
    destination === 'script' ||
    destination === 'style' ||
    destination === 'image' ||
    destination === 'font' ||
    destination === 'manifest'
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
