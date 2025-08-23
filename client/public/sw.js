const CACHE_NAME = 'tomati-market-v2';
const urlsToCache = [
  '/',
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
  // Ignorer les requêtes qui ne sont pas HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Sinon, essayer de récupérer depuis le réseau
        return fetch(event.request).catch(function(error) {
          // En cas d'erreur réseau, retourner une réponse par défaut pour certains types
          console.log('Fetch failed for:', event.request.url, error);
          
          // Pour les requêtes de navigation, retourner la page d'accueil
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          // Pour les autres, laisser l'erreur se propager
          throw error;
        });
      })
  );
});