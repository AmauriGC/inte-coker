# FASE 13 · Me gusta, reseñas y mejores calificados

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§5, D1, D5 y D6)

## Objetivo

Que cualquier cuenta pueda dar "me gusta" a un mueble y que quien lo recibió deje una
reseña con estrellas y comentario. El catálogo ordena por mejor calificados y las
reseñas viven en su propia vista.

## Partes

- [ ] 13a · Back
  - Módulo `resena/`: `MeGusta`, `Resena`, contadores en `Mueble` (`totalMeGusta`,
    `totalResenas`, `calificacion`).
  - Permisos `RESENA_CREAR` y `RESENA_MODERAR`.
  - Solo reseña quien tiene un pedido `ENTREGADO` del mueble; una por cliente y mueble.
  - Respuesta del vendedor (una), ocultar reseñas (admin), resumen con distribución.
  - Orden del catálogo `mejor-calificados` y `mas-gustados`.
  - `ResenaTest` con MySQL.
- [ ] 13b · Front
  - Botón "me gusta" con contador en el detalle y en las tarjetas.
  - Resumen de calificación en el detalle con enlace a `/mueble/:slug/resenas`.
  - Vista de reseñas: promedio, barras por estrellas, filtro, lista paginada, escribir y
    editar la propia, respuesta del vendedor.
  - "Califica tu mueble" en el pedido entregado; sección "Mejor calificados" en Inicio.
  - Moderación en el panel del admin.
- [ ] 13c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
