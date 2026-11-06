# FASE 02 · seguridad

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU de registro, acceso y administración de usuarios (por escribir)

## Objetivo

Usuarios multirol con permisos, JWT sin sesión, verificación de correo y
recuperación de contraseña.

## Cambios

- [x] `rol/`: entidades `Rol` y `Permiso` (ManyToMany), enums `RolBase` y `PermisoBase`,
  listado y cambio de permisos por rol.
- [x] `usuario/`: entidad `Usuario` (multirol, `verificado`, `activo`), listado paginado
  con búsqueda, cambio de roles y activar o desactivar.
- [x] `security/`: `SecurityConfig`, `JwtService`, `JwtAuthenticationFilter`,
  `UsuarioPrincipal`, `UsuarioDetailsService`, `ManejadorErroresSeguridad` (401 y 403 en JSON).
- [x] `correo/`: `CorreoService` con plantillas HTML; con `MAIL_ENABLED=false` escribe el enlace en el log.
- [x] `auth/`: `TokenCorreo` (hash SHA-256, un solo uso, caduca), registro, login, refresh y recuperación.
- [x] `config/DatosIniciales`: roles, permisos y administrador del `.env` al arrancar.

## Roles y permisos iniciales

| Rol | Permisos |
|---|---|
| `ADMIN` | Todos (siempre; no se puede modificar) |
| `VENDEDOR` | `MUEBLE_VER`, `MUEBLE_CREAR`, `MUEBLE_EDITAR`, `MUEBLE_ELIMINAR` |
| `CLIENTE` | `MUEBLE_VER`, `FAVORITO_GESTIONAR` |

Permisos sin rol propio todavía: `CATEGORIA_GESTIONAR`, `USUARIO_GESTIONAR`, `ROL_GESTIONAR` (solo ADMIN).

## Endpoints

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/api/auth/registro` | público | Crea cuenta `CLIENTE` sin verificar y manda el correo |
| POST | `/api/auth/verificar` | público | `{token}` del enlace; deja la cuenta verificada |
| POST | `/api/auth/reenviar-verificacion` | público | `{email}`; mismo mensaje exista o no |
| POST | `/api/auth/login` | público | `{email, password}`; devuelve `accessToken` y `refreshToken` |
| POST | `/api/auth/refresh` | público | `{token}` = refresh token; devuelve un par nuevo |
| POST | `/api/auth/olvide-password` | público | `{email}`; mismo mensaje exista o no |
| POST | `/api/auth/restablecer-password` | público | `{token, password}` |
| GET | `/api/auth/yo` | con token | Perfil, roles y permisos |
| GET | `/api/usuarios?buscar=&page=&size=&sort=` | `USUARIO_GESTIONAR` | Listado paginado |
| GET | `/api/usuarios/{id}` | `USUARIO_GESTIONAR` | Detalle |
| PUT | `/api/usuarios/{id}/roles` | `USUARIO_GESTIONAR` | `{roles:[...]}`; no puedes quitarte ADMIN |
| PATCH | `/api/usuarios/{id}/estado` | `USUARIO_GESTIONAR` | `{activo}`; no puedes desactivarte |
| GET | `/api/roles` | `ROL_GESTIONAR` | Roles con permisos |
| GET | `/api/roles/permisos` | `ROL_GESTIONAR` | Todos los permisos |
| PUT | `/api/roles/{id}/permisos` | `ROL_GESTIONAR` | `{permisos:[...]}`; ADMIN no se toca |

Enlaces de los correos: `FRONTEND_URL/verificar?token=...` (24 h) y
`FRONTEND_URL/restablecer-password?token=...` (30 min). El front debe tener esas rutas.

## Pruebas

- `AuthFlowTest` (MockMvc contra MySQL `catalogo_muebles_test`), 5 casos en verde:
  flujo del cliente (registro, verificación, login, perfil, 403 en admin, refresh),
  401 sin token y con token falso, validaciones y correo repetido (409), recuperación
  de contraseña de un solo uso, y gestión de roles por el admin.
- `./mvnw verify`: 6 pruebas en verde.

## Pendientes al cerrar

- Probar el envío real por Gmail con `MAIL_ENABLED=true` y la contraseña de aplicación.
- Escribir las HU de este flujo en `historias_de_usuario/`.
- Sin límite de intentos de login todavía (ver `md/analisis/`).
