/* 个人工作台 service worker - 离线缓存应用外壳（网络优先，便于更新即时生效） */
const CACHE = 'pwb-v2';
const SHELL = [
  'index.html',
  'css/style.css',
  'js/store.js',
  'js/sync.js',
  'js/app.js',
  'manifest.webmanifest',
  'icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 网络优先：新部署即时生效；离线时回退缓存
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html')))
  );
});
