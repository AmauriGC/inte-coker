# Convenciones del front

React 19 + Vite 8 + Tailwind CSS v4. Mismo criterio que el back: un módulo por
dominio y cada capa en su carpeta.

## Estructura

```
front/src/
  app/              config.js (API_URL, urlArchivo), router.jsx, paginasPanel.js (lazy)
  common/
    api/            cliente.js (fetch + ApiResponse + refresh), tokens.js
    alertas/        alertas.js (SweetAlert2: confirmar, exito, error, informar)
    components/     Boton, Campo, Selector, Hoja, ImagenMueble, EstadoVacio, Interruptor, Pagina, Logo
    hooks/          useConsulta, useEnvio, useRetraso, useEnLinea, useAlmacen
    utils/          formato.js (precio MXN, medidas, fechas), categorias.js (tinte e icono)
  layout/           Splash, BottomBar, LayoutMovil, LayoutPanel, SalidaAnimada, Encabezado
  pwa/              estadoPwa.js (registro, versión nueva, instalación), AvisosPwa.jsx, usePwa.js
  <modulo>/
    api/            llamadas al back de ese dominio
    context/        XContext.js (createContext + hook) y XProvider.jsx
    components/     piezas del módulo
    pages/          una pantalla por archivo, nombre terminado en Page
```

Módulos: `auth`, `catalogo`, `favoritos`, `notificaciones`, `vendedor`, `admin`.

## Reglas

| Tema | Regla |
|---|---|
| Llamadas al back | Solo desde `<modulo>/api/*`, siempre con `common/api/cliente.js`. Nunca `fetch` suelto en un componente. |
| Respuestas | `obtener()` devuelve `datos`; `peticion()` el `ApiResponse` completo. Los errores llegan como `ApiError` con `mensaje`, `estado` y `errores` (campo → mensaje). |
| Sesión | Tokens en `localStorage` (`gc.sesion`). Un 401 intenta un solo refresh compartido; si falla, se cierra la sesión y aparece un toast. |
| Permisos | La UI se filtra con `tienePermiso('MUEBLE_CREAR')`; el back sigue siendo quien decide. Rutas del panel envueltas en `RutaProtegida`. |
| Carga de datos | `useConsulta(fn, deps)`: conserva los datos al recargar, cancela con `AbortController`, `mutar()` para cambios locales. |
| Formularios | `useEnvio(accion)`; los mensajes de campo vienen del back (Bean Validation) y se muestran bajo cada `Campo`. |
| Contextos | `createContext` y el hook en `.js`; el Provider en `.jsx` (Fast Refresh solo admite componentes por archivo). |
| Alertas | Confirmaciones y éxitos importantes con SweetAlert2 (`common/alertas`). Avisos breves con `notificar()` (toast). |
| Animaciones | `motion/react`. Cada pantalla va dentro de `<Pagina>`; `MotionConfig reducedMotion="user"` respeta la preferencia del sistema. |
| Estilos | Tokens en `@theme` de `index.css` (`bg-crema`, `text-tinta`, `bg-terracota`...). Nada de colores sueltos salvo estados (error). |
| 3D | `@google/model-viewer` se importa bajo demanda en `Visor3D`; `ar-scale="fixed"` para escala real. |
| Archivos | `urlArchivo(ruta)` antepone el origen del back a `/uploads/...`. |
| Variables | Solo `VITE_API_URL`, leída del `.env` de la raíz (`envDir: '..'`). |

## PWA

- El service worker vive en `front/pwa/sw.js` (plantilla) y lo publica `pwa/pluginSw.js` al compilar.
  Solo se registra en producción; para probarlo: `npm run build` y `npm run preview`.
- Una ruta nueva de la API que deba verse sin conexión se agrega a `RUTAS_API_PUBLICAS` del service worker.
  Nunca rutas con datos privados.
- Imágenes del back con `crossOrigin="anonymous"` para que la caché guarde respuestas CORS y no opacas.
- Estrategias y cachés: `documentacion/md/hechos/FASE_06_pwa.md`.

## Nombres

- Componentes y páginas en PascalCase; hooks `useAlgo`; funciones y variables en español.
- Props de eventos con prefijo `al`: `alGuardar`, `alCerrar`, `alCambiar`.

## Verificación antes de un PR

```
cd front
npm run lint
npm run build
```
