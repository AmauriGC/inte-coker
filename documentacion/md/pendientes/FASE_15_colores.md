# FASE 15 · Colores en existencia y cambio de color en vivo

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§7 y D4)

## Objetivo

Que el vendedor registre los colores que tiene en existencia y que el cliente vea el
mueble cambiar de color en el visor 3D al tocar cada muestra, para comprarlo en el
color que eligió.

## Partes

- [ ] 15a · Back
  - `VarianteColor` (nombre, hex, existencias, orden; hasta 8 por mueble).
  - Existencias del mueble = suma de sus variantes cuando las tiene.
  - `Pedido.variante` y `varianteNombre`; descuento y devolución sobre la variante.
  - Pruebas con MySQL (existencias por color, color agotado, sin variantes).
- [ ] 15b · Front
  - Muestras sobre el visor; `baseColorFactor` del material `GC_Color` en tiempo real.
  - Color elegido en la hoja de compra y en el pedido.
  - Editor de variantes en el formulario del mueble.
- [ ] 15c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
