# ANÁLISIS · seguridad

| # | Severidad | Dónde | Qué pasa | Propuesta | Estado |
|---|---|---|---|---|---|
| 1 | Media | `POST /api/auth/login` | No hay límite de intentos: se puede probar contraseñas sin freno | Contador por correo e IP con bloqueo temporal (por ejemplo 5 intentos, 15 min) | Abierto |
| 2 | Baja | Refresh token | Es un JWT sin registro en base: no se puede revocar uno en particular antes de que caduque (7 días) | Si hace falta "cerrar sesión en todos lados", guardar el `jti` y revisarlo en `/refresh` | Abierto |
| 3 | Baja | `CorreoService` | El envío es síncrono: si el SMTP tarda, el registro tarda | Mandar el correo con `@Async` o un evento después del commit | Abierto |
