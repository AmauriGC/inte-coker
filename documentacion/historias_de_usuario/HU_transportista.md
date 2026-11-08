# Historias · Transportista

Cuenta que registra un vendedor y que trabaja solo para él. Ve sus entregas y confirma la
entrega y el cobro. Formato en `PLANTILLA_HISTORIA.md`.

## auth

### HU-T01 · Activar mi cuenta

> **Como** transportista, **quiero** activar mi cuenta con la invitación del vendedor y poner
> mi contraseña **para** empezar a entregar.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P1 | S | Hecha | 20 | #86 |

**Criterios de aceptación**

- **Dado** el correo de invitación (72 h), **cuando** abro el enlace y pongo mi contraseña,
  **entonces** la cuenta queda verificada y puedo entrar.
- **Dado** que se venció la invitación, **cuando** el vendedor la reenvía, **entonces** me
  llega un enlace nuevo.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `POST /api/auth/activar` con token de invitación | #45 | #193 |
| front | `/activar` con la pantalla de contraseña | #46 | #194 |

**Depende de:** HU-V05.

## entregas

### HU-T02 · Ver mis entregas

> **Como** transportista, **quiero** ver mis entregas pendientes y hechas con dirección,
> teléfono y monto por cobrar **para** organizar mi ruta.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| entregas | P0 | M | Hecha | 17 | #87 |

**Criterios de aceptación**

- **Dado** Entregas, **cuando** lo abro, **entonces** veo "Por entregar" y "Hechas" (solo las
  mías).
- **Dado** una entrega en camino, **cuando** la abro, **entonces** veo el monto por cobrar y
  el método, el mueble y su color, quién recibe, "Abrir mapa" y "Llamar".
- **Dado** una entrega que ya no va en camino, **cuando** la abro, **entonces** no veo la
  dirección ni el teléfono.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `GET /api/entregas` y detalle, solo las propias | #37 | #195 |
| front | `EntregasPage` y `EntregaPage`; bottom bar del transportista | #38 | #196 |

**Depende de:** HU-T01, HU-V05.

### HU-T03 · Confirmar la entrega

> **Como** transportista, **quiero** marcar una entrega como entregada y cobrada, o no
> entregada con motivo, **para** que el vendedor y el cliente sepan qué pasó.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| entregas | P0 | S | Hecha | 17 | #88 |

**Criterios de aceptación**

- **Dado** una entrega en camino, **cuando** toco "Entregado y cobrado", **entonces** el
  pedido queda entregado con la fecha del cobro.
- **Dado** que no pude entregar, **cuando** pongo el motivo, **entonces** el pedido vuelve a
  aceptado sin transportista y el vendedor recibe aviso.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `entregada` y `no-entregada` con motivo | #37 | #197 |
| front | Botones de cierre en `EntregaPage` | #38 | #198 |

**Depende de:** HU-T02.
