# Plantillas · historias de usuario y tarjetas

Tres piezas que cuadran entre sí:

1. La **historia en el repo** (`HU_<rol>.md`): una sección por historia.
2. La **tarjeta de la historia** en el tablero: un issue con la etiqueta `historia`.
3. Las **tarjetas de tarea** (back, front, docs, infra): sub-issues de la historia.

La historia no se cierra (ni pasa a Done) mientras tenga una tarea abierta o dependa de otra
historia que siga abierta.

## Identificadores

| Prefijo | Rol | Ejemplo |
|---|---|---|
| `HU-I` | Invitado (sin cuenta) | HU-I01 |
| `HU-C` | Cliente | HU-C02 |
| `HU-V` | Vendedor | HU-V01 |
| `HU-T` | Transportista | HU-T02 |
| `HU-A` | Administrador | HU-A04 |
| `HU-S` | Sistema (técnicas: base, seguridad, PWA, Docker, Jenkins) | HU-S05 |

Los números no se reutilizan. Commits y PRs las citan con `Refs: HU-C02`.

---

## 1. Historia en el repo

Va dentro de `HU_<rol>.md`, bajo el título del módulo.

```markdown
### HU-C02 · Comprar un mueble

> **Como** cliente, **quiero** comprar un mueble del catálogo **para** recibirlo en mi casa.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pedidos | P0 | L | Hecha | FASE 11, 17 | #40 |

**Criterios de aceptación**

- **Dado** un mueble con existencias, **cuando** elijo color, cantidad, dirección y método
  de pago y confirmo, **entonces** se crea el pedido y bajan las existencias.
- **Dado** un mueble sin existencias, **cuando** intento comprarlo, **entonces** veo
  "Sin existencias" y no se crea el pedido.

**Tareas**

| Capa | Tarea | Tarjeta |
|---|---|---|
| back | Crear pedido con dirección, color y método de pago | #41 |
| front | Hoja de compra en el detalle | #42 |

**Depende de:** HU-I07 (registrarme), HU-C08 (direcciones).
```

Estados: `Pendiente`, `En progreso`, `Hecha`.

---

## 2. Tarjeta de la historia

- **Título:** `HU-C02 · Comprar un mueble`
- **Etiquetas:** `historia`, `rol: cliente`
- **Campos del tablero:** Status, Priority, Size, Rol, Módulo, Fase

```markdown
> **Como** cliente, **quiero** comprar un mueble del catálogo **para** recibirlo en mi casa.

| Rol | Módulo | Fase | Prioridad | Tamaño |
|:---:|:---:|:---:|:---:|:---:|
| Cliente | pedidos | 11, 17 | P0 | L |

### Criterios de aceptación

- [ ] **Dado** un mueble con existencias, **cuando** elijo color, cantidad, dirección y
      método de pago y confirmo, **entonces** se crea el pedido y bajan las existencias.
- [ ] **Dado** un mueble sin existencias, **cuando** intento comprarlo, **entonces** veo
      "Sin existencias" y no se crea el pedido.

### Tareas

Aparecen abajo como sub-issues (back, front, docs). Cada una se cierra con su PR.

### Depende de

Marcadas como "Blocked by" en la tarjeta: HU-I07, HU-C08.

### Definición de terminado

- [ ] Todas las sub-issues cerradas
- [ ] Criterios de aceptación revisados en el navegador con el rol
- [ ] Back: `./mvnw verify` en verde
- [ ] Front: `npm run lint` y `npm run build` en verde
- [ ] Documentada en su fase y en `HU_cliente.md`

### Trazabilidad

- Fase: `documentacion/md/hechos/FASE_11_pedidos.md`
- PRs: #21, #22
```

---

## 3. Tarjeta de tarea

- **Título:** `HU-C02 · back · Crear pedido con dirección y método de pago`
- **Etiquetas:** `back` (o `front`, `docs`, `infra`), `rol: cliente`
- **Relación:** sub-issue de la historia

```markdown
**Historia:** HU-C02 · Comprar un mueble
**Capa:** Back · **Módulo:** `pedido`

### Qué se hace

Endpoint para crear el pedido con dirección, color y método de pago, y bajar existencias.

### Detalle técnico

| Elemento | Valor |
|---|---|
| Endpoints | `POST /api/pedidos` |
| Clases | `PedidoController`, `PedidoService`, `PedidoRequest` |
| Reglas | Sin existencias: `ReglaNegocioException` (400) |

### Hecho cuando

- [ ] Pruebas en `PedidoTest` contra MySQL de pruebas
- [ ] `./mvnw verify` en verde
- [ ] PR a `develop` con `Closes #41` y `Refs: HU-C02`
```

En una tarea de front, la tabla de detalle cambia a:

| Elemento | Valor |
|---|---|
| Rutas | `/mueble/:slug` |
| Componentes | `HojaComprar`, `DetallePage` |
| API | `pedidosApi.pedir` |
| Rol que la ve | Cliente (`PEDIDO_CREAR`) |
