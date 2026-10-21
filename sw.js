"use strict";

const VERSION = 'kr-v18';
const CORE = `${VERSION}-core`;
const MEDIA = 'kr-media';
const MEDIA_LIMIT = 600;
const NETWORK_TIMEOUT = 4000;

const PRECACHE = [
    './',
    'index.html',
    'css/style.css',
    'css/extra.css',
    'css/rules.css',
    'css/gallery.css',
    'css/herocards.css',
    'css/perf.css',
    'js/data.js',
    'js/gallery-data.js',
    'js/data-extra.js',
    'js/app.js',
    'js/rules.js',
    'js/gallery.js',
    'js/boot.js',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'icons/apple-touch-icon.png',
    'img/hero.jpg',
    'img/hero-portrait.jpg',
    'img/paren-1.jpg',
    'img/paren-2.jpg',
    'img/paren-3.jpg',
    'img/massage-1.jpg',
    'img/massage-2.jpg',
    'img/massage-3.jpg',
    'img/body-1.jpg',
    'img/body-2.jpg',
    'img/body-3.jpg',
    'img/face-1.jpg',
    'img/face-2.jpg',
    'img/face-3.jpg',
    'img/depil-1.jpg',
    'img/depil-2.jpg',
    'img/depil-3.jpg',
    'img/hair-1.jpg',
    'img/hair-2.jpg',
    'img/hair-3.jpg',
    'img/nails-1.jpg',
    'img/nails-2.jpg',
    'img/nails-3.jpg',
];

let puts = 0;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CORE)
            .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CORE && k !== MEDIA).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

function fetchFresh(req, signal) {
    const opts = req.mode === 'navigate' ? { signal } : { signal, cache: 'no-cache' };
    return fetch(req, opts);
}

function fetchWithTimeout(req, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetchFresh(req, ctrl.signal).finally(() => clearTimeout(timer));
}

async function networkFirst(event, req) {
    const cache = await caches.open(CORE);
    const cached = (await cache.match(req))
        || (await cache.match(req, { ignoreSearch: true }))
        || (req.mode === 'navigate' ? (await cache.match('index.html')) || (await cache.match('./')) : undefined);
    try {
        const res = cached ? await fetchWithTimeout(req, NETWORK_TIMEOUT) : await fetchFresh(req);
        if (res && res.status === 200)
            event.waitUntil(cache.put(req, res.clone()));
        return res;
    } catch (err) {
        return cached || Response.error();
    }
}

async function mediaFetch(req) {
    if (new URL(req.url).origin === self.location.origin)
        return fetch(req);
    try {
        return await fetch(new Request(req.url, { mode: 'cors', credentials: 'omit' }));
    } catch (err) {
        return fetch(req);
    }
}

async function trimCache(cache, limit) {
    const keys = await cache.keys();
    if (keys.length > limit)
        await Promise.all(keys.slice(0, keys.length - limit).map((k) => cache.delete(k)));
}

async function store(cache, req, res) {
    await cache.put(req, res);
    puts += 1;
    if (puts % 25 === 0)
        await trimCache(cache, MEDIA_LIMIT);
}

async function cacheFirst(event, req) {
    const cache = await caches.open(MEDIA);
    const cached = await cache.match(req, { ignoreVary: true });
    if (cached)
        return cached;
    try {
        const res = await mediaFetch(req);
        if (res && res.status === 200)
            event.waitUntil(store(cache, req, res.clone()));
        return res;
    } catch (err) {
        return Response.error();
    }
}

async function staleWhileRevalidate(event, req) {
    const cache = await caches.open(MEDIA);
    const cached = await cache.match(req, { ignoreVary: true });
    const update = mediaFetch(req)
        .then(async (res) => {
            if (res && res.status === 200)
                await store(cache, req, res.clone());
            return res;
        })
        .catch(() => null);
    if (cached) {
        event.waitUntil(update);
        return cached;
    }
    return (await update) || Response.error();
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || req.headers.has('range'))
        return;

    const url = new URL(req.url);
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
        return;

    const sameOrigin = url.origin === self.location.origin;
    const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
    const isImage = req.destination === 'image';

    if (!sameOrigin) {
        if (isFont || isImage)
            event.respondWith(cacheFirst(event, req));
        return;
    }

    if (isImage) {
        event.respondWith(staleWhileRevalidate(event, req));
        return;
    }

    event.respondWith(networkFirst(event, req));
});