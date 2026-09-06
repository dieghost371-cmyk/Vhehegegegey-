const CACHE_NAME = 'ghostdepths-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// App shell (HTML/CSS/JS/icons) is cached so the app opens offline.
// Firebase requests (auth/firestore/googleapis) always go to the
// network — they're live data and shouldn't be cached.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('firebasestorage')) {
    return; // let it go straight to network
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
