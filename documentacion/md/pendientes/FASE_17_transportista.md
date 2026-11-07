# FASE 17 · Transportista y método de pago

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§9, D3 y D8)

## Objetivo

Que cada envío a domicilio tenga un transportista que sepa qué lleva, a dónde, a quién
llamar y si cobra en efectivo o con tarjeta, y que confirme la entrega y el cobro.

## Partes

- [ ] 17a · Back
  - Rol base `TRANSPORTISTA` con `ENTREGA_REALIZAR`.
  - `Pedido.metodoPago` (obligatorio al pedir), `transportista`, `asignadoEn`, `cobradoEn`.
  - Asignación al pasar a `EN_CAMINO`; `GET /api/transportistas`.
  - `GET /api/entregas` y acciones "Entregado y cobrado" y "No se pudo entregar".
  - Datos de entrega visibles solo para el transportista asignado y mientras el pedido siga abierto.
  - Pruebas con MySQL.
- [ ] 17b · Front
  - Método de pago en la hoja de compra.
  - Selector de transportista al enviar.
  - `/entregas` y `/entregas/:id` para el transportista, con su bottom bar (Entregas, Avisos, Cuenta).
- [ ] 17c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
