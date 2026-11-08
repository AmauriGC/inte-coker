# Historias · Cliente

Persona con cuenta de cliente. Compra, aparta, pregunta, reseña y guarda en su cuenta.
Formato en `PLANTILLA_HISTORIA.md`.

## favoritos

### HU-C01 · Guardar favoritos

> **Como** cliente, **quiero** guardar muebles en favoritos y verlos en cualquier dispositivo
> **para** volver a ellos después.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| favoritos | P1 | M | Hecha | 05, 10 | #66 |

**Criterios de aceptación**

- **Dado** un mueble, **cuando** toco el corazón, **entonces** se guarda al instante y puedo
  deshacerlo desde el aviso.
- **Dado** que guardé favoritos sin sesión, **cuando** entro, **entonces** se suman a los de
  mi cuenta y los veo en cualquier dispositivo.
- **Dado** que el vendedor oculta un mueble, **cuando** abro favoritos, **entonces** ya no
  aparece; si lo vuelve a publicar, regresa.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| front | Favoritos en el dispositivo con aviso y Deshacer | #8 | #133 |
| back | Módulo `favorito`: guardar, quitar, listar y sincronizar | #15 | #134 |
| front | `FavoritosProvider` con modo cuenta y modo dispositivo | #15 | #135 |

**Depende de:** HU-I08.

## pedidos

### HU-C02 · Comprar un mueble

> **Como** cliente, **quiero** comprar un mueble eligiendo color, cantidad, entrega y forma de
> pago **para** recibirlo en mi casa.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P0 | L | Hecha | 11, 15, 17 | #67 |

**Criterios de aceptación**

- **Dado** un mueble con existencias, **cuando** elijo color, cantidad, domicilio o recoger,
  y efectivo o tarjeta y confirmo, **entonces** se crea el pedido y el vendedor recibe aviso.
- **Dado** un color sin piezas, **cuando** lo elijo, **entonces** el botón dice "Agotado en
  {color}" y no puedo pedirlo.
- **Dado** direcciones guardadas, **cuando** elijo envío a domicilio, **entonces** un toque
  llena los datos de entrega.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `pedido`: pedido, existencias y máquina de estados | #23 | #136 |
| front | "Comprar · precio" en el detalle y `HojaComprar` | #24 | #137 |
| back | Color elegido en el pedido y descuento por color | #33 | #138 |
| front | Color en `HojaComprar` sincronizado con el visor | #34 | #139 |
| back | Método de pago obligatorio | #37 | #140 |
| front | "¿Cómo vas a pagar?" en `HojaComprar` | #38 | #141 |
| docs | Análisis de pedidos y cierre de la fase 11 | #22, #26 | #142 |

**Depende de:** HU-I08, HU-I02, HU-V01.

### HU-C03 · Apartar con anticipo

> **Como** cliente, **quiero** apartar un mueble dejando un anticipo **para** asegurarlo
> mientras junto el resto.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P1 | M | Hecha | 16 | #68 |

**Criterios de aceptación**

- **Dado** un mueble con existencias, **cuando** toco "Apartar", **entonces** se crea la
  solicitud de apartado (hasta 3 abiertas por cliente).
- **Dado** un apartado confirmado, **cuando** abro el pedido, **entonces** veo anticipo, lo
  que resta y la fecha límite, resaltada si faltan menos de 24 horas.
- **Dado** que pasa la fecha límite, **cuando** no se liquidó, **entonces** el apartado vence
  solo y me avisan.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Estados `APARTADO` y `VENCIDO`, límite de 3 y vencimiento programado | #35 | #143 |
| front | Botón "Apartar", línea de tiempo y tarjeta del apartado | #36 | #144 |

**Depende de:** HU-C02.

### HU-C04 · Preguntar al vendedor

> **Como** cliente, **quiero** preguntar por un mueble y conversar con el vendedor **para**
> resolver dudas antes y después de comprar.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P1 | M | Hecha | 11 | #69 |

**Criterios de aceptación**

- **Dado** un detalle, **cuando** toco "Preguntar" y envío, **entonces** se abre una consulta
  (o se suma a la abierta) y el vendedor recibe aviso.
- **Dado** un pedido abierto, **cuando** escribo, **entonces** el otro lado ve el mensaje y
  los no leídos se cuentan por lado.
- **Dado** una consulta, **cuando** decido comprar, **entonces** se convierte en pedido.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Consultas, mensajes, no leídos y convertir consulta en pedido | #23 | #145 |
| front | `HojaPreguntar` y `Conversacion` | #24 | #146 |

**Depende de:** HU-I08.

### HU-C05 · Seguir mis pedidos

> **Como** cliente, **quiero** ver mis pedidos con su estado y su línea de tiempo **para**
> saber cuándo llega mi mueble.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P0 | M | Hecha | 11, 17 | #70 |

**Criterios de aceptación**

- **Dado** "Mis pedidos", **cuando** lo abro, **entonces** veo mis pedidos por actividad, con
  filtro por estado y no leídos.
- **Dado** un pedido, **cuando** lo abro, **entonces** veo la línea de tiempo, el pago, quién
  lo lleva y solo las acciones que me tocan.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Mis compras y resumen de no leídos | #23 | #147 |
| front | "Mis pedidos", detalle con línea de tiempo y contadores | #24 | #148 |
| front | Botones de acciones sin desbordar el texto | #48 | #149 |

**Depende de:** HU-C02.

### HU-C06 · Avísame cuando haya

> **Como** cliente, **quiero** que me avisen cuando vuelva a haber un mueble o color agotado
> **para** no estar revisando.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P2 | S | Hecha | 19 | #71 |

**Criterios de aceptación**

- **Dado** algo agotado, **cuando** toco "Avísame cuando haya", **entonces** queda el aviso
  (hasta 30 por cuenta) y puedo quitarlo con "Ya no avisarme".
- **Dado** que el vendedor sube existencias, **cuando** pasa, **entonces** me llega el correo
  y el aviso se borra.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `aviso` y correo con `ExistenciasCambiadas` | #41 | #150 |
| front | Botón "Avísame cuando haya" en el detalle | #42 | #151 |

**Depende de:** HU-I08.

## resenas

### HU-C07 · Dar me gusta y reseñar

> **Como** cliente, **quiero** dar me gusta y calificar un mueble que recibí **para** ayudar a
> otros a decidir.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| resenas | P1 | M | Hecha | 13 | #72 |

**Criterios de aceptación**

- **Dado** un mueble, **cuando** toco "me gusta", **entonces** cambia al instante.
- **Dado** un pedido entregado, **cuando** toco "Califica tu mueble", **entonces** dejo
  estrellas y comentario (una reseña por mueble, que puedo editar).
- **Dado** que no tengo el mueble entregado, **cuando** intento reseñar, **entonces** no se
  permite.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Me gusta y reseñas solo con pedido entregado; contadores en el mueble | #29 | #152 |
| front | `BotonMeGusta`, `HojaResena` y "Califica tu mueble" | #30 | #153 |

**Depende de:** HU-C05.

## cuenta

### HU-C08 · Mis direcciones

> **Como** cliente, **quiero** guardar mis direcciones **para** no escribirlas en cada compra.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| cuenta | P2 | S | Hecha | 19 | #73 |

**Criterios de aceptación**

- **Dado** "Mis direcciones", **cuando** agrego una, **entonces** se guarda (hasta 5) y la
  primera queda predeterminada.
- **Dado** que borro la predeterminada, **cuando** quedan otras, **entonces** la siguiente
  toma su lugar.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Direcciones de la cuenta con predeterminada | #41 | #154 |
| front | `DireccionesPage`, `HojaDireccion` y direcciones en `HojaComprar` | #42 | #155 |

**Depende de:** HU-I08.

### HU-C09 · Mi perfil y mi contraseña

> **Como** cliente, **quiero** editar mi nombre, foto y portada y cambiar mi contraseña
> **para** mantener mi cuenta al día y segura.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| cuenta | P1 | M | Hecha | 19, 21 | #74 |

Aplica a cualquier rol con sesión.

**Criterios de aceptación**

- **Dado** "Perfil y seguridad", **cuando** cambio nombre, foto o portada, **entonces** se
  guardan y se ven en Cuenta.
- **Dado** "Cambiar contraseña", **cuando** pongo la actual, la nueva y la confirmación,
  **entonces** se cambia y me llega un correo; si la actual no es correcta, veo el error.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `cuenta`: nombre y foto | #41 | #156 |
| front | `EditarPerfilPage` con foto y progreso | #42 | #157 |
| back | Portada y `PUT /api/cuenta/password` con aviso | #53 | #158 |
| front | Nuevo diseño del perfil, portada y `HojaPassword` | #52, #53 | #159 |

**Depende de:** HU-I08.

### HU-C10 · Pedir ser vendedor

> **Como** cliente, **quiero** solicitar vender en GC-Confort **para** publicar mis muebles.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| cuenta | P1 | S | Hecha | 20 | #75 |

**Criterios de aceptación**

- **Dado** Cuenta, **cuando** toco "Quiero vender" y envío ciudad, teléfono y qué vendo,
  **entonces** queda una solicitud pendiente (una a la vez).
- **Dado** mi solicitud, **cuando** la revisan, **entonces** veo si fue aprobada o rechazada
  con el motivo, y me llega aviso.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `SolicitudVendedor` del lado del cliente | #45 | #160 |
| front | `QuieroVenderPage` con el estado de la solicitud | #46 | #161 |
| front | "Quiero vender" ya no se queda cargando | #49 | #162 |

**Depende de:** HU-I08.

## notificaciones

### HU-C11 · Mis avisos

> **Como** cliente, **quiero** ver mis avisos en la cuenta y el número en el icono de la app
> **para** enterarme de lo que pasa con mis pedidos.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| notificaciones | P1 | M | Hecha | 20, 22 | #76 |

Aplica a cualquier rol con sesión.

**Criterios de aceptación**

- **Dado** un aviso nuevo, **cuando** llega, **entonces** veo un toast, el contador en la
  pestaña Avisos y el número en el icono de la app instalada.
- **Dado** Avisos, **cuando** toco uno, **entonces** se marca leído y me lleva a su pantalla;
  al deslizar se borra.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `notificacion`: un aviso por cada `AvisoCorreo` | #45 | #163 |
| front | `AvisosPage` y `AvisosProvider` desde la API | #46 | #164 |
| front | Insignia de avisos en el icono de la app | #55 | #165 |

**Depende de:** HU-I08.

### HU-C12 · Notificaciones push

> **Como** cliente, **quiero** recibir avisos en mi teléfono aunque la app esté cerrada
> **para** enterarme al momento de los cambios en mi pedido.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| notificaciones | P2 | L | Pendiente | `ANALISIS_push.md` | #77 |

**Criterios de aceptación**

- **Dado** Cuenta, **cuando** activo "Avisos en este teléfono", **entonces** el navegador pide
  permiso y queda la suscripción.
- **Dado** un cambio en mi pedido, **cuando** la app está cerrada, **entonces** me llega la
  notificación y al tocarla abre el pedido.
- **Dado** un iPhone sin la app instalada, **cuando** abro la opción, **entonces** veo la guía
  para instalarla.
- **Dado** que cierro sesión, **cuando** pasa, **entonces** el teléfono deja de recibir mis
  avisos.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| infra | Claves VAPID en `.env` y `.env.example` | — | #166 |
| back | Módulo `push`: `SuscripcionPush`, endpoints y envío después del commit | — | #167 |
| front | Service worker: `push`, `notificationclick` y `pushsubscriptionchange` | — | #168 |
| front | Interruptor "Avisos en este teléfono" y permiso en Cuenta | — | #169 |
| docs | Fase con lo hecho y prueba en el teléfono | — | #170 |

**Depende de:** HU-C11, HU-S08 (HTTPS en la red local).
