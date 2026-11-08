# FASE 22 · PWA más sólida: errores, iPhone, red lenta y tienda

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 07/11/2026

## Objetivo

Cerrar los huecos que salieron en la revisión de la PWA: que un error en una pantalla no
deje la app en blanco, que en iPhone se pueda instalar, que con señal débil abra rápido y
que el diálogo de instalación se vea como el de una tienda.

Decisiones tomadas con el usuario (07/11/2026): hacer los cinco puntos de la revisión y la
insignia de avisos; el AR queda para después y las notificaciones push reales quedan
documentadas en `md/analisis/ANALISIS_push.md`.

## Partes

- [x] 22a · Pantalla de error por ruta
  - `common/components/ErrorRuta.jsx` como `errorElement` de la raíz y de cada ruta del
    layout y del panel (`conError` en `app/router.jsx`), así la bottom bar y el menú siguen.
  - Distingue tres casos: sin conexión y la sección no está guardada; versión nueva
    publicada (falta un chunk, recarga sola una vez cada 30 s para no ciclar); error
    cualquiera ("Algo salió mal"). Botones Recargar e Ir al inicio.
- [x] 22b · Instalar en iPhone y iPad
  - `estadoPwa.js` detecta iOS (también el iPad que se presenta como Mac) y si la app ya
    está en inicio (`navigator.standalone`).
  - La hoja "Instala GC-Confort" muestra en iOS los pasos (Compartir y Agregar a inicio).
    El botón "Instalar la app" de Cuenta abre el diálogo del navegador o, en iOS, la guía.
- [x] 22c · Navegación con red lenta
  - En el service worker, las páginas siguen siendo network-first, pero si la red no
    responde en 3 s se abre el `index.html` guardado.
  - `cacheFirst` busca con `ignoreVary`: la precarga se guarda sin cabecera `Origin` y los
    `<script type="module">` sí la mandan; si el servidor responde `Vary: Origin` (vite
    preview, algunos CDN) la app quedaba en blanco sin conexión.
  - La versión de la caché ahora es el hash de la lista, del código del SW y del contenido
    de `public/`: cambiar el manifest o una estrategia también estrena caché.
- [x] 22d · Manifest
  - `orientation: any` (en tableta y escritorio ya no se fuerza vertical).
  - `screenshots`: dos de móvil y una de escritorio en `public/capturas/`, con etiquetas en
    español. No se precargan (solo las pide el diálogo de instalación).
- [x] 22e · Insignia de avisos
  - `ponerInsignia` (Badging API) pone en el icono de la app instalada el número de avisos
    sin leer; `AvisosProvider` la actualiza y la borra al cerrar sesión. Donde no existe
    (Firefox, Safari sin instalar) no hace nada.
- [x] 22f · Docs
  - Este documento, `ANALISIS_push.md` y el maestro.

## Verificación

- Front: lint y build en verde.
- Revisado con el build de producción (`vite preview` en 4173):
  - Sale el toast "Nueva versión lista"; al actualizar, la caché vieja se borra y el manifest
    nuevo trae `orientation` y las tres capturas.
  - Sin conexión real (servidor detenido): la app abre con su navegación desde la caché.
    Antes de `ignoreVary` esta misma prueba quedaba en blanco.

## Notas

- Las capturas del manifest se regeneran a mano si cambia mucho el diseño (390 x 844 a 2x y
  1280 x 800).
- iOS no tiene diálogo de instalación ni `beforeinstallprompt`; la guía es la única vía.
