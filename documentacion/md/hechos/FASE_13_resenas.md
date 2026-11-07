# FASE 13 · Me gusta, reseñas y mejores calificados

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§5, D1, D5 y D6)

## Objetivo

Que cualquier cuenta pueda dar "me gusta" a un mueble y que quien lo recibió deje una
reseña con estrellas y comentario. El catálogo ordena por mejor calificados y las
reseñas viven en su propia vista.

## Partes

- [x] 13a · Back
  - Módulo `resena/`: `MeGusta`, `Resena`, contadores en `Mueble` (`totalMeGusta`,
    `totalResenas`, `calificacion`).
  - Permisos `RESENA_CREAR` y `RESENA_MODERAR`.
  - Solo reseña quien tiene un pedido `ENTREGADO` del mueble; una por cliente y mueble.
  - Respuesta del vendedor (una), ocultar reseñas (admin), resumen con distribución.
  - Orden del catálogo `mejor-calificados` y `mas-gustados`.
  - `ResenaTest` con MySQL.
- [x] 13b · Front
  - Módulo `front/src/resenas/`: `resenasApi`, `Estrellas` (lectura y selector),
    `BotonMeGusta` (optimista; sin sesión lleva a `/entrar`), `ResumenResenas`,
    `TarjetaResena`, `HojaResena` y la página `ResenasPage`.
  - Detalle: calificación con enlace a `/mueble/:slug/resenas`, botón "me gusta" junto a
    las existencias y sección "Reseñas" con el resumen. Solo en muebles publicados.
  - Tarjetas del catálogo: estrella con el promedio cuando el mueble tiene reseñas.
  - Vista de reseñas: promedio, barras de 5 a 1, filtro por estrellas, orden (recientes,
    mejores, peores), lista paginada, escribir o editar la propia (`?escribir=1` abre la
    hoja) y responder (vendedor del mueble o moderador).
  - Pedido entregado: botón "Califica tu mueble". Inicio: sección "Mejor calificados"
    (solo aparece si algún mueble tiene reseñas). Catálogo: órdenes "Mejor calificados" y
    "Más gustados".
  - Panel: `/panel/resenas` con `RESENA_MODERAR` para buscar, ocultar y volver a mostrar.
- [x] 13c · Docs

## API (13a)

| Método | Ruta | Quién | Notas |
|---|---|---|---|
| PUT / DELETE | `/api/muebles/{id}/me-gusta` | cualquier cuenta | Idempotente; devuelve `{meGusta, total}` |
| GET | `/api/muebles/{id}/resenas?estrellas=&orden=` | público | Solo visibles; orden `recientes`, `mejores`, `peores` |
| GET | `/api/muebles/{id}/resenas/resumen` | público | Promedio, total, barras de 5 a 1, total de me gusta; con sesión también `meGusta`, `puedeResenar` y `miResena` |
| PUT | `/api/muebles/{id}/resenas` | `RESENA_CREAR` | Crea o edita la propia; 403 sin pedido entregado del mueble |
| POST | `/api/resenas/{id}/respuesta` | `MUEBLE_CREAR` | Solo el vendedor del mueble o el admin (403 si no) |
| GET | `/api/resenas?oculta=&buscar=` | `RESENA_MODERAR` | Moderación con el mueble de cada reseña |
| PATCH | `/api/resenas/{id}/oculta` | `RESENA_MODERAR` | Las ocultas no cuentan en el promedio |

- `Mueble` guarda `totalMeGusta`, `totalResenas` y `calificacion` (un decimal); se recalculan
  con un conteo en cada cambio. El catálogo ordena con `sort=calificacion,desc` o `sort=totalMeGusta,desc`.
- El autor se muestra como "Nombre I.". Una reseña nueva manda correo al vendedor.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 13a: `./mvnw verify` con 20 pruebas en verde (`ResenaTest`, 2 casos).
- 13b: `npm run lint` y `npm run build` sin errores; revisado a 390 px el detalle, la vista
  de reseñas y el catálogo ordenado por calificación.
