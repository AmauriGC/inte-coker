# FASE 16 · Apartados con anticipo

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (16a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§8, D2 y D9)

## Objetivo

Que el cliente aparte un mueble dejando un anticipo que se acuerda fuera de la app. El
vendedor confirma el anticipo y la fecha límite; si no se liquida a tiempo, el apartado
vence solo y las existencias regresan.

## Partes

- [x] 16a · Back
  - Estados `APARTADO` (abierto) y `VENCIDO` (cerrado). `Pedido`: `apartado`,
    `anticipo`, `apartadoHasta`, `apartadoEn` y `avisoVencimiento`.
  - El cliente aparta con `apartar: true` en `POST /api/pedidos` o en
    `PATCH /api/pedidos/{id}/solicitar`; hasta 3 apartados abiertos (`SOLICITADO` o
    `APARTADO`) por cliente.
  - `PATCH /api/pedidos/{id}/apartado` (`PEDIDO_ATENDER`, solo el vendedor):
    `{anticipo, dias}` con anticipo menor que el total y plazo de 1 a 30 días. Descuenta
    existencias (del color, si lo hay) y deja un mensaje con lo que resta y la fecha límite.
  - `APARTADO → ACEPTADO` (liquidado, no vuelve a descontar), `APARTADO → CANCELADO`
    (cliente, vendedor con motivo o admin; devuelve existencias). `APARTADO` y `VENCIDO`
    no se piden por `/estado`.
  - `ApartadosProgramados` cada hora (`app.apartados.revision-ms`): vence los pasados de
    fecha (devuelve existencias y avisa a los dos) y avisa una vez al cliente cuando quedan
    menos de 24 horas.
  - `PedidoResponse.apartado`: `{anticipo, resta, hasta, confirmadoEn}` o null.
  - `AjustesEsquema`: al arrancar convierte `pedidos.estado` y `pedidos.tipo_entrega` de
    ENUM nativo de MySQL a VARCHAR(20); la entidad ya los mapea así para que un estado nuevo
    no rompa la base.
  - `ApartadoTest` con MySQL (2 casos).
- [ ] 16b · Front
  - Botón "Apartar" en el detalle y hoja con cantidad, color y mensaje.
  - Fecha límite y anticipo visibles en el pedido; diálogo del vendedor para confirmarlos.
- [ ] 16c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 16a: `./mvnw verify` con 26 pruebas en verde.
