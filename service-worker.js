
const CACHE_NAME = 'student-record-cache-v1';

const urlsToCache = [
  '/',
  '/index.html', 
  '/login.html', 
  '/style.css', 
  '/script.js', 
  '/manifest.json', 
  '/logo/Cogon.png', 

 
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js'
];


self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache assets during install:', error);
        // Even if caching fails, the service worker will still install,
        // but assets won't be available offline on the first visit.
      })
  );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...', event);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve(); // Resolve immediately for the current cache
        })
      );
    })
  );
  // Ensure the service worker takes control of the page immediately
  return self.clients.claim();
});

// Fetch event: Intercepts network requests
self.addEventListener('fetch', (event) => {
  // console.log('[Service Worker] Fetching resource:', event.request.url);

  // Strategy: Cache-first for the assets we've cached
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the asset is in the cache, return it
        if (response) {
          // console.log('[Service Worker] Found in cache:', event.request.url);
          return response;
        }

        // If the asset is not in the cache, fetch it from the network
        // console.log('[Service Worker] Not in cache, fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Optional: Cache new or updated assets as they are fetched
            // Be cautious with caching dynamic responses (like Firebase data)
            // This basic example only caches GET requests
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && event.request.method === 'GET') {
                 const responseToCache = networkResponse.clone();
                 caches.open(CACHE_NAME)
                      .then(cache => {
                           // Avoid caching large or unnecessary assets here if not in urlsToCache
                           // Only cache if the URL matches something we *might* want to cache later
                           // Or, refine this logic to only cache specific types/paths
                           // For this example, we'll just put it in the cache if it's a successful GET
                           // A more robust SW would check if the URL is one of the 'urlsToCache' or similar
                           // console.log('[Service Worker] Caching new resource:', event.request.url);
                           cache.put(event.request, responseToCache);
                      })
                      .catch(cacheError => {
                           console.warn('[Service Worker] Failed to cache fetched resource:', event.request.url, cacheError);
                      });
            }
            return networkResponse; // Return the network response
          })
          .catch(networkError => {
            console.error('[Service Worker] Network request failed for:', event.request.url, networkError);
            // Optional: Provide a fallback response for offline users if the network fails
            // For example, return a basic offline page
            // return caches.match('/offline.html'); // You would need an offline.html page and cache it
            throw networkError; // Re-throw the error if no fallback is provided
          });
      })
  );
});
