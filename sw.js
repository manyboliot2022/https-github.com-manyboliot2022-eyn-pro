
const CACHE_NAME = 'eyn-pro-v2'; // Version incrémentée
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// Installation : Mise en cache des ressources de base
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force le nouveau SW à devenir actif immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Prend le contrôle des pages immédiatement
});

// Stratégie : Network First (Priorité au réseau pour avoir les mises à jour GitHub)
self.addEventListener('fetch', (event) => {
  // On ne gère que les requêtes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si le réseau répond, on met à jour le cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Si pas de réseau, on pioche dans le cache
        return caches.match(event.request);
      })
  );
});
