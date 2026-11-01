/* ΣTΣЯПITY PWA service worker
 * - App shell (HTML, icons, manifest) is cached on install.
 * - Songs (audio/song1.m4a or .mp3 ... song40) are NOT downloaded on install.
 *   They are saved in their own cache when the app plays them (or when the user taps
 *   "Save all songs offline" in Music Studio) and are then served offline.
 * - Cached songs are answered with proper Range (206) responses, which browsers need
 *   for audio seeking and for Safari/iOS playback.
 */
const VERSION = 'eternity-app-v2.0.0';
// Separate cache name (no "eternity-" prefix) so a new app version never deletes saved songs.
const SONG_CACHE = 'songs-v1';

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

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Cache each file separately: one missing optional icon must not stop installation.
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(new Request(path, { cache: 'reload' }));
        if (response.ok) await cache.put(path, response);
      } catch (_) {}
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

// Build a 206 Partial Content answer from a fully cached song.
async function rangeFromCache(request, cached) {
  const header = request.headers.get('range');
  const match = header && /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return cached;

  const buffer = await cached.arrayBuffer();
  const size = buffer.byteLength;
  let start, end;
  if (match[1] === '' && match[2] !== '') {          // bytes=-500 (last 500 bytes)
    start = Math.max(0, size - parseInt(match[2], 10));
    end = size - 1;
  } else {
    start = parseInt(match[1], 10);
    end = match[2] === '' ? size - 1 : Math.min(parseInt(match[2], 10), size - 1);
  }
  if (isNaN(start) || start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  }
  return new Response(buffer.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || (/\.m4a$/i.test(request.url) ? 'audio/mp4' : 'audio/mpeg'),
      'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

async function handleSong(request) {
  const cache = await caches.open(SONG_CACHE);
  const cached = await cache.match(request.url, { ignoreSearch: true });
  if (cached) return rangeFromCache(request, cached);

  // Not saved yet. Normal streaming (Range) requests go straight to the network.
  // A plain full request (prefetch / "Save all") is saved for offline use.
  try {
    const response = await fetch(request);
    if (!request.headers.has('range') && response.ok && response.status === 200) {
      cache.put(request.url, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    return Response.error();
  }
}

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

  // Songs: saved on demand, served with Range support.
  if (/\/audio\/song\d+\.(m4a|mp3)$/i.test(url.pathname)) {
    event.respondWith(handleSong(request));
    return;
  }

  // Icons and manifest: cache first, then network.
  if (url.pathname.includes('/icons/') || url.pathname.endsWith('/manifest.webmanifest')) {
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
