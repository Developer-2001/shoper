const MEDIA_CACHE = "shoper-media-v1";
const CACHEABLE_DESTINATIONS = new Set(["image", "video"]);
const CACHEABLE_HOSTS = new Set([self.location.hostname, "storage.googleapis.com"]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function isCacheableRequest(request) {
  if (request.method !== "GET") return false;
  if (!CACHEABLE_DESTINATIONS.has(request.destination)) return false;
  if (request.headers.has("range")) return false;

  const url = new URL(request.url);
  return CACHEABLE_HOSTS.has(url.hostname);
}

function shouldStoreResponse(request, response) {
  if (response.status === 206) return false;

  return response.status === 200 || response.type === "opaque";
}

async function cacheFirst(request) {
  const cache = await caches.open(MEDIA_CACHE);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (shouldStoreResponse(request, networkResponse)) {
    await cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isCacheableRequest(request)) return;

  event.respondWith(
    cacheFirst(request).catch(() => fetch(request)),
  );
});
