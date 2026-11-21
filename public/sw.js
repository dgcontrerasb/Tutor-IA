// Service Worker ligero para Tutor-IA (PWA)
// - Solo cachea recursos estáticos esenciales.
// - Nunca intercepta /api/* ni llamadas de autenticación de Firebase/Google.
const CACHE_NAME = 'tutor-ia-static-v1';
const STATIC_ASSETS = ['/manifest.json', '/logo_full.jpg', '/logo.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Nunca interceptar APIs, Firebase ni orígenes externos
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Navegación HTML: Network-first con aviso amigable si no hay conexión
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(
          `<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Sin conexión · Tutor-IA</title><style>body{font-family:system-ui,sans-serif;background:#F8FAFC;color:#0F172A;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;text-align:center}.box{max-width:380px}h1{font-size:20px;margin:0 0 8px}p{font-size:14px;color:#475569;line-height:1.5}button{margin-top:16px;padding:10px 18px;border:0;border-radius:10px;background:#2563EB;color:#fff;font-weight:700;cursor:pointer}</style></head><body><div class="box"><h1>Sin conexión a internet</h1><p>Conéctate a Wi-Fi o datos móviles para consultar a Tutor-IA y revisar tus tareas escolares.</p><button onclick="location.reload()">Reintentar</button></div></body></html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      )
    );
    return;
  }

  // Assets estáticos locales: Cache-first con refresco silencioso
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
