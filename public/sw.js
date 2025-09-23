// Service Worker for Lubomir of Slavigrad Chronicles CV Website
// Implements caching strategies for optimal performance

const CACHE_NAME = 'slavigrad-cv-v1.0.0';
const STATIC_CACHE = 'slavigrad-static-v1.0.0';
const DYNAMIC_CACHE = 'slavigrad-dynamic-v1.0.0';
const IMAGE_CACHE = 'slavigrad-images-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/polyfills.js',
  '/assets/images/slavigrad.png',
  '/manifest.json'
];

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Static assets - Cache First
  static: {
    pattern: /\.(js|css|woff|woff2|ttf|eot)$/,
    strategy: 'cacheFirst',
    cacheName: STATIC_CACHE,
    maxAge: 31536000000 // 1 year
  },

  // Images - Cache First with fallback
  images: {
    pattern: /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
    strategy: 'cacheFirst',
    cacheName: IMAGE_CACHE,
    maxAge: 2592000000 // 30 days
  },

  // HTML pages - Stale While Revalidate
  pages: {
    pattern: /\.html$|\/$/,
    strategy: 'staleWhileRevalidate',
    cacheName: DYNAMIC_CACHE,
    maxAge: 86400000 // 24 hours
  },

  // API calls - Network First
  api: {
    pattern: /\/api\//,
    strategy: 'networkFirst',
    cacheName: DYNAMIC_CACHE,
    maxAge: 300000 // 5 minutes
  }
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine cache strategy
  const strategy = getCacheStrategy(request.url);

  if (strategy) {
    event.respondWith(
      handleRequest(request, strategy)
    );
  }
});

// Get appropriate cache strategy for URL
function getCacheStrategy(url) {
  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(url)) {
      return config;
    }
  }
  return null;
}

// Handle request based on cache strategy
async function handleRequest(request, strategy) {
  switch (strategy.strategy) {
    case 'cacheFirst':
      return cacheFirst(request, strategy);
    case 'networkFirst':
      return networkFirst(request, strategy);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, strategy);
    default:
      return fetch(request);
  }
}

// Cache First strategy
async function cacheFirst(request, strategy) {
  try {
    const cache = await caches.open(strategy.cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    const cache = await caches.open(strategy.cacheName);
    return cache.match(request) || new Response('Offline', { status: 503 });
  }
}

// Network First strategy
async function networkFirst(request, strategy) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(strategy.cacheName);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    console.error('Network First strategy failed, falling back to cache:', error);
    const cache = await caches.open(strategy.cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, strategy) {
  const cache = await caches.open(strategy.cacheName);
  const cachedResponse = await cache.match(request);

  // Start network request in background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Stale While Revalidate network request failed:', error);
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cached response, wait for network
  return networkPromise || new Response('Offline', { status: 503 });
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const responseDate = new Date(dateHeader);
  const now = new Date();

  return (now.getTime() - responseDate.getTime()) > maxAge;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync()
    );
  }
});

// Handle background sync
async function handleBackgroundSync() {
  console.log('Performing background sync...');

  // Implement background sync logic here
  // For example, sync offline form submissions

  try {
    // Sync any pending data
    await syncPendingData();
    console.log('Background sync completed successfully');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync pending data
async function syncPendingData() {
  // Implementation for syncing offline data
  // This could include form submissions, analytics, etc.
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/images/slavigrad.png',
        badge: '/assets/images/slavigrad.png',
        data: data.url
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
