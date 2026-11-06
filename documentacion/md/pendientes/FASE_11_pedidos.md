# FASE 11 · Pedidos y conversación cliente-vendedor

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (11a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_pedidos.md` (decisiones D1 a D5 tomadas)

## Objetivo

Que el cliente pueda preguntar por un mueble y pedirlo, y que cliente y vendedor hablen
dentro del pedido hasta la entrega. El pago se acuerda fuera de la app. Los muebles
llevan existencias que bajan cuando el vendedor acepta.

## Partes

- [x] 11a · Back (y el campo de existencias en el formulario del panel, para no romper `develop`)
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

## API (11a)

| Método | Ruta | Permiso | Qué hace |
|---|---|---|---|
| POST | `/api/pedidos` | `PEDIDO_CREAR` | Pide un mueble (convierte la consulta abierta si la había) |
| POST | `/api/pedidos/consultas` | `PEDIDO_CREAR` | Pregunta sin pedir (se suma a la consulta abierta) |
| GET | `/api/pedidos/compras?estado=` | `PEDIDO_CREAR` | Mis compras, paginado por actividad |
| GET | `/api/pedidos/ventas?estado=` | `PEDIDO_ATENDER` | Pedidos de mis muebles |
| GET | `/api/pedidos?estado=&buscar=` | `PEDIDO_SUPERVISAR` | Todos; `buscar` acepta folio, mueble o persona |
| GET | `/api/pedidos/resumen` | sesión | `comprasSinLeer`, `ventasSinLeer`, `ventasPorAtender` |
| GET | `/api/pedidos/{id}` | participantes y admin | Detalle con `lado`, `acciones`, `puedeEscribir`, `sinLeer` |
| PATCH | `/api/pedidos/{id}/estado` | según el estado | `{estado, motivo}`; motivo obligatorio al rechazar y si cancela un admin |
| PATCH | `/api/pedidos/{id}/solicitar` | `PEDIDO_CREAR` | Convierte mi consulta en pedido |
| GET | `/api/pedidos/{id}/mensajes?despuesDe=` | participantes y admin | Últimos 200, o solo los nuevos |
| POST | `/api/pedidos/{id}/mensajes` | cliente y vendedor | Mensaje (solo con el pedido abierto) |
| POST | `/api/pedidos/{id}/leido` | participantes | Marca la conversación como leída |

Notas de diseño:
- El folio (`GC-000123`) sale del id; no es columna.
- Las existencias se mueven con la fila bloqueada (`SELECT ... FOR UPDATE`) y se vuelven a leer.
- Los no leídos se cuentan con el id del último mensaje visto por cada lado; quien actúa
  (escribe o cambia el estado) queda al día.
- Un tercero recibe 404; quien ve el pedido pero no le toca la acción recibe 403.
- Los correos salen con `@Async` después del commit (`AvisosCorreoListener`), al vendedor
  por pregunta o pedido nuevo y al otro lado en cada cambio de estado; no hay correo por mensaje.
- `MuebleService` no conoce a pedidos: el bloqueo de borrado entra por `ReglaBorradoMueble`.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 11a: `./mvnw verify` con 18 pruebas en verde (`PedidoTest`, 5 casos); `npm run lint` y
  `npm run build` en verde.
- Revisión en el navegador por la persona dueña del proyecto con sus cuentas.
