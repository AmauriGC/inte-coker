# FASE 11 · Pedidos y conversación cliente-vendedor

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_pedidos.md` (decisiones D1 a D5 tomadas)

## Objetivo

Que el cliente pueda preguntar por un mueble y pedirlo, y que cliente y vendedor hablen
dentro del pedido hasta la entrega. El pago se acuerda fuera de la app. Los muebles
llevan existencias que bajan cuando el vendedor acepta.

## Partes

- [ ] 11a · Back
  - `existencias` en `Mueble` (0 a 9999, por defecto 5 en la columna), request, response,
    semilla y pruebas.
  - Permisos `PEDIDO_CREAR`, `PEDIDO_ATENDER`, `PEDIDO_SUPERVISAR` y arreglo de
    `RolService` para que los roles base existentes reciban los permisos nuevos.
  - Módulo `pedido/`: `Pedido`, `MensajePedido`, máquina de estados, mensajes del sistema,
    no leídos, `resumen`.
  - Descuento de existencias al aceptar (condicionado) y devolución al cancelar aceptado.
  - Un mueble con pedidos abiertos no se borra.
  - Correos asíncronos: pedido nuevo al vendedor, cambio de estado al cliente.
  - `PedidoTest` con MySQL.
- [ ] 11b · Front cliente
  - "Comprar" y "Preguntar" en el detalle; existencias en catálogo y detalle.
  - Hoja de compra, "Mis pedidos", detalle con línea de tiempo y chat (cada 10 s).
  - Contador de no leídos (cada 30 s) y exclusión de `/api/pedidos` en el service worker.
- [ ] 11c · Front vendedor y admin
  - Existencias en el formulario y la tabla de muebles.
  - Sección "Pedidos" del panel con filtro, acciones por estado y contador en la sidebar.
- [ ] 11d · Docs
  - Mover esta fase a `hechos/`, actualizar el maestro y la guía.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- Revisión en el navegador por la persona dueña del proyecto con sus cuentas.
