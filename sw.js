// ============================================================
//  Always On Generators – Field Hub
//  Service Worker  |  sw.js  |  Version: aog-forms-v2.0.6
//  Scope: root (../)
//  Strategy: Network-First for HTML, Stale-While-Revalidate
//  for assets, with full offline fallback
//
//  ⚠ WHEN YOU UPDATE ANY TOOL:
//    1. Bump CACHE_NAME
//    2. Update CHANGELOG below with what changed
// ============================================================

var CACHE_NAME = 'aog-forms-v2.0.2';
var DEV_MODE   = false; // ← SET TRUE during development/testing

// ============================================================
//  CHANGELOG — Update this every time you bump CACHE_NAME.
//  This text is sent to the page and shown in the update banner.
//  Keep each line short — one change per item.
// ============================================================
var CHANGELOG = [
  'PUSHES AN UPDATE BANNER SHOWING WHATS BEING CHANGED',
  'Describe your second change here',
  'Add or remove lines as needed'
];
// ============================================================

// ─── Files to pre-cache on install ───────────────────────────
var PRECACHE_URLS = [
  '../',
  '../index.html',
  '../offline.html',
  '../logo.png',
  '../sw.js',
  '../update-banner.js',

  '../estimate/',
  '../maintenance/',
  '../site-visit/',
  '../gas-install/',
  '../elect-install/',
  '../load-calcs/',
  '../breaker-conductor/',
  '../conduit-fill/',
  '../sketch-pad/'
];

// ─── CDN assets to cache on first use ────────────────────────
var CACHE_CDN = [
  'https://api.mapbox.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com'
];

// ============================================================
//  INSTALL — Pre-cache all core files
// ============================================================
self.addEventListener('install', function(event) {
  console.log('[SW] Installing — Cache:', CACHE_NAME);

  if (DEV_MODE) {
    console.log('[SW] ⚠ DEV MODE — Skipping pre-cache, taking control immediately');
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Pre-caching core files');
        return Promise.all(
          PRECACHE_URLS.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn('[SW] Pre-cache skipped (file not found):', url, err);
            });
          })
        );
      })
      .then(function() {
        console.log('[SW] Install complete — waiting to activate');
        return self.skipWaiting();
      })
  );
});

// ============================================================
//  ACTIVATE — Delete old caches, claim clients
// ============================================================
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating — Cache:', CACHE_NAME);

  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        console.log('[SW] Activated — claiming all clients');
        return self.clients.claim();
      })
  );
});

// ============================================================
//  FETCH — Request handling strategies
// ============================================================
self.addEventListener('fetch', function(event) {

  var request = event.request;
  var url     = new URL(request.url);

  if (DEV_MODE) {
    event.respondWith(
      fetch(request).catch(function() {
        return new Response(
          '<h2 style="font-family:sans-serif;color:red;padding:20px">' +
          '⚠ Network unavailable (Dev Mode — no cache)</h2>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (url.hostname.includes('mapbox.com') || url.hostname.includes('mapbox.cn')) {
    event.respondWith(
      fetch(request).catch(function() {
        return new Response('{}', { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')    ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.destination === 'image' ||
      url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.match(/\.(js|css)$/i)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

// ============================================================
//  STRATEGY: Network First
// ============================================================
function networkFirst(request) {
  return fetch(request)
    .then(function(networkResponse) {
      if (networkResponse && networkResponse.ok) {
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, responseClone);
        });
      }
      return networkResponse;
    })
    .catch(function() {
      console.log('[SW] Network failed — serving from cache:', request.url);
      return caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) return cachedResponse;
          if (request.headers.get('Accept') &&
              request.headers.get('Accept').includes('text/html')) {
            return caches.match('../offline.html');
          }
          return new Response('Service Unavailable', { status: 503 });
        });
    });
}

// ============================================================
//  STRATEGY: Stale While Revalidate
// ============================================================
function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(cachedResponse) {
      var networkFetch = fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(function(err) {
        console.log('[SW] Revalidate network fetch failed:', err);
      });
      return cachedResponse || networkFetch;
    });
  });
}

// ============================================================
//  STRATEGY: Cache First
// ============================================================
function cacheFirst(request) {
  return caches.match(request).then(function(cachedResponse) {
    if (cachedResponse) return cachedResponse;
    return fetch(request).then(function(networkResponse) {
      if (networkResponse && networkResponse.ok) {
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, responseClone);
        });
      }
      return networkResponse;
    }).catch(function() {
      return new Response('', { status: 404 });
    });
  });
}

// ============================================================
//  MESSAGE HANDLER
// ============================================================
self.addEventListener('message', function(event) {

  if (event.data && event.data.action === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING — activating now');
    self.skipWaiting();
  }

  if (event.data && event.data.action === 'CLEAR_CACHE') {
    console.log('[SW] Received CLEAR_CACHE — nuking all caches');
    caches.keys().then(function(keys) {
      keys.forEach(function(key) { caches.delete(key); });
    });
    event.ports[0].postMessage({ result: 'Cache cleared' });
  }

  // ── Page asks the waiting SW what changed ──────────────────
  // update-banner.js sends GET_CHANGELOG to the *waiting* SW
  // (not the active one), so the reply always contains the
  // fresh changelog from the new sw.js — never stale cached text.
  if (event.data && event.data.action === 'GET_CHANGELOG') {
    event.ports[0].postMessage({
      version:   CACHE_NAME,
      changelog: CHANGELOG
    });
  }

});

// ============================================================
//  END OF SERVICE WORKER
// ============================================================
