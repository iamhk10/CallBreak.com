/* ΣTΣЯПITY PWA service worker
 * Pre-caches the app shell for offline launch. Bump VERSION when releasing changes.
 */
const VERSION = 'eternity-v1.3.0';
const APP_SHELL = [
  './',
  './index.html',
  './t1.mp3',
  './t2.mp3',
  './t3.mp3',
  './t4.mp3',
  './t5.mp3',
  './t6.mp3',
  './t7.mp3',
  './t8.mp3',
  './t9.mp3',
  './t10.mp3',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.all(APP_SHELL.map(path =>
        cache.add(new Request(path, {cache: 'reload'})).catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('eternity-') && key !== VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(VERSION);
          cache.put('./index.html', response.clone()).catch(() => {});
        }
        return response;
      } catch (error) {
        return (await caches.match(request, {ignoreSearch: true}))
          || (await caches.match('./index.html'))
          || (await caches.match('./'))
          || Response.error();
      }
    })());
    return;
  }

  // Cache-first for bundled MP3s so winning tracks work offline.
  if (url.pathname.includes('/audio/') && /\\.mp3$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request, {ignoreSearch: true});
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          (await caches.open(VERSION)).put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (error) {
        return Response.error();
      }
    })());
    return;
  }

  // Cache-first for the manifest and app icons; use the network as a fallback.
  if (url.pathname.includes('/icons/') || url.pathname.endsWith('/manifest.webmanifest')) {
    event.respondWith((async () => {
      const cached = await caches.match(request, {ignoreSearch: true});
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) (await caches.open(VERSION)).put(request, response.clone()).catch(() => {});
        return response;
      } catch (error) {
        return Response.error();
      }
    })());
  }
});
