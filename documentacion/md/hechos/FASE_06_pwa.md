# FASE 06 · PWA

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU de instalación y modo sin conexión (por escribir)

## Objetivo

Que GC-Confort se instale como app y siga mostrando el catálogo, el detalle y los
modelos 3D ya vistos cuando no hay internet, con las estrategias de la práctica 4.2.

## Cambios

- [x] `public/manifest.webmanifest`: nombre, colores, `standalone`, atajos a Catálogo y Favoritos.
- [x] `public/iconos/`: 192 y 512 (`any`), 512 `maskable` y `apple-touch-icon` (generados con Edge sin interfaz desde el SVG del logo).
- [x] `pwa/sw.js`: service worker propio (plantilla).
- [x] `pwa/pluginSw.js`: plugin de Vite que al compilar rellena la versión, la lista de precarga y el origen de la API, y publica `/sw.js`.
- [x] `src/pwa/estadoPwa.js`: registro (solo producción), aviso de versión nueva, aviso de instalación y limpieza de la caché de la API.
- [x] `src/pwa/AvisosPwa.jsx`: toast "Nueva versión lista · Actualizar" y hoja "Instala GC-Confort" (no insiste en 7 días si se descarta).
- [x] Cuenta: botón "Instalar la app" cuando el navegador lo permite.
- [x] Al cerrar sesión se borra la caché de la API (puede tener borradores propios).

## Estrategias

| Recurso | Estrategia | Caché |
|---|---|---|
| Navegación (rutas de la SPA) | network-first; sin red responde `index.html` | `gc-estatico-<version>` |
| `/assets/*` (con hash) | cache-first sin TTL | `gc-estatico-<version>` |
| Iconos, imágenes y manifest propios | cache-first, TTL 7 días | `gc-estatico-<version>` |
| `/uploads/**` del back (`.glb`, imágenes) | cache-first, TTL 30 días, máximo 40 | `gc-archivos-v1` |
| GET públicos de `/api` (categorías, catálogo, detalle) | network-first, TTL 24 h, máximo 60; sin red ni copia: `ApiResponse` 503 | `gc-api-v1` |
| Google Fonts | cache-first, TTL 30 días | `gc-fuentes-v1` |

De la práctica 4.2 se conservan:
- Las cachés versionadas, con purga por lista blanca en `activate`.
- La fecha inyectada en la cabecera `x-sw-fecha` para el TTL.
- El límite de entradas en las cachés dinámicas.
- El respaldo en JSON cuando no hay red.

La versión nueva no se activa sola (sin `skipWaiting` en `install`): espera a que la
persona pulse "Actualizar".

## Decisiones

| Decisión | Motivo |
|---|---|
| Service worker propio en vez de Workbox | Lo pide la práctica y deja ver cada estrategia. |
| No se precarga `model-viewer` (~1 MB) | Se guarda al abrir el primer detalle; la primera visita queda ligera. |
| Solo rutas públicas de la API | `/gestion`, usuarios, roles y auth nunca se guardan. |
| En desarrollo se desregistra el service worker | Uno de `npm run preview` en el mismo puerto serviría archivos viejos a `npm run dev`. |

## Pruebas

- `npm run lint` y `npm run build` sin errores.
- Build de prueba con `vite preview` y el back en un puerto aparte:
  - Se llenan las cuatro cachés (estática, archivos, fuentes y API).
  - Con el back y el servidor del front apagados:
    - El catálogo y el detalle de Sofá Nube (con su modelo 3D) cargan desde la caché.
    - Un mueble nunca abierto muestra "Sin conexión" con el mensaje de cómo tenerlo disponible.
  - Con dos builds seguidas aparece el toast "Nueva versión lista"; "Actualizar" activa la nueva y purga la caché estática anterior.

## Pendiente

| Tema | Nota |
|---|---|
| AR en celular | Requiere HTTPS fuera de `localhost`; se probará con el despliegue (fases 8 y 9). |
| Hoja de instalación | Chrome solo lanza `beforeinstallprompt` tras cierta interacción; no se forzó en la prueba. |
