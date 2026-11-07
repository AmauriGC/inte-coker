# FASE 17 · Transportista y método de pago

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (17a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§9, D3 y D8)

## Objetivo

Que cada envío a domicilio tenga un transportista que sepa qué lleva, a dónde, a quién
llamar y si cobra en efectivo o con tarjeta, y que confirme la entrega y el cobro.

## Partes

- [x] 17a · Back
  - Rol base `TRANSPORTISTA` con `ENTREGA_REALIZAR` (`RolService` lo crea al arrancar).
  - `MetodoPago` (`EFECTIVO`, `TARJETA`): obligatorio en `POST /api/pedidos` y en
    `PATCH /api/pedidos/{id}/solicitar`; aparece en el mensaje del sistema del pedido.
  - `Pedido`: `metodoPago`, `transportista` (SET_NULL), `asignadoEn` y `cobradoEn`.
    `PedidoResponse` suma `metodoPago`, `transportista` y `cobradoEn`.
  - `PATCH /api/pedidos/{id}/estado` con `EN_CAMINO` acepta `transportistaId` (opcional;
    solo a domicilio y solo cuentas activas con `ENTREGA_REALIZAR`). Sin transportista lo
    entrega el vendedor; cuando el vendedor marca `ENTREGADO` queda registrado el cobro.
  - `GET /api/transportistas` (`PEDIDO_ATENDER`): activos y cuántas entregas llevan.
  - `GET /api/entregas?pendientes=true|false`, `GET /api/entregas/{id}`,
    `POST /api/entregas/{id}/entregada` y `POST /api/entregas/{id}/no-entregada`
    (`{motivo}`; el pedido vuelve a `ACEPTADO` sin transportista).
  - El transportista solo ve los suyos (404 a los demás), no entra a `/api/pedidos/{id}` ni
    a la conversación, y la dirección y el teléfono solo llegan mientras va `EN_CAMINO`.
  - `porCobrar`: el total, o 0 si fue un apartado ya liquidado.
  - `EntregaTest` con MySQL (2 casos).
- [ ] 17b · Front
  - Método de pago en la hoja de compra.
  - Selector de transportista al enviar.
  - `/entregas` y `/entregas/:id` para el transportista, con su bottom bar (Entregas, Avisos, Cuenta).
- [ ] 17c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 17a: `./mvnw verify` con 30 pruebas en verde.
