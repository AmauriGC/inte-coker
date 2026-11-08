/*
 * Service worker de GC-Confort (estrategias de la práctica 4.2, adaptadas).
 * Plantilla: el plugin pwa/pluginSw.js rellena la versión, la lista de precarga y el origen
 * de la API al compilar, y la publica como /sw.js. En desarrollo (npm run dev) no se registra.
 *
 * | Recurso                                  | Estrategia                         | Caché           |
 * |------------------------------------------|------------------------------------|-----------------|
 * | Navegación (páginas de la SPA)           | network-first (3 s), respaldo index| gc-estatico-v   |
 * | /assets/* (archivos con hash)            | cache-first sin TTL                | gc-estatico-v   |
 * | Otros archivos propios (iconos, webp)    | cache-first con TTL de 7 días      | gc-estatico-v   |
 * | /uploads/** del back (glb e imágenes)    | cache-first, TTL 30 días, límite   | gc-archivos-v1  |
 * | GET públicos de /api (catálogo)          | network-first, TTL 24 h, límite    | gc-api-v1       |
 * | Google Fonts (hoja y archivos)           | cache-first, TTL 30 días           | gc-fuentes-v1   |
 */

const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const API_ORIGEN = '__API_ORIGEN__';

const CACHE_ESTATICO = `gc-estatico-${VERSION}`;
const CACHE_API = 'gc-api-v1';
const CACHE_ARCHIVOS = 'gc-archivos-v1';
const CACHE_FUENTES = 'gc-fuentes-v1';
const LISTA_BLANCA = [CACHE_ESTATICO, CACHE_API, CACHE_ARCHIVOS, CACHE_FUENTES];
const ORIGENES_FUENTES = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

const LIMITE_API = 60;
const LIMITE_ARCHIVOS = 40;
const DIA = 24 * 60 * 60;
const TTL_ESTATICO = 7 * DIA;
const TTL_API = DIA;
const TTL_ARCHIVOS = 30 * DIA;
const CABECERA_FECHA = 'x-sw-fecha';
// Con señal débil, a los 3 s se abre la app guardada en lugar de seguir esperando a la red.
const ESPERA_NAVEGACION_MS = 3000;

// ---------- Ciclo de vida ----------

self.addEventListener('install', (event) => {
  // Sin skipWaiting: la versión nueva espera a que la persona acepte "Actualizar".
  event.waitUntil(caches.open(CACHE_ESTATICO).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre.startsWith('gc-') && !LISTA_BLANCA.includes(nombre))
            .map((nombre) => caches.delete(nombre)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.tipo === 'ACTUALIZAR') self.skipWaiting();
  // Al cerrar sesión se borran las respuestas de la API (pueden incluir borradores propios).
  if (event.data?.tipo === 'LIMPIAR_API') event.waitUntil(caches.delete(CACHE_API));
});

// ---------- Utilidades (práctica 4.2) ----------

/** Copia la respuesta agregando la fecha en que se guardó. */
async function conFecha(respuesta) {
  const cabeceras = new Headers(respuesta.headers);
  cabeceras.set(CABECERA_FECHA, Date.now().toString());
  const cuerpo = await respuesta.blob();
  return new Response(cuerpo, { status: respuesta.status, statusText: respuesta.statusText, headers: cabeceras });
}

/** true si la respuesta guardada tiene menos de maxSegundos. */
function esFresca(respuesta, maxSegundos) {
  const guardada = Number(respuesta?.headers.get(CABECERA_FECHA));
  if (!guardada) return false;
  return (Date.now() - guardada) / 1000 < maxSegundos;
}

/** Deja la caché en "maximo" entradas borrando las más antiguas. */
async function recortar(nombreCache, maximo) {
  const cache = await caches.open(nombreCache);
  const claves = await cache.keys();
  for (let i = 0; i < claves.length - maximo; i++) await cache.delete(claves[i]);
}

async function guardar(nombreCache, request, respuesta, limite) {
  const cache = await caches.open(nombreCache);
  await cache.put(request, await conFecha(respuesta));
  if (limite) await recortar(nombreCache, limite);
}

const sePuedeGuardar = (r) => r && r.ok && (r.type === 'basic' || r.type === 'cors');

// ---------- Estrategias ----------

/**
 * Cache-first: usa la copia si existe (y sigue fresca); si no, red y guarda.
 * ignoreVary: la precarga guarda sin cabecera Origin y los <script type="module"> sí la mandan;
 * si el servidor responde "Vary: Origin" (vite preview, algunos CDN) la copia no se encontraría
 * y sin conexión la app quedaría en blanco. Un archivo estático no cambia según quién lo pide.
 */
async function cacheFirst(request, { nombreCache, ttl, limite }) {
  const enCache = await caches.match(request, { ignoreVary: true });
  if (enCache && (!ttl || esFresca(enCache, ttl))) return enCache;
  try {
    const red = await fetch(request);
    if (sePuedeGuardar(red)) await guardar(nombreCache, request, red.clone(), limite);
    return red;
  } catch (error) {
    if (enCache) return enCache; // sin red: mejor una copia vieja que nada
    throw error;
  }
}

/** Network-first para la API: red y guarda; sin red, copia fresca o un ApiResponse de error. */
async function networkFirstApi(request) {
  try {
    const red = await fetch(request);
    if (sePuedeGuardar(red)) await guardar(CACHE_API, request, red.clone(), LIMITE_API);
    return red;
  } catch {
    const enCache = await caches.match(request);
    if (enCache && esFresca(enCache, TTL_API)) return enCache;
    return new Response(
      JSON.stringify({
        exito: false,
        mensaje: 'Estás sin conexión y esto aún no está guardado. Ábrelo una vez con internet para verlo después sin conexión.',
        datos: null,
        errores: null,
        fecha: new Date().toISOString(),
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

/**
 * Páginas: network-first con límite. Si la red no responde en 3 s (o falla) y hay index.html
 * guardado, se usa ese (la SPA resuelve la ruta); si no hay copia, se sigue esperando a la red.
 */
async function navegacion(request) {
  const red = fetch(request);
  red.catch(() => {}); // si gana la copia y luego la red falla, que no quede un rechazo suelto
  const respaldo = new Promise((resolver) => {
    setTimeout(async () => resolver(await caches.match('/index.html', { ignoreVary: true })), ESPERA_NAVEGACION_MS);
  });
  try {
    return await Promise.race([red, respaldo.then((copia) => copia ?? red)]);
  } catch {
    return (await caches.match('/index.html', { ignoreVary: true })) ?? Response.error();
  }
}

// ---------- Ruteo ----------

const EXTENSIONES_ESTATICAS = /\.(png|svg|webp|ico|webmanifest)$/;
const RUTAS_API_PUBLICAS = [/^\/api\/categorias(\/[^/]+)?$/, /^\/api\/muebles$/, /^\/api\/muebles\/(?!gestion$)[^/]+$/];

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin && request.mode === 'navigate') return event.respondWith(navegacion(request));

  // Va antes que los estáticos: en Docker el back comparte origen con la página (nginx).
  if (url.origin === API_ORIGEN) {
    if (url.pathname.startsWith('/uploads/')) {
      return event.respondWith(cacheFirst(request, { nombreCache: CACHE_ARCHIVOS, ttl: TTL_ARCHIVOS, limite: LIMITE_ARCHIVOS }));
    }
    if (RUTAS_API_PUBLICAS.some((r) => r.test(url.pathname))) return event.respondWith(networkFirstApi(request));
    if (url.pathname.startsWith('/api/')) return undefined;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/assets/')) return event.respondWith(cacheFirst(request, { nombreCache: CACHE_ESTATICO }));
    // Solo archivos estáticos conocidos: nunca /src, /@vite ni otras rutas del servidor de desarrollo.
    if (PRECACHE.includes(url.pathname) || EXTENSIONES_ESTATICAS.test(url.pathname)) {
      return event.respondWith(cacheFirst(request, { nombreCache: CACHE_ESTATICO, ttl: TTL_ESTATICO }));
    }
    return undefined;
  }

  if (ORIGENES_FUENTES.includes(url.origin)) {
    return event.respondWith(cacheFirst(request, { nombreCache: CACHE_FUENTES, ttl: TTL_ARCHIVOS }));
  }
  return undefined;
});
