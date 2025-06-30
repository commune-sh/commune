/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { version } from '$service-worker';

const CACHE = `commune-cache-${version}`;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    async function activate() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
        await self.clients.claim();
    }
    
    event.waitUntil(activate());
});

self.addEventListener('fetch', (event) => {

    if (event.request.method !== 'GET') return;

    // we'll just cache matrix media requests for now
    if (!event.request.url.includes(`/_matrix/client/v1/media/`)) {
        return
    }


    async function respond() {
        const cache = await caches.open(CACHE);

        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const response = await fetch(event.request);

            if (!(response instanceof Response)) {
                throw new Error('invalid response from fetch');
            }

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (err) {
            throw err;
        }
    }

    event.respondWith(respond());
});
