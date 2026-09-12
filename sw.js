/* =====================================================================
   SOILGUARD URBAN v3.1 — SERVICE WORKER (PWA)
   =====================================================================
   Fungsi: cache shell aplikasi agar bisa di-install ke HP/desktop
   dan jalan 100% offline saat di-host (GitHub Pages dsb).

   PENTING:
   - Service worker hanya aktif via http(s) (hosting/localhost),
     TIDAK saat file dibuka langsung via file:// atau di Electron
     (aplikasi tetap jalan normal, hanya gak bisa "di-install").
   - Setiap kali update file aplikasi di hosting, NAIKKAN versi CACHE
     di bawah ini supaya pengguna lama mendapat versi baru.
   - Permintaan lintas origin (Supabase API) TIDAK di-cache.
   - index.html & supabase-config.js = network-first (update selalu masuk),
     sisanya cache-first (cepat & offline).
   ===================================================================== */
const CACHE = 'soilguard-v3-6-2';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon.png',
  './libs/tailwind.js',
  './libs/chart.umd.min.js',
  './libs/jspdf.umd.min.js',
  './libs/jspdf-autotable.min.js',
  './libs/supabase.js',
  './libs/supabase-config.js',
  './libs/soilguard-ml.js',
  './libs/soilguard-sync.js',
  './libs/fontawesome/css/all.min.css',
  './libs/fontawesome/webfonts/fa-solid-900.woff2',
  './libs/fontawesome/webfonts/fa-solid-900.ttf',
  './libs/fontawesome/webfonts/fa-regular-400.woff2',
  './libs/fontawesome/webfonts/fa-regular-400.ttf',
  './libs/fontawesome/webfonts/fa-brands-400.woff2',
  './libs/fontawesome/webfonts/fa-brands-400.ttf',
  './libs/fontawesome/webfonts/fa-v4compatibility.woff2',
  './libs/fontawesome/webfonts/fa-v4compatibility.ttf',
  './libs/fonts/fonts.css',
  './libs/fonts/inter-400-latin.woff2',
  './libs/fonts/inter-400-latin-ext.woff2',
  './libs/fonts/inter-500-latin.woff2',
  './libs/fonts/inter-500-latin-ext.woff2',
  './libs/fonts/inter-600-latin.woff2',
  './libs/fonts/inter-600-latin-ext.woff2',
  './libs/fonts/poppins-600-latin.woff2',
  './libs/fonts/poppins-600-latin-ext.woff2',
  './libs/fonts/poppins-700-latin.woff2',
  './libs/fonts/poppins-700-latin-ext.woff2'
];

// File yang harus selalu dicek ke jaringan dulu (biar update/config baru langsung terpakai)
const NETWORK_FIRST = [/index\.html$/, /supabase-config\.js$/];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase API dll -> jaringan langsung

  if (NETWORK_FIRST.some((rx) => rx.test(url.pathname))) {
    // network-first: online -> ambil terbaru & perbarui cache; offline -> pakai cache
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // cache-first untuk aset statis
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }))
  );
});
