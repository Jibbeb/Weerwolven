const cacheName = 'weerwolven-v1';
const appShellFiles = [
    './',
    './index.html',
    './css/style.css',
    './js/game.js',
    './js/sprites.js',
    './manifest.json',
    './assets/player.png',
    './assets/wolf_wall.png',
    './assets/ground.png',
    './assets/background.png',
    './assets/goal.png'
];

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(appShellFiles);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => {
            console.log('[Service Worker] Fetching resource: ' + e.request.url);
            return r || fetch(e.request);
        })
    );
});