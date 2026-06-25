/*
 * Minimal service worker for installability + basic offline resilience.
 *
 * The schedule data is live (Firestore), so we never want to serve stale
 * data — those requests always go to the network. We only cache the static
 * app shell so the app opens instantly and still launches when offline.
 */
const CACHE = 'kegger-shell-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Only handle same-origin GETs; let Firestore / other hosts go straight out.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return
  }

  // Navigations: network-first so users get the latest deploy, with the
  // cached shell as an offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html')),
    )
    return
  }

  // Static assets: serve from cache when present, otherwise fetch and stash.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
          return res
        }),
    ),
  )
})
