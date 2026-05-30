/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v15';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  './', // Alias for index.html
  './assets/css/chota.min.css',
  './assets/css/style.min.css',
  './assets/css/blog-feed.css',
  './assets/js/main.min.js',
  './assets/img/css_sprites.png'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// HTML uses network-first (so onboarding / data edits show up on next visit
// without a cache-version bump). Assets use cache-first (fast, offline-friendly).
self.addEventListener('fetch', event => {
  const req = event.request;

  // Skip cross-origin requests (Google Analytics, fonts, icongr.am icons, etc.).
  if (!req.url.startsWith(self.location.origin)) return;

  const isHTML = req.destination === 'document' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first for HTML.
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME).then(cache => cache.put(req, copy));
          return response;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('index.html')))
    );
    return;
  }

  // Cache-first for everything else.
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return caches.open(RUNTIME).then(cache =>
        fetch(req).then(response => {
          cache.put(req, response.clone());
          return response;
        })
      );
    })
  );
});