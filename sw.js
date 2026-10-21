"use strict";

const VERSION = 'kr-v17';
const CORE = `${VERSION}-core`;
const MEDIA = `${VERSION}-media`;
const MEDIA_LIMIT = 120;
const NETWORK_TIMEOUT = 5000;

const PRECACHE = [
    './',
    'index.html',
    'css/style.css?v=6',
    'css/extra.css?v=6',
    'css/rules.css?v=4',
    'css/gallery.css?v=6',
    'css/herocards.css?v=5',
    'js/data.js?v=7',
    'js/gallery-data.js?v=1',
    'js/data-extra.js?v=7',
    'js/menu-i18n.js?v=7',
    'js/app.js?v=9',
    'js/rules.js?v=4',
    'js/gallery.js?v=6',
    'js/boot.js?v=5',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'img/hero.jpg',
    'img/hero-portrait.jpg',
];

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

function fetchWithTimeout(req, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    const opts = req.mode === 'navigate' ? { signal: ctrl.signal } : { signal: ctrl.signal, cache: 'no-cache' };
    return fetch(req, opts).finally(() => clearTimeout(timer));
}

async function networkFirst(event, req) {
    const cache = await caches.open(CORE);
    try {
        const res = await fetchWithTimeout(req, NETWORK_TIMEOUT);
        if (res && res.status === 200)
            event.waitUntil(cache.put(req, res.clone()));
        return res;
    } catch (err) {
        const hit = (await cache.match(req))
            || (req.mode === 'navigate' ? (await cache.match('index.html')) || (await cache.match('./')) : null);
        return hit || Response.error();
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

async function staleWhileRevalidate(event, req) {
    const cache = await caches.open(MEDIA);
    const cached = await cache.match(req, { ignoreVary: true });
    const update = mediaFetch(req)
        .then(async (res) => {
            if (res && res.status === 200) {
                await cache.put(req, res.clone());
                await trimCache(cache, MEDIA_LIMIT);
            }
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
    const sameOrigin = url.origin === self.location.origin;
    const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
    const isImage = req.destination === 'image';

    if (!sameOrigin && !isFont && !isImage)
        return;

    if (isFont || isImage) {
        event.respondWith(staleWhileRevalidate(event, req));
        return;
    }

    event.respondWith(networkFirst(event, req));
});