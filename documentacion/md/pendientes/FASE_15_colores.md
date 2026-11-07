# FASE 15 · Colores en existencia y cambio de color en vivo

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (15a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§7 y D4)

## Objetivo

Que el vendedor registre los colores que tiene en existencia y que el cliente vea el
mueble cambiar de color en el visor 3D al tocar cada muestra, para comprarlo en el
color que eligió.

## Partes

- [x] 15a · Back
  - `VarianteColor` (nombre, hex `#RRGGBB` en mayúsculas, existencias, orden; hasta 8
    por mueble; nombres sin repetir). Viajan en `MuebleRequest.variantes` (con `id` se
    editan, sin `id` se crean, las que faltan se borran) y en `MuebleResponse.variantes`.
  - Con colores, `Mueble.existencias` es la suma; sin colores todo sigue igual.
  - `Pedido`: `variante` (`SET_NULL`), `varianteNombre` y `varianteHex` (copias).
    `PedidoRequest` y `SolicitudRequest` reciben `varianteId` (obligatorio si el
    mueble tiene colores); `PedidoResponse.color` devuelve `{nombre, hex}`.
  - Al aceptar se descuenta del color con la fila del mueble bloqueada; al cancelar un
    pedido aceptado se devuelve a ese color.
  - Semilla: el Sillón Alba (modelo con `GC_Color`) trae Arena, Terracota, Salvia y Azul
    noche (agotado); si ya existía sin colores, se le agregan al arrancar.
  - `ColorTest` con MySQL (2 casos).
- [ ] 15b · Front
  - Muestras sobre el visor; `baseColorFactor` del material `GC_Color` en tiempo real.
  - Color elegido en la hoja de compra y en el pedido.
  - Editor de variantes en el formulario del mueble.
- [ ] 15c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 15a: `./mvnw verify` con 24 pruebas en verde.
