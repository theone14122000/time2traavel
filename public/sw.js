/**
 * Time to Travel — minimal service worker (PWA).
 *
 * - install: skipWaiting + precache the offline page.
 * - activate: delete old caches + clients.claim().
 * - fetch:
 *     • navigations → network-first, fall back to the cached page and finally
 *       to /offline.html when the network is down;
 *     • /_next/static/*, /icon.svg and /offline.html → cache-first;
 *     • API/auth and cross-origin requests are never intercepted/cached.
 *
 * Registered from the root layout in production only.
 */

const CACHE_VERSION = "tt-v1";
const OFFLINE_URL = "/offline.html";

/** Immutable build assets + the icon/offline shell are safe to cache hard. */
function isCacheFirst(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname === "/icon.svg" ||
    pathname === OFFLINE_URL
  );
}

/** API, auth and admin traffic must always hit the network. */
function isNeverCached(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isNeverCached(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isCacheFirst(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("You are offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
  }
  return response;
}
