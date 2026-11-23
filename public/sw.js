// Service worker de la Pokédex: la app funciona sin conexión.
// Sin dependencias: estrategias de caché escritas a mano.

// El build sustituye estos dos valores (ver precacheManifest en vite.config.ts).
const VERSION = "__VERSION__";
const BUILD_FILES = [] /* __PRECACHE__ */;
const APP = `app-${VERSION}`;
const SPRITES = "sprites-v1"; // no depende del build: se conservan entre versiones
const API = "api-v1";
const FONTS = "fonts-v1";
const KEEP = [APP, SPRITES, API, FONTS];

const PRECACHE = [
  ...new Set(["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", ...BUILD_FILES]),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === "opaque") cache.put(request, res.clone());
  return res;
}

async function networkFirst(cacheName, request, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(request)) ?? (fallbackUrl && (await cache.match(fallbackUrl)));
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const update = fetch(request)
    .then((res) => {
      if (res.ok || res.type === "opaque") cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit ?? update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Navegación (SPA): red primero; sin red, el index.html guardado.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(APP, request, "/index.html"));
    return;
  }
  // Assets propios (con hash en el nombre) y datos empaquetados.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(APP, request));
    return;
  }
  // Sprites de PokéAPI en GitHub.
  if (url.hostname === "raw.githubusercontent.com") {
    event.respondWith(cacheFirst(SPRITES, request));
    return;
  }
  // Ficha de la GBA: red primero, la última respuesta si no hay conexión.
  if (url.hostname === "pokeapi.co") {
    event.respondWith(networkFirst(API, request));
    return;
  }
  // Fuentes de Google.
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
    event.respondWith(staleWhileRevalidate(FONTS, request));
  }
});
