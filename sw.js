/* ALEX.UA digital — офлайн-кеш. Работает, когда сайт открыт по http(s) из папки архива или с хостинга. */
var CACHE = 'alex-ua-v2';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(['./', 'index.html', 'contacts.html', 'offer.html', 'privacy.html']); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Товары и настройки (content/*.json) всегда берём из сети первыми,
   чтобы правки из редактора появлялись сразу, а не из старого кеша. */
function isContent(url) {
  return /\/content\//.test(url);
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (isContent(e.request.url)) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return caches.match('index.html'); });
    })
  );
});
