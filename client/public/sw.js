// Service worker de Vacas 2027 — permite instalar la app y usarla offline.
// La app guarda los datos en localStorage, así que sin conexión sigue andando.
const VERSION = 'v1';
const CACHE = `vacas2027-${VERSION}`;
// Base del despliegue (ej: /vacas2027/ en GitHub Pages, / en local).
const BASE = new URL('./', self.location).pathname;

const CORE = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
  `${BASE}icons/apple-touch-icon.png`,
  `${BASE}img/hero-beach.jpg`,
  `${BASE}img/aerial.jpg`,
  `${BASE}img/sunset.jpg`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // best-effort: si algún recurso falla, no se rompe la instalación
      await Promise.allSettled(CORE.map((url) => cache.add(url)));
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // no tocar recursos externos

  // Navegación (abrir la app): red primero, si falla, index cacheado (offline).
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, net.clone());
          return net;
        } catch {
          const cached = await caches.match(request);
          return (
            cached ||
            (await caches.match(`${BASE}index.html`)) ||
            (await caches.match(BASE)) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Resto de recursos (JS, CSS, imágenes): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const network = fetch(request)
        .then((net) => {
          if (net && net.ok) {
            caches.open(CACHE).then((cache) => cache.put(request, net.clone()));
          }
          return net;
        })
        .catch(() => null);
      return cached || (await network) || new Response('', { status: 504 });
    })()
  );
});
