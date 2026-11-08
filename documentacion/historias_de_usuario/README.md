# Historias de usuario

Qué quiere hacer cada rol en GC-Confort y para qué. Cada historia se parte en tareas (back,
front, docs, infra o 3d) y cada tarea se liga con su PR. Lo mismo vive en el tablero
[GC-Confort-Project](https://github.com/users/AmauriGC/projects/2): la historia es un issue y
sus tareas son sub-issues.

## Archivos

| Archivo | Contenido |
|---|---|
| `PLANTILLA_HISTORIA.md` | Formato de la historia, de su tarjeta y de las tarjetas de tarea |
| `HU_<rol>.md` | Las historias de un rol, agrupadas por módulo |

| Rol | Historias | Hechas | Pendientes |
|---|---|---|---|
| [Invitado](HU_invitado.md) | 10 | 9 | 1 |
| [Cliente](HU_cliente.md) | 12 | 11 | 1 |
| [Vendedor](HU_vendedor.md) | 8 | 8 | 0 |
| [Transportista](HU_transportista.md) | 3 | 3 | 0 |
| [Administrador](HU_administrador.md) | 7 | 7 | 0 |
| [Sistema](HU_sistema.md) | 13 | 7 | 6 |

## Convenciones

- Identificador `HU-<letra del rol><nn>`: I invitado, C cliente, V vendedor, T transportista,
  A administrador, S sistema. Los números no se reutilizan.
- Estados: `Pendiente`, `En progreso` y `Hecha`. Una historia está hecha cuando todas sus
  tareas lo están y cumple sus criterios de aceptación.
- Commits y PRs citan la historia (`Refs: HU-C02`) y el PR cierra su tarea
  (`Closes #<tarea>`). `develop` es la rama por defecto, así que se cierra al fusionar.
- Una historia nueva se agrega a su `HU_<rol>.md`, a este índice y al tablero.

## En el tablero

| Pieza | Cómo |
|---|---|
| Historia | Issue con las etiquetas `historia` y `rol: <rol>` |
| Tarea | Sub-issue de la historia con la etiqueta de su capa (`back`, `front`, `docs`, `infra`, `3d`) |
| Avance | Campo "Sub-issues progress" |
| Dependencias | "Blocked by" entre historias |
| Agrupar | Campos `Rol`, `Módulo` y `Fase`, además de Priority y Size |

GitHub no impide arrastrar una tarjeta a Done. La regla es cerrar una historia solo cuando
no le quedan tareas abiertas ni historias que la bloqueen.

## Índice

| ID | Historia | Rol | Módulo | Prioridad | Tamaño | Estado | Depende de |
|---|---|---|---|---|---|---|---|
| HU-I01 | Explorar el catálogo | Invitado | catalogo | P0 | M | Hecha | HU-S01, HU-S03 |
| HU-I02 | Ver el mueble en 3D | Invitado | catalogo | P0 | L | Hecha | HU-I01, HU-S04 |
| HU-I03 | Cambiar el color en vivo | Invitado | catalogo | P1 | M | Hecha | HU-I02, HU-V02 |
| HU-I04 | Verlo en mi espacio con AR | Invitado | catalogo | P1 | M | Pendiente | HU-I02, HU-S08 |
| HU-I05 | Comparar muebles | Invitado | catalogo | P2 | S | Hecha | HU-I02 |
| HU-I06 | Conocer al vendedor | Invitado | vendedores | P1 | M | Hecha | HU-V06 |
| HU-I07 | Leer reseñas | Invitado | resenas | P1 | M | Hecha | HU-C07 |
| HU-I08 | Crear mi cuenta | Invitado | auth | P0 | M | Hecha | HU-S02 |
| HU-I09 | Entrar y recuperar mi contraseña | Invitado | auth | P0 | S | Hecha | HU-S02 |
| HU-I10 | Instalar la app y usarla sin conexión | Invitado | pwa | P1 | L | Hecha | HU-I01 |
| HU-C01 | Guardar favoritos | Cliente | favoritos | P1 | M | Hecha | HU-I08 |
| HU-C02 | Comprar un mueble | Cliente | pedidos | P0 | L | Hecha | HU-I08, HU-I02, HU-V01 |
| HU-C03 | Apartar con anticipo | Cliente | pedidos | P1 | M | Hecha | HU-C02 |
| HU-C04 | Preguntar al vendedor | Cliente | pedidos | P1 | M | Hecha | HU-I08 |
| HU-C05 | Seguir mis pedidos | Cliente | pedidos | P0 | M | Hecha | HU-C02 |
| HU-C06 | Avísame cuando haya | Cliente | pedidos | P2 | S | Hecha | HU-I08 |
| HU-C07 | Dar me gusta y reseñar | Cliente | resenas | P1 | M | Hecha | HU-C05 |
| HU-C08 | Mis direcciones | Cliente | cuenta | P2 | S | Hecha | HU-I08 |
| HU-C09 | Mi perfil y mi contraseña | Cliente | cuenta | P1 | M | Hecha | HU-I08 |
| HU-C10 | Pedir ser vendedor | Cliente | cuenta | P1 | S | Hecha | HU-I08 |
| HU-C11 | Mis avisos | Cliente | notificaciones | P1 | M | Hecha | HU-I08 |
| HU-C12 | Notificaciones push | Cliente | notificaciones | P2 | L | Pendiente | HU-C11, HU-S08 |
| HU-V01 | Publicar un mueble con su modelo 3D | Vendedor | muebles | P0 | L | Hecha | HU-S02, HU-A04 |
| HU-V02 | Existencias por color | Vendedor | muebles | P0 | M | Hecha | HU-V01 |
| HU-V03 | Atender mis pedidos | Vendedor | pedidos | P0 | L | Hecha | HU-V01, HU-C02 |
| HU-V04 | Confirmar apartados | Vendedor | pedidos | P1 | M | Hecha | HU-C03 |
| HU-V05 | Mis transportistas | Vendedor | transportistas | P1 | M | Hecha | HU-V03 |
| HU-V06 | Mi perfil de vendedor | Vendedor | vendedores | P1 | M | Hecha | HU-A04 |
| HU-V07 | Responder reseñas | Vendedor | resenas | P2 | S | Hecha | HU-C07 |
| HU-V08 | Mis métricas | Vendedor | metricas | P1 | L | Hecha | HU-V03 |
| HU-T01 | Activar mi cuenta | Transportista | auth | P1 | S | Hecha | HU-V05 |
| HU-T02 | Ver mis entregas | Transportista | entregas | P0 | M | Hecha | HU-T01, HU-V05 |
| HU-T03 | Confirmar la entrega | Transportista | entregas | P0 | S | Hecha | HU-T02 |
| HU-A01 | Gestionar categorías | Administrador | categorias | P1 | S | Hecha | HU-S02 |
| HU-A02 | Gestionar usuarios | Administrador | usuarios | P0 | M | Hecha | HU-S02 |
| HU-A03 | Roles y permisos | Administrador | usuarios | P1 | S | Hecha | HU-S02 |
| HU-A04 | Aprobar vendedores | Administrador | usuarios | P1 | S | Hecha | HU-C10 |
| HU-A05 | Moderar reseñas | Administrador | resenas | P2 | S | Hecha | HU-C07 |
| HU-A06 | Supervisar pedidos | Administrador | pedidos | P1 | M | Hecha | HU-C02 |
| HU-A07 | Métricas de la tienda | Administrador | metricas | P1 | S | Hecha | HU-V08 |
| HU-S01 | Base del back | Sistema | base | P0 | M | Hecha | — |
| HU-S02 | Seguridad multirol con JWT | Sistema | auth | P0 | L | Hecha | HU-S01 |
| HU-S03 | Base del front | Sistema | base | P0 | M | Hecha | HU-S01 |
| HU-S07 | Vistas y navegación por rol | Sistema | layout | P0 | M | Hecha | HU-S02 |
| HU-S04 | Modelos 3D de ejemplo | Sistema | modelos | P1 | L | Hecha | — |
| HU-S05 | Docker | Sistema | infra | P1 | M | Hecha | HU-S01 |
| HU-S06 | Jenkins | Sistema | infra | P1 | M | Hecha | HU-S05 |
| HU-S08 | HTTPS en la red local | Sistema | infra | P1 | M | Pendiente | HU-S05 |
| HU-S09 | Webhook de GitHub para Jenkins | Sistema | infra | P2 | S | Pendiente | HU-S06, HU-S08 |
| HU-S10 | Primera versión estable | Sistema | infra | P0 | S | Pendiente | HU-S06 |
| HU-S11 | Límite de intentos al entrar | Sistema | auth | P1 | M | Pendiente | HU-S02 |
| HU-S12 | Cerrar sesión en todos lados | Sistema | auth | P2 | M | Pendiente | HU-S02 |
| HU-S13 | Correos de cuenta en segundo plano | Sistema | auth | P2 | S | Pendiente | HU-S02 |
