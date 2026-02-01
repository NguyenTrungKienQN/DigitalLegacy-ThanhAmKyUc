const CACHE_STATIC = "tak-static-v3";
const STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/offline.html",
  "/favicon.ico",
  // nếu bạn có icon: thêm các path thật của bạn, ví dụ:
  // "/icons/icon-192.png",
  // "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((c) => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_STATIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // never cache Next assets
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) return;

  // ✅ Navigations: network-first, fallback offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // ✅ Static assets: cache-first
  const isStatic =
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|webp|svg|ico|webmanifest)$/i.test(url.pathname);

  if (!isStatic) {
    // other requests: just go network (avoid caching random stuff)
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_STATIC).then((c) => c.put(req, copy));
        return res;
      });
    })
  );
});
