# Convenciones del back

> Reglas obligatorias para todo código en `back/`. Si algo no encaja, se discute en
> `md/analisis/` antes de romper la regla.

## 1. Paquetes por módulo

Paquete base `com.gc.back`. Lo transversal va en paquetes propios; cada tema de
negocio es un módulo con sus capas adentro.

```
com.gc.back
├── BackApplication.java
├── common/                  <- compartido por todos los módulos
│   ├── entity/              EntidadBase (id, creadoEn, actualizadoEn)
│   ├── response/            ApiResponse, PaginaResponse
│   ├── util/                Slug
│   └── exception/           ApiException, RecursoNoEncontrado, RecursoDuplicado,
│                            ReglaNegocio, GlobalExceptionHandler
├── cors/                    CorsConfig
├── config/                  OpenApiConfig, DatosIniciales, RecursosEstaticosConfig
├── security/                SecurityConfig, JWT, filtro, UserDetailsService
├── correo/                  envío de correos y plantillas
├── archivo/                 guardado de archivos subidos y validación de formato
└── <modulo>/                usuario, rol, auth, categoria, mueble...
    ├── entity/              entidades JPA y enums del dominio
    ├── dto/                 records de request (con validaciones) y response
    ├── repository/          interfaces JpaRepository
    ├── service/             TODA la lógica de negocio
    ├── controller/          solo recibe, delega y responde
    └── exception/           excepciones propias del módulo (opcional)
```

## 2. Responsabilidad de cada capa

| Capa | Hace | No hace |
|---|---|---|
| `controller` | Recibe la petición, `@Valid`, `@PreAuthorize`, llama un método del service y envuelve en `ApiResponse` | `if` de negocio, acceso a repositorios, armar entidades |
| `dto` | Define la forma de entrada y salida; las validaciones van aquí | Lógica; exponer entidades |
| `service` | Reglas de negocio, transacciones (`@Transactional`), mapeo entidad a DTO, lanzar excepciones | Saber de HTTP (`HttpServletRequest`, `ResponseEntity`) |
| `repository` | Consultas JPA (métodos derivados o `@Query`) | Lógica |
| `entity` | Mapeo a tablas | Exponerse en la API |

Un service puede usar otro service; no usa el repositorio de otro módulo.

## 3. DTO y validaciones

- Los DTO son `record`. Request: `<Accion>Request`; respuesta: `<Tema>Response`.
- Toda validación de forma va en el DTO con Bean Validation (`@NotBlank`, `@Email`,
  `@Size`, `@Pattern`...) y **mensaje en español** escrito en la anotación.
- El controller recibe `@Valid @RequestBody`.
- Las reglas que necesitan la base de datos (correo repetido, rol inexistente) van
  en el service y lanzan una excepción de negocio.
- El mapeo entidad a DTO vive en el DTO como `static desde(Entidad)`.

## 4. Respuestas

Todo responde `ApiResponse<T>`:

```json
{ "exito": true, "mensaje": "Cuenta creada", "datos": { }, "fecha": "2026-11-06T18:00:00Z" }
{ "exito": false, "mensaje": "Revisa los datos enviados", "errores": { "email": "El correo no es válido" }, "fecha": "..." }
```

- Crear responde `201`; el resto `200`.
- Los listados son paginados y devuelven `PaginaResponse<T>` (`contenido`, `pagina`,
  `tamano`, `totalElementos`, `totalPaginas`, `primera`, `ultima`). Parámetros
  `?page=0&size=20&sort=campo,desc`; tamaño máximo 100.
- Excepción permitida: catálogos fijos y pequeños (roles, permisos) se listan sin paginar.

## 5. Errores

- Nadie arma respuestas de error a mano: se lanza una excepción y
  `GlobalExceptionHandler` la convierte.
- Las de negocio extienden `ApiException`, que trae el estado HTTP:

| Excepción | Estado |
|---|---|
| `RecursoNoEncontradoException` | 404 |
| `RecursoDuplicadoException` | 409 |
| `ReglaNegocioException` | 400 |
| Propias del módulo (`<modulo>/exception`) | La que definan (401, 403...) |

- Validación 400, JSON mal formado 400, sin sesión 401, sin permiso 403, ruta
  inexistente 404, error no controlado 500 (se registra en el log, el usuario solo ve
  un mensaje genérico).

## 6. Entidades

- Extienden `EntidadBase`. Tablas en plural y `snake_case` (`usuarios`, `rol_permisos`).
- Lombok: `@Getter`, `@Setter`, `@NoArgsConstructor`. Nunca `@Data` en entidades.
- Relaciones `@ManyToOne` en `LAZY`. `open-in-view` está apagado: lo perezoso se lee
  dentro del service con `@Transactional`.
- Correos se guardan en minúsculas y sin espacios.

## 7. Seguridad

- JWT sin sesión. Rutas públicas declaradas en `SecurityConfig`; todo lo demás pide token.
- Permisos por método con `@PreAuthorize("hasAuthority('PERMISO')")` en el controller.
- Autoridades del usuario: sus permisos (`MUEBLE_CREAR`...) y sus roles con prefijo
  (`ROLE_ADMIN`...). Se cargan de la base en cada petición, así un cambio de rol o un
  bloqueo aplica sin esperar a que caduque el token.
- Contraseñas con BCrypt. Los tokens de los correos se guardan como hash SHA-256.

## 8. Archivos subidos

- Siempre por `archivo/service/AlmacenamientoService`; nadie escribe en disco por su cuenta.
- El formato se valida por la firma de bytes (`TipoArchivo`), nunca por la extensión
  ni por el `Content-Type` del cliente.
- En base se guarda la ruta relativa (`muebles/1/modelo-xxxx.glb`); la API devuelve
  `/uploads/...` y el front le antepone el origen del back.
- Cada subida usa un nombre nuevo y borra el anterior.

## 9. Configuración

- Todo valor sensible o que cambia por entorno sale del `.env` con `${VAR:default}`
  en `application.properties`. Clave nueva: también en `.env.example`.
- Propiedades propias bajo el prefijo `app.`.

## 10. Pruebas

- Corren contra **MySQL real** en la base `DB_NAME_TEST` (`catalogo_muebles_test`), que
  se crea y se borra en cada corrida. No se usa H2.
- Requisito: MySQL encendido y el `.env` con credenciales válidas.
- Toda prueba de integración **extiende `PruebaIntegracion`**: así comparten un solo
  contexto de Spring. Dos contextos distintos se borrarían la base entre sí.
- `PruebaIntegracion` trae helpers: `registrar`, `login`, `accessToken`,
  `usuarioConRoles(email, roles...)`, `enviar`.
- Como las pruebas comparten base, cada una usa correos y nombres propios y no
  supone totales exactos (usa filtros o `greaterThanOrEqualTo`).
- `./mvnw verify` debe pasar antes de abrir un PR.

## 11. Versiones (Spring Boot 4)

| Pieza | Nota |
|---|---|
| Jackson 3 | Paquete `tools.jackson.*`; las anotaciones siguen en `com.fasterxml.jackson.annotation` |
| Spring Data 4 | `PropertyReferenceException` está en `org.springframework.data.core` |
| Spring Security 7 | Sin `AntPathRequestMatcher`; `requestMatchers(String...)` usa `PathPatternRequestMatcher` |
| jjwt 0.12 | `Jwts.parser().verifyWith(clave).build().parseSignedClaims(token)` |
| Spring MVC 7 | `configureContentNegotiation` ya no afecta los recursos estáticos; para tipos MIME propios se declara un `ResourceHttpRequestHandler` con `setMediaTypes` |
