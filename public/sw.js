const CACHE_NAME = 'tomati-market-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Tenter la requête réseau - ignorer les erreurs externes
        return fetch(event.request).catch(function(error) {
          // Retourner une réponse vide pour les erreurs CORS/externes
          if (event.request.url.includes('nominatim.openstreetmap.org')) {
            return new Response('{}', {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          // Pour autres erreurs, retourner erreur service
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      }
    )
  );
});