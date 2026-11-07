# FASE 17 · Transportista y método de pago

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
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
- [x] 17b · Front
  - `HojaComprar`: "¿Cómo vas a pagar?" (Efectivo o Tarjeta, sin valor por omisión) y
    envío de `metodoPago`. `estados.js` agrega `PAGOS`.
  - `AccionesPedido`: para el vendedor, un envío a domicilio muestra "Enviar pedido", que
    abre `HojaEnviar` ("Lo llevo yo" o un transportista con sus entregas en camino).
  - `PedidoPage`: datos "Pago" (con "cobrado" al cerrar) y "Lo lleva".
  - Módulo `entregas/`: `EntregasPage` (Por entregar y Hechas) y `EntregaPage` (monto por
    cobrar y método, mueble y color, quién recibe, "Abrir mapa", "Llamar", "Entregado y
    cobrado" y "No se pudo entregar" con motivo).
  - Rol `TRANSPORTISTA` en `roles.js` (inicio `/entregas`); con ese rol activo la bottom
    bar muestra Entregas, Avisos y Cuenta. "Mis entregas" en Cuenta.
- [x] 17c · Docs
  - Este documento y el maestro.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 17a: `./mvnw verify` con 30 pruebas en verde.
- 17b: lint y build en verde; revisadas en el navegador la protección de `/entregas` y la cuenta.
  El flujo completo requiere reiniciar el back y dar el rol Transportista a una cuenta.
