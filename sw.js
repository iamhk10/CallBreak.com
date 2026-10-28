/* ΣTΣЯПITY PWA service worker
 * Caches the app shell and optional music tracks for offline use.
 * Keep sw.js and index.html in the app root, and t1.mp3 ... t10.mp3 inside the audio/ folder.
 */
const VERSION = 'eternity-music-v1.0.2';

const APP_SHELL = [
  './',
  './index.html',
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

const MUSIC_FILES = [
  './audio/t1.mp3', './audio/t2.mp3', './audio/t3.mp3', './audio/t4.mp3', './audio/t5.mp3',
  './audio/t6.mp3', './audio/t7.mp3', './audio/t8.mp3', './audio/t9.mp3', './audio/t10.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);

    // Cache each file separately: a missing optional icon or MP3 must not
    // prevent the service worker from installing.
    await Promise.all([...APP_SHELL, ...MUSIC_FILES].map(async path => {
      try {
        const response = await fetch(new Request(path, { cache: 'reload' }));
        if (response.ok) await cache.put(path, response);
      } catch (_) {
        // The file may be optional or unavailable during installation.
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('eternity-') && key !== VERSION)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App navigation: network first, cached app shell if offline.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(VERSION);
          await cache.put('./index.html', response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(request, { ignoreSearch: true }))
          || (await caches.match('./index.html'))
          || (await caches.match('./'))
          || Response.error();
      }
    })());
    return;
  }

  const isMusic = /\/audio\/t(?:10|[1-9])\.mp3$/i.test(url.pathname);
  const isStaticAsset = url.pathname.includes('/icons/')
    || url.pathname.endsWith('/manifest.webmanifest');

  // Music and static assets: cache first, then network. Newly fetched files
  // are cached so tracks that were missing during installation can be saved.
  if (isMusic || isStaticAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(VERSION);
          await cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return Response.error();
      }
    })());
  }
});
