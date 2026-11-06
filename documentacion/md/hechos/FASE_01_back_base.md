# FASE 01 · back_base

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: (infraestructura, sin HU)

## Objetivo

Dejar la base común del back para que cada módulo siga las mismas reglas
(`documentacion/back/CONVENCIONES_BACK.md`).

## Cambios

- [x] Back: `common/response` con `ApiResponse` y `PaginaResponse`.
- [x] Back: `common/exception` con `ApiException`, `RecursoNoEncontradoException`,
  `RecursoDuplicadoException`, `ReglaNegocioException` y `GlobalExceptionHandler`.
- [x] Back: `common/entity/EntidadBase` (id y fechas de auditoría).
- [x] Back: `cors/CorsConfig` (orígenes desde `FRONTEND_URL`, admite varios separados por coma).
- [x] Back: `config/OpenApiConfig` (Swagger con esquema bearer).
- [x] Back: paginación por defecto 20 y máximo 100; health de correo apagado.
- [x] Config: `MAIL_ENABLED` y `DB_NAME_TEST` en `.env.example`.
- [x] Pruebas: `src/test/resources/application.properties` contra MySQL (`catalogo_muebles_test`).

## Pruebas

- `./mvnw verify`: 1 prueba (`contextLoads`) en verde contra MySQL 8.0.46.

## Pendientes al cerrar

- La seguridad por defecto de Spring sigue activa hasta la fase 02.
