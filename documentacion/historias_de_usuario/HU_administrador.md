# Historias · Administrador

El administrador supervisa la tienda: categorías, usuarios, roles, solicitudes, reseñas,
pedidos y métricas globales. Ve el catálogo pero no compra, no vende, no atiende pedidos
ni entrega (fase 21). Formato en `PLANTILLA_HISTORIA.md`.

## categorias

### HU-A01 · Gestionar categorías

> **Como** administrador, **quiero** crear, editar y borrar categorías **para** que el catálogo
> esté ordenado.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| categorias | P1 | S | Hecha | 03, 05 | — |

**Criterios de aceptación**

- **Dado** Categorías, **cuando** creo una, **entonces** el nombre es único y el slug se genera
  solo.
- **Dado** una categoría con muebles, **cuando** intento borrarla, **entonces** no se permite.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `categoria`: CRUD paginado | #7 | — |
| front | `CategoriasPage` en el panel | #8 | — |

**Depende de:** HU-S02.

## usuarios

### HU-A02 · Gestionar usuarios

> **Como** administrador, **quiero** buscar usuarios, cambiar sus roles y activar o desactivar
> cuentas **para** mantener la tienda en orden.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| usuarios | P0 | M | Hecha | 02, 05, 20, 21 | — |

**Criterios de aceptación**

- **Dado** Usuarios, **cuando** busco, **entonces** veo la lista paginada con sus roles.
- **Dado** una cuenta, **cuando** cambio sus roles o la desactivo, **entonces** se aplica;
  no puedo quitarme ADMIN ni desactivarme.
- **Dado** un transportista, **cuando** lo veo, **entonces** su rol aparece marcado con
  candado: solo lo da un vendedor.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `usuario`: listado, roles y estado | #6 | — |
| front | `UsuariosPage` con roles múltiples y cuenta activa | #8 | — |
| back | El rol Transportista solo lo da el vendedor; Usuarios lo respeta | #47 | — |
| front | Chip de Transportista marcado con candado | #53 | — |

**Depende de:** HU-S02.

### HU-A03 · Roles y permisos

> **Como** administrador, **quiero** ver y ajustar los permisos de cada rol **para** decidir qué
> puede hacer cada quien.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| usuarios | P1 | S | Hecha | 02, 05, 21 | — |

**Criterios de aceptación**

- **Dado** Roles, **cuando** cambio los permisos de un rol, **entonces** se guardan.
- **Dado** el rol ADMIN, **cuando** lo veo, **entonces** muestra sus 8 permisos fijos de
  supervisión y no se puede modificar.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Módulo `rol`: roles, permisos y sincronización al arrancar | #6 | — |
| front | `RolesPage` | #8 | — |
| back | ADMIN con permisos fijos de supervisión | #50 | — |

**Depende de:** HU-S02.

### HU-A04 · Aprobar vendedores

> **Como** administrador, **quiero** aprobar o rechazar las solicitudes para vender **para**
> que solo vendan personas revisadas.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| usuarios | P1 | S | Hecha | 20 | — |

**Criterios de aceptación**

- **Dado** Solicitudes, **cuando** filtro por estado, **entonces** veo las pendientes,
  aprobadas o rechazadas.
- **Dado** una solicitud, **cuando** la apruebo, **entonces** la cuenta suma el rol Vendedor y
  su ciudad; si la rechazo, pongo el motivo. En los dos casos se avisa.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Revisar, aprobar y rechazar solicitudes | #45 | — |
| front | `SolicitudesPage` con filtros y motivo | #46 | — |

**Depende de:** HU-C10.

## resenas

### HU-A05 · Moderar reseñas

> **Como** administrador, **quiero** ocultar reseñas que no cumplen las reglas **para** que la
> calificación sea confiable.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| resenas | P2 | S | Hecha | 13 | — |

**Criterios de aceptación**

- **Dado** Reseñas en el panel, **cuando** busco y oculto una, **entonces** deja de verse y de
  contar en el promedio; puedo volver a mostrarla.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Listado de moderación y `PATCH /api/resenas/{id}/oculta` | #29 | — |
| front | Moderación en `/panel/resenas` | #30 | — |

**Depende de:** HU-C07.

## pedidos

### HU-A06 · Supervisar pedidos

> **Como** administrador, **quiero** ver todos los pedidos y cancelar los que haga falta
> **para** resolver problemas entre clientes y vendedores.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P1 | M | Hecha | 11, 21 | — |

**Criterios de aceptación**

- **Dado** Pedidos en el panel, **cuando** busco por folio, mueble o persona, **entonces**
  veo los pedidos de toda la tienda.
- **Dado** un pedido, **cuando** lo cancelo, **entonces** debo poner el motivo; no puedo
  comprar, aceptar, enviar ni entregar.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Todos los pedidos con búsqueda y cancelación con motivo | #23 | — |
| front | Vista "Todos" en el panel de pedidos | #25 | — |
| back | El administrador no compra ni atiende pedidos | #50 | — |

**Depende de:** HU-C02.

## metricas

### HU-A07 · Métricas de la tienda

> **Como** administrador, **quiero** ver las métricas de toda la tienda **para** saber cómo va
> el negocio.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| metricas | P1 | S | Hecha | 18 | — |

**Criterios de aceptación**

- **Dado** Métricas, **cuando** elijo "Toda la tienda", **entonces** veo los indicadores de
  todos los vendedores.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `tienda=true` con `METRICA_GLOBAL` | #39 | — |
| front | Filtro "Toda la tienda" en Métricas | #40 | — |

**Depende de:** HU-V08.
