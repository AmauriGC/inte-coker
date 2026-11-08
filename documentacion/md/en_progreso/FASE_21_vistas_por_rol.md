# FASE 21 · Cada rol con sus vistas: administrador supervisor y navegación por rol

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso
- Fecha: 07/11/2026

## Objetivo

Que cada rol vea y haga solo lo suyo. El administrador supervisa la tienda, pero no compra,
no vende, no atiende pedidos ni entrega: así nadie se salta los pasos de clientes y
vendedores. La navegación se arma con los permisos del rol activo.

Decisiones tomadas con el usuario (07/11/2026):

- El administrador conserva Métricas de toda la tienda, Solicitudes, Usuarios, Roles,
  Categorías, moderar reseñas, supervisar pedidos (ver todos y cancelar por moderación) y
  Favoritos. Puede ver el catálogo, pero no comprar.
- Los muebles de ejemplo pasan a un vendedor de ejemplo, que atiende sus pedidos.
- Bottom bar fija de hasta 5 pestañas (sin desplazamiento lateral); lo demás en un menú
  lateral. En escritorio, el menú lateral siempre visible para vendedor y administrador.

## Partes

- [x] 21a · Back: permisos del administrador
  - `RolBase.ADMIN` con permisos fijos: `MUEBLE_VER`, `FAVORITO_GESTIONAR`,
    `CATEGORIA_GESTIONAR`, `USUARIO_GESTIONAR`, `ROL_GESTIONAR`, `PEDIDO_SUPERVISAR`,
    `RESENA_MODERAR` y `METRICA_GLOBAL`. `RolService` los vuelve a poner al arrancar (quita
    los que sobren) y el rol sigue sin poder editarse.
  - `MuebleService`: el panel de muebles y modificar un mueble son solo del dueño; el
    administrador puede ver borradores. `ResenaService.responder`: solo el vendedor del
    mueble responde.
- [x] 21b · Back: vendedor de ejemplo
  - `UsuarioService.asegurarVendedorDemo` crea "Taller GC-Confort" (rol Vendedor) con
    `VENDEDOR_DEMO_EMAIL` y `VENDEDOR_DEMO_PASSWORD` del `.env`.
  - `SemillaCatalogoService.sembrarFaltantes(vendedor)` siembra a su nombre y pasa a él los
    ejemplos que estaban a nombre de otra cuenta.
- [ ] 21c · Front: navegación por rol
  - Bottom bar por rol, menú lateral (cajón en móvil, fijo en escritorio) y Cuenta solo con
    lo personal.
- [ ] 21d · Docs

## Verificación

- Back: `./mvnw verify` en verde. `CatalogoTest` comprueba que el administrador no gestiona
  ni publica muebles y que la semilla queda a nombre del vendedor de ejemplo; `PedidoTest`,
  que el administrador no pide y que ADMIN no tiene `PEDIDO_CREAR`.

## Notas

- Al reiniciar el back, ADMIN pierde los permisos de cliente, vendedor y transportista; hay
  que volver a entrar para que el token tenga los nuevos.
- Los pedidos que ya existían a nombre del administrador no se mueven.
