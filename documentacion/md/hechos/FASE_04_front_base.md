# FASE 04 · front base

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU de acceso y navegación (por escribir)

## Objetivo

Dejar la base del front: Vite + Tailwind v4 con los tokens del diseño, cliente de
la API con JWT, sesión, rutas, alertas, notificaciones, splash y navegación.

## Cambios

- [x] Proyecto creado con `create-vite` (React); dependencias: `tailwindcss`, `@tailwindcss/vite`,
  `react-router`, `motion`, `lucide-react`, `sweetalert2`, `@google/model-viewer`.
- [x] `vite.config.js`: plugins de React y Tailwind; lee el `.env` de la raíz (`envDir: '..'`).
- [x] `index.css`: tokens de color y fuentes, animaciones (flotar, sombra, brillo, trazo),
  esqueletos de carga, botones `gc-boton` y tema de SweetAlert2.
- [x] `common/api/cliente.js`: envuelve `ApiResponse`, manda el Bearer, renueva el token una sola
  vez ante un 401 y sube archivos con progreso (XHR).
- [x] `auth/`: `SesionProvider` (entrar, salir, permisos), `RutaProtegida`, pantallas de entrar y
  crear cuenta, verificar correo, olvidé y restablecer contraseña, y cuenta.
- [x] `notificaciones/`: bandeja de avisos guardada en el dispositivo (máximo 30), toasts animados
  con acción (Deshacer) y avisos de conexión perdida y recuperada.
- [x] `layout/`: splash animado, bottom bar con píldora animada y contador de avisos, transición
  entre pantallas, panel con barra lateral filtrada por permisos.

## Decisiones

| Decisión | Motivo |
|---|---|
| Sin librería de estado ni de peticiones | El alcance cabe en contextos y dos hooks (`useConsulta`, `useEnvio`). |
| El token de verificación se usa una sola vez por carga | StrictMode monta dos veces; el segundo intento fallaría con "token inválido". |
| Registro siempre como CLIENTE | El back no deja elegir rol; el rol de vendedor lo da un admin. El selector de rol del diseño se cambió por esa nota. |
| Splash de 1.6 s mínimo | Deja ver la animación completa sin frenar la carga real, que corre por detrás. |

## Pruebas

- `npm run lint` y `npm run build` sin errores.
- Manual contra el back local: inicio, catálogo con búsqueda, detalle, entrar, avisos,
  redirección de `/panel/muebles` a `/entrar` sin sesión, favorito con toast. Sin errores en consola.
