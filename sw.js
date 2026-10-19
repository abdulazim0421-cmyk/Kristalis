"use strict";

const VERSION = 'kr-v2';
const CORE = `${VERSION}-core`;
const MEDIA = `${VERSION}-media`;

const PRECACHE = [
    './',
    'index.html',
    'css/style.css?v=5',
    'css/extra.css?v=5',
    'js/data.js',
    'js/data-extra.js',
    'js/menu-i18n.js',
    'js/app.js',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
];

const NETWORK_TIMEOUT = 5000;

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

async function networkFirst(req) {
    const cache = await caches.open(CORE);
    try {
        const res = await fetchWithTimeout(req, NETWORK_TIMEOUT);
        if (res && res.ok)
            cache.put(req, res.clone());
        return res;
    } catch (err) {
        const hit = (await cache.match(req))
            || (req.mode === 'navigate' ? (await cache.match('index.html')) || (await cache.match('./')) : null);
        if (hit)
            return hit;
        throw err;
    }
}

async function staleWhileRevalidate(req) {
    const cache = await caches.open(MEDIA);
    const cached = await cache.match(req);
    const net = fetch(req)
        .then((res) => {
            if (res && (res.ok || res.type === 'opaque'))
                cache.put(req, res.clone());
            return res;
        })
        .catch(() => null);
    return cached || (await net) || Response.error();
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET')
        return;

    const url = new URL(req.url);
    const sameOrigin = url.origin === self.location.origin;
    const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
    if (!sameOrigin && !isFont)
        return;

    if (isFont || req.destination === 'image') {
        event.respondWith(staleWhileRevalidate(req));
        return;
    }

    event.respondWith(networkFirst(req));
});