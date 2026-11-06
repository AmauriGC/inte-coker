# ANÁLISIS · Compra de muebles y comunicación cliente-vendedor

- Estado: Por decidir
- Fecha: 06/11/2026
- Relacionado: `MAESTRO_proyecto.md` (fase 11 propuesta), `back/CONVENCIONES_BACK.md`

## 1. Qué falta hoy

El cliente ve el mueble en 3D y en AR y lo guarda en favoritos, pero no tiene cómo
comprarlo ni cómo hablar con quien lo vende. El vendedor publica, pero no se entera de
que alguien está interesado. El ciclo se corta justo en la decisión de compra.

## 2. Propuesta en una frase

El cliente hace un **pedido** desde el detalle del mueble; el pedido es a la vez la
**conversación** con el vendedor (mensajes dentro del pedido) y el **seguimiento** (estados
hasta la entrega). El pago se acuerda entre ellos, fuera de la app.

## 3. Flujo

```
Cliente                                   Vendedor
───────                                   ────────
Detalle del mueble
  "Preguntar"  ──► CONSULTA ─────────────► ve la consulta y responde
  "Comprar"    ──► SOLICITADO ───────────► Aceptar  ──► ACEPTADO
     (cantidad, entrega, mensaje)          Rechazar ──► RECHAZADO (con motivo)
                                            Marcar enviado / listo ──► EN_CAMINO
  Confirma que lo recibió ◄──────────────── Marcar entregado ──► ENTREGADO
  Cancelar (antes de EN_CAMINO) ──► CANCELADO
Mensajes en cualquier estado abierto (los dos lados), con aviso de no leídos.
```

| Estado | Quién lo pone | Desde | Cierra el pedido |
|---|---|---|---|
| `CONSULTA` | Cliente ("Preguntar") | — | No |
| `SOLICITADO` | Cliente ("Comprar", o convertir la consulta) | — / `CONSULTA` | No |
| `ACEPTADO` | Vendedor | `SOLICITADO` | No |
| `RECHAZADO` | Vendedor (con motivo) | `CONSULTA`, `SOLICITADO` | Sí |
| `EN_CAMINO` | Vendedor | `ACEPTADO` | No |
| `ENTREGADO` | Vendedor o cliente | `EN_CAMINO` | Sí |
| `CANCELADO` | Cliente o administrador (con motivo) | `CONSULTA`, `SOLICITADO`, `ACEPTADO` | Sí |

Cada cambio de estado deja un mensaje del sistema en la conversación ("Pedido aceptado"),
así el hilo es también el historial.

## 4. Modelo de datos (back, módulo `pedido/`)

**`Pedido`** (`pedidos`)
- `folio` legible y único (`GC-000123`).
- `cliente` y `vendedor` (`Usuario`), `mueble` (`Mueble`, puede quedar en `null`).
- Copia del mueble al pedir: `muebleNombre`, `muebleSlug`, `muebleImagen`, `precioUnitario`.
  Si el vendedor cambia el precio o borra el mueble, el pedido conserva lo que se acordó.
- `cantidad` (1 a 10), `total`.
- `estado` y fechas por estado (`aceptadoEn`, `entregadoEn`...).
- Entrega: `tipoEntrega` (`DOMICILIO` / `RECOGER`), `nombreRecibe`, `telefono`, `direccion`,
  `ciudad`, `codigoPostal` (obligatorios solo para `DOMICILIO`).
- `motivoCierre` (rechazo o cancelación).
- `leidoClienteEn`, `leidoVendedorEn`: para contar mensajes no leídos sin otra tabla.

**`MensajePedido`** (`mensajes_pedido`)
- `pedido`, `autor` (`Usuario`, `null` = mensaje del sistema), `texto` (1 a 1000), `creadoEn`.

Llaves foráneas:
- `mensajes_pedido.pedido_id` → `ON DELETE CASCADE`.
- `pedidos.mueble_id` → `ON DELETE SET NULL` (el pedido sobrevive con su copia).
- Un mueble con pedidos **abiertos** no se puede borrar (400 "Tiene pedidos en curso;
  ocúltalo en su lugar"). Con pedidos cerrados, sí.

## 5. API

| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| POST | `/api/pedidos` | Cliente | Crea `CONSULTA` o `SOLICITADO` (201) |
| GET | `/api/pedidos/compras?estado=` | Cliente | Mis pedidos (paginado) |
| GET | `/api/pedidos/ventas?estado=` | Vendedor | Pedidos de mis muebles (paginado) |
| GET | `/api/pedidos?estado=&buscar=` | Admin | Todos (paginado, solo lectura y cancelar) |
| GET | `/api/pedidos/{id}` | Participantes y admin | Detalle |
| PATCH | `/api/pedidos/{id}/estado` | Según la tabla de estados | `{estado, motivo?}`; valida la transición |
| PATCH | `/api/pedidos/{id}/solicitar` | Cliente | Convierte su consulta en pedido (con datos de entrega) |
| GET | `/api/pedidos/{id}/mensajes?despuesDe=` | Participantes y admin | Mensajes; `despuesDe` (id) para traer solo los nuevos |
| POST | `/api/pedidos/{id}/mensajes` | Participantes | Envía un mensaje (solo en pedidos abiertos) |
| POST | `/api/pedidos/{id}/leido` | Participantes | Marca la conversación como leída |
| GET | `/api/pedidos/resumen` | Con sesión | `{comprasSinLeer, ventasSinLeer, ventasPorAtender}` para los avisos |

Reglas en el service:
- Solo muebles publicados; nadie compra su propio mueble.
- Una sola `CONSULTA` abierta por cliente y mueble (si ya existe, se reutiliza).
- Un tercero que pide un pedido ajeno recibe **404** (no se revela que existe).
- Transición inválida: 400 con mensaje claro ("Un pedido entregado ya no se puede cancelar").

## 6. Permisos

Nuevos en `PermisoBase`:

| Permiso | Para | Roles base |
|---|---|---|
| `PEDIDO_CREAR` | Preguntar, comprar, ver mis compras, cancelar | CLIENTE, ADMIN |
| `PEDIDO_ATENDER` | Ver y atender pedidos de mis muebles | VENDEDOR, ADMIN |
| `PEDIDO_SUPERVISAR` | Ver todos los pedidos y cancelar por moderación | ADMIN |

**Hallazgo:** `RolService.asegurarRolesYPermisos` solo arma los roles cuando no existen
(ADMIN siempre recibe todos). CLIENTE y VENDEDOR ya existen en tu base, así que **no
recibirían los permisos nuevos**. Arreglo: cuando un permiso se crea por primera vez,
se agrega a los roles base que lo traen en `RolBase`. No pisa cambios hechos desde el
panel de roles porque solo actúa sobre permisos recién creados.

## 7. Comunicación y avisos

| Canal | Cuándo | Cómo |
|---|---|---|
| Hilo de mensajes | Siempre | Dentro del pedido; se actualiza cada 10 s mientras está abierto |
| Contadores en la app | Siempre | `GET /resumen` cada 30 s con la pestaña visible: punto en "Pedidos" y toast si sube |
| Correo | Pedido nuevo (al vendedor), cambio de estado (al cliente) | Plantillas nuevas en `correo/`; envío **asíncrono** después de guardar (`@Async` + evento al confirmar la transacción) para no frenar la respuesta |
| Correo por mensaje | No por cada mensaje | Se evita llenar el buzón; el contador basta |

**Hallazgo:** hoy `CorreoService` envía dentro de la petición. Con correos por pedido,
cada acción tardaría lo que tarde Gmail (1 a 3 s). Por eso el envío pasa a asíncrono.

Datos privados (dirección, teléfono): solo los ven el cliente, el vendedor de ese pedido
y el administrador. El service worker **no** guarda `/api/pedidos` (no es público).

## 8. Front

**Cliente**
- Detalle del mueble: botones "Comprar" (principal) y "Preguntar" (secundario) junto a
  "Ver en mi espacio". Sin sesión, llevan a entrar y regresan al mueble.
- Hoja "Comprar": cantidad, tipo de entrega, datos de entrega (se recuerdan del último
  pedido), mensaje opcional y total.
- "Mis pedidos" (`/pedidos`): lista con estado y no leídos; acceso desde Cuenta y avisos.
- Detalle del pedido (`/pedidos/:id`): resumen, línea de tiempo de estados, chat y
  acciones (cancelar, confirmar recibido, convertir consulta en pedido).

**Vendedor (panel)**
- Sección "Pedidos" (`/panel/pedidos`): tabla con filtro `<select>` por estado, punto
  de no leídos y conteo de "por atender" en la sidebar.
- Detalle en el panel: datos de entrega, chat y botones según el estado (Aceptar,
  Rechazar con motivo, Marcar en camino, Marcar entregado).

**Administrador:** la misma sección con todos los pedidos y la opción de cancelar.

## 9. Fuera de alcance (por ahora)

- Pago en línea (pasarela). Se puede agregar después con una pasarela en modo prueba.
- Carrito con varios muebles: cada pedido es un mueble con cantidad (los muebles pueden
  ser de vendedores distintos).
- Inventario o existencias.
- Chat en tiempo real con WebSocket y notificaciones push: se usa consulta periódica.
- Reseñas y calificaciones.

## 10. Decisiones que necesita el dueño del proyecto

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 | ¿Cómo se paga? | a) Se acuerda fuera de la app · b) Pasarela en modo prueba | a) |
| D2 | ¿Se puede preguntar sin comprar? | a) Sí, estado `CONSULTA` · b) Solo mensajes dentro de un pedido | a) |
| D3 | ¿Inventario? | a) Sin existencias (bajo pedido) · b) Campo de existencias que baja al aceptar | a) |
| D4 | ¿Tipos de entrega? | a) Domicilio y recoger · b) Solo domicilio | a) |
| D5 | ¿Mensajes en tiempo real? | a) Consulta cada 10 s · b) WebSocket | a) |

## 11. Plan de trabajo (fase 11)

| Parte | Contenido | Pruebas |
|---|---|---|
| 11a · Back | Permisos nuevos (con el arreglo del §6), módulo `pedido`, mensajes, resumen, regla de borrado de muebles, correos asíncronos | `PedidoTest`: flujo completo, transiciones inválidas, privacidad (404 a terceros), permisos, no leídos, borrado de mueble |
| 11b · Front cliente | Comprar y Preguntar, Mis pedidos, detalle con chat, contador | lint + build; revisión en navegador |
| 11c · Front vendedor y admin | Sección Pedidos del panel, acciones por estado, contador en la sidebar | lint + build; revisión en navegador |
| 11d · Docs | `FASE_11_pedidos.md`, maestro, guía | — |

Cada parte va en su propia rama y PR hacia `develop`.
