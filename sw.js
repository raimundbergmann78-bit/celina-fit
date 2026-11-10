/* Service Worker: macht die App offline nutzbar.
   Mit Internet: immer die neueste Datei laden (Updates kommen automatisch).
   Ohne Internet: aus dem Zwischenspeicher. */
const CACHE = 'celinafit-v1';
const FILES = [
  './', './index.html', './style.css', './app.js', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/splash.jpg',
  './bilder/01_leg_day.jpg', './bilder/02_glute_day.jpg', './bilder/03_upper_body.jpg', './bilder/04_quad_day.jpg',
  './bilder/05_core_day.jpg', './bilder/06_posterior_chain.jpg', './bilder/07_back_day.jpg', './bilder/08_arms_shoulders.jpg',
  './bilder/09_low_impact_cardio.jpg', './bilder/10_full_body.jpg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
