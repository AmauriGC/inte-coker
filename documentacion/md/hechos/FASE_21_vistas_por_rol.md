# FASE 21 · Cada rol con sus vistas: administrador supervisor y navegación por rol

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
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
- [x] 21c · Front: navegación por rol
  - `layout/useNavegacion.js`: una sola lista de secciones, filtrada con los permisos del rol
    activo. Da las pestañas de la bottom bar (cliente: Inicio, Catálogo, Favoritos, Avisos y
    Cuenta; transportista: Entregas, Avisos y Cuenta; con panel: sus 3 secciones principales,
    Avisos y Menú) y las secciones del menú lateral.
  - Vendedor: Muebles, Pedidos y Métricas. Administrador: Métricas, Solicitudes y Usuarios;
    Roles, Categorías, Reseñas y Pedidos (supervisión) van en el menú.
  - `MenuLateral`: secciones del rol, Tienda (Inicio, Catálogo, Favoritos, Comparar), Avisos,
    Mi cuenta, cambio de rol y cerrar sesión. Fijo en escritorio (`lg`) en el panel y también
    en la parte pública para quien tiene panel; en móvil es `CajonMenu` (botón "Menú").
  - `/panel` lleva a la primera sección del rol (`InicioPanel`); al entrar con un solo rol se
    va al inicio de ese rol.
  - Cuenta solo con lo personal; "Quiero vender" solo si la cuenta puede pedir y aún no
    publica muebles. Roles muestra los permisos fijos de ADMIN.
- [x] 21d · Docs
  - Este documento y el maestro.
- [x] 21e · Perfil y seguridad
  - Back: `PUT /api/cuenta/password` (`CambiarPasswordRequest`: actual, nueva y
    confirmación; avisa por correo) y `POST`/`DELETE /api/cuenta/portada` para cualquier
    rol; `UsuarioResponse` trae `portadaUrl`.
  - Front: el perfil tiene portada, foto y "Cambiar contraseña" (`HojaPassword`, con los
    requisitos marcados al escribir). Cuenta muestra Favoritos y Comparar solo si el rol
    activo ve el catálogo (`MUEBLE_VER`), así el transportista ya no los ve. En Usuarios el
    rol Transportista se ve marcado, con candado.

## Verificación

- Back: `./mvnw verify` en verde. `CatalogoTest` comprueba que el administrador no gestiona
  ni publica muebles y que la semilla queda a nombre del vendedor de ejemplo; `PedidoTest`,
  que el administrador no pide y que ADMIN no tiene `PEDIDO_CREAR`.

- Front: lint y build en verde. Revisado en el navegador como administrador: sidebar en
  escritorio, bottom bar y cajón en móvil (390 px), Roles con los 8 permisos fijos y el
  detalle de un mueble sin comprar, apartar ni preguntar.

## Notas

- Al reiniciar el back, ADMIN pierde los permisos de cliente, vendedor y transportista; hay
  que volver a entrar para que el token tenga los nuevos.
- Los pedidos que ya existían a nombre del administrador no se mueven.
