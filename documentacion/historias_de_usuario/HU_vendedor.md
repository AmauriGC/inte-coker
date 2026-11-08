# Historias · Vendedor

Cuenta con rol Vendedor (aprobada por un administrador). Publica sus muebles, atiende sus
pedidos, maneja sus transportistas y ve sus métricas. Formato en `PLANTILLA_HISTORIA.md`.

## muebles

### HU-V01 · Publicar un mueble con su modelo 3D

> **Como** vendedor, **quiero** crear un mueble con su modelo 3D y su imagen y publicarlo
> **para** venderlo en el catálogo.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| muebles | P0 | L | Hecha | 03, 05, 21 | #78 |

**Criterios de aceptación**

- **Dado** el panel, **cuando** creo un mueble, **entonces** queda como borrador.
- **Dado** un borrador, **cuando** subo el `.glb` (hasta 30 MB) y la imagen (PNG, JPG o WEBP,
  hasta 5 MB), **entonces** veo el progreso y se validan por su contenido, no por la extensión.
- **Dado** un mueble sin modelo o sin imagen, **cuando** intento publicarlo, **entonces** no se
  permite.
- **Dado** un mueble de otro vendedor, **cuando** intento modificarlo, **entonces** no se
  permite (tampoco al administrador).

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `mueble`: CRUD, subida de modelo e imagen y publicación | #7 | #171 |
| front | Panel de muebles: tabla, tarjetas, formulario, subida con progreso y publicar | #8 | #172 |
| front | Ver un mueble sin salir del panel | #19 | #173 |
| back | Solo el dueño gestiona sus muebles | #50 | #174 |

**Depende de:** HU-S02, HU-A04.

### HU-V02 · Existencias por color

> **Como** vendedor, **quiero** registrar mis existencias por color **para** vender solo lo que
> tengo.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| muebles | P0 | M | Hecha | 11, 15 | #79 |

**Criterios de aceptación**

- **Dado** el formulario, **cuando** agrego colores (hasta 8, con nombre, muestra y piezas),
  **entonces** las existencias del mueble son la suma y no se editan aparte.
- **Dado** que acepto un pedido, **cuando** pasa, **entonces** bajan las piezas de ese color;
  si se cancela, regresan.
- **Dado** 0 piezas, **cuando** veo la tabla o el catálogo, **entonces** dice "Agotado".

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Existencias en el mueble con descuento al aceptar | #23 | #175 |
| front | Existencias en el formulario y la tabla del panel | #25 | #176 |
| back | `VarianteColor` y descuento por color | #33 | #177 |
| front | `EditorColores` en el formulario | #34 | #178 |

**Depende de:** HU-V01.

## pedidos

### HU-V03 · Atender mis pedidos

> **Como** vendedor, **quiero** aceptar, rechazar, enviar y entregar mis pedidos y conversar con
> el cliente **para** cerrar cada venta.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P0 | L | Hecha | 11, 17 | #80 |

**Criterios de aceptación**

- **Dado** un pedido nuevo, **cuando** llega, **entonces** me avisan y el contador de la
  sección Pedidos sube.
- **Dado** un pedido, **cuando** lo abro, **entonces** solo veo las acciones de su estado;
  rechazar pide motivo.
- **Dado** un envío a domicilio, **cuando** toco "Enviar pedido", **entonces** elijo "Lo llevo
  yo" o uno de mis transportistas.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Ventas del vendedor y acciones por estado | #23 | #179 |
| front | `PanelPedidosPage`, detalle en el panel y contadores | #25 | #180 |

**Depende de:** HU-V01, HU-C02.

### HU-V04 · Confirmar apartados

> **Como** vendedor, **quiero** confirmar el anticipo y el plazo de un apartado **para**
> reservar la pieza sin perder la venta.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P1 | M | Hecha | 16 | #81 |

**Criterios de aceptación**

- **Dado** una solicitud de apartado, **cuando** confirmo anticipo (menor al total) y plazo
  (1 a 30 días), **entonces** se descuentan las piezas y el pedido muestra lo que resta.
- **Dado** un apartado, **cuando** el cliente liquida, **entonces** lo marco como liquidado
  sin volver a descontar.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `PATCH /api/pedidos/{id}/apartado`, liquidar y cancelar | #35 | #181 |
| front | `HojaConfirmarApartado` y acciones del apartado | #36 | #182 |

**Depende de:** HU-C03.

## transportistas

### HU-V05 · Mis transportistas

> **Como** vendedor, **quiero** registrar a mis transportistas y asignarles mis envíos **para**
> que lleven los muebles a mis clientes.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| transportistas | P1 | M | Hecha | 17, 20 | #82 |

**Criterios de aceptación**

- **Dado** "Mis transportistas", **cuando** registro nombre, correo y teléfono, **entonces** se
  crea la cuenta y le llega una invitación de 72 h; puedo reenviarla.
- **Dado** un transportista, **cuando** lo doy de baja, **entonces** ya no aparece al enviar.
- **Dado** un envío, **cuando** asigno transportista, **entonces** solo puedo elegir los míos
  activos y con la cuenta activada.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Asignar transportista al enviar | #37 | #183 |
| front | `HojaEnviar` con "Lo llevo yo" o un transportista | #38 | #184 |
| back | Transportistas del vendedor, invitación y baja | #45 | #185 |
| front | "Mis transportistas" y `HojaTransportista` | #46 | #186 |

**Depende de:** HU-V03.

## vendedores

### HU-V06 · Mi perfil de vendedor

> **Como** vendedor, **quiero** editar mi presentación y mi galería de trabajos **para** que los
> clientes me conozcan.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| vendedores | P1 | M | Hecha | 14 | #83 |

**Criterios de aceptación**

- **Dado** "Mi perfil", **cuando** cambio portada, foto, ciudad o presentación, **entonces** se
  ve en mi perfil público.
- **Dado** la galería, **cuando** agrego, edito, ordeno o borro trabajos (hasta 24),
  **entonces** el perfil los muestra en ese orden.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Slug, presentación, foto, portada y `TrabajoVendedor` | #31 | #187 |
| front | `MiPerfilPage` con galería | #32 | #188 |

**Depende de:** HU-A04.

## resenas

### HU-V07 · Responder reseñas

> **Como** vendedor, **quiero** responder las reseñas de mis muebles **para** atender lo que
> dicen mis clientes.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| resenas | P2 | S | Hecha | 13, 21 | #84 |

**Criterios de aceptación**

- **Dado** una reseña de mi mueble, **cuando** respondo, **entonces** la respuesta aparece
  debajo (una por reseña).
- **Dado** una reseña de otro vendedor, **cuando** intento responder, **entonces** no se
  permite.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Respuesta del vendedor; solo el dueño del mueble | #29, #50 | #189 |
| front | Responder desde `ResenasPage` | #30 | #190 |

**Depende de:** HU-C07.

## metricas

### HU-V08 · Mis métricas

> **Como** vendedor, **quiero** ver mis ventas, zonas, muebles más vistos y conversión **para**
> decidir qué vender.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| metricas | P1 | L | Hecha | 18 | #85 |

**Criterios de aceptación**

- **Dado** Métricas, **cuando** elijo 7, 30 o 90 días, **entonces** veo ingresos, piezas,
  conversión, calificación, la gráfica de ingresos, tiempos, pagos, zonas y muebles.
- **Dado** que veo mi propio mueble, **cuando** abro el detalle, **entonces** esa vista no se
  cuenta.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `VistaMueble` y `GET /api/metricas` | #39 | #191 |
| front | Sección Métricas con `GraficaSerie` y tablas | #40 | #192 |

**Depende de:** HU-V03.
