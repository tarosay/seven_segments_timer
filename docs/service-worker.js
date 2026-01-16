/*
  7セグ カウントダウンタイマー PWA Service Worker
  - オフラインでも index.html が開ける
  - 静的アセットは cache-first（裏で更新）

  ※ end_sound.mp3 / warn_sound.mp3 をオフラインでも鳴らしたい場合は、
    下の OPTIONAL_ASSETS に追加してください（存在しないと install が失敗しうるため）。
*/

const CACHE_NAME = 'seven-seg-timer-v1';

// ここに「必ず存在する」ファイルだけを列挙（存在しないと install が失敗します）
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

// 任意（同梱される場合のみ追加）
const OPTIONAL_ASSETS = [
  // './end_sound.mp3',
  // './warn_sound.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // 必須は addAll（失敗したら install を失敗させる）
    await cache.addAll(PRECACHE_URLS);

    // 任意は「失敗してもSW全体は生かす」
    await Promise.allSettled(
      OPTIONAL_ASSETS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.ok) await cache.put(url, res);
        } catch { /* ignore */ }
      })
    );

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k)))
    );
    await self.clients.claim();
  })());
});

// fetch:
// - ナビゲーション（HTML）は network-first（失敗したらキャッシュ）
// - それ以外は cache-first（あれば即返し、裏で更新）
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // scope外は触らない
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === 'navigate' ||
    (req.destination === 'document' && req.headers.get('accept')?.includes('text/html'));

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html') || new Response('offline', { status: 503 });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) {
      // 裏で更新
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
        } catch { /* ignore */ }
      })());
      return cached;
    }

    try {
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return new Response('', { status: 504 });
    }
  })());
});
