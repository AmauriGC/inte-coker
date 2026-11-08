# Historias · Sistema

Historias técnicas y transversales: lo que el equipo necesita para que las demás funcionen
(base, seguridad, modelos 3D, Docker, Jenkins, navegación por rol) y los pendientes de
infraestructura y seguridad. Formato en `PLANTILLA_HISTORIA.md`.

## base

### HU-S01 · Base del back

> **Como** equipo, **quiero** una base común de respuestas, errores, CORS y Swagger **para**
> que todos los módulos sigan las mismas reglas.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| base | P0 | M | Hecha | 00, 01 | — |

**Criterios de aceptación**

- **Dado** cualquier endpoint, **cuando** responde, **entonces** usa `ApiResponse` y los
  errores salen de `GlobalExceptionHandler` con mensajes en español.
- **Dado** un listado, **cuando** se pide, **entonces** es paginado (20 por omisión, 100 como
  máximo).
- **Dado** las pruebas, **cuando** corren, **entonces** usan MySQL `catalogo_muebles_test`.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| docs | Estándar de documentación y flujo de Git | #1 | — |
| back | Proyecto base de Spring Boot y variables de entorno | #2 | — |
| back | Base modular: respuestas, errores, CORS y Swagger | #5 | — |
| docs | Plan de las fases 12 a 19 | #27 | — |

**Depende de:** nada.

### HU-S02 · Seguridad multirol con JWT

> **Como** equipo, **quiero** cuentas con varios roles, permisos y JWT sin sesión **para** que
> cada persona haga solo lo que su rol permite.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P0 | L | Hecha | 02, 04 | — |

**Criterios de aceptación**

- **Dado** un endpoint protegido, **cuando** llega sin token o sin permiso, **entonces**
  responde 401 o 403 en JSON.
- **Dado** el arranque, **cuando** sube el back, **entonces** se sincronizan roles, permisos y
  el administrador del `.env`.
- **Dado** el front, **cuando** un token vence, **entonces** se renueva una sola vez y la
  sesión sigue.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Roles, permisos, JWT, filtro, correos y datos iniciales | #6 | — |
| front | `SesionProvider`, `RutaProtegida` y cliente de la API con renovación | #8 | — |

**Depende de:** HU-S01.

### HU-S03 · Base del front

> **Como** equipo, **quiero** una base del front con el diseño, la sesión, los avisos y la
> navegación **para** construir cada pantalla igual.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| base | P0 | M | Hecha | 04 | — |

**Criterios de aceptación**

- **Dado** cualquier pantalla, **cuando** se dibuja, **entonces** usa los tokens de color y
  fuentes, los toasts y la bottom bar comunes.
- **Dado** que se pierde la conexión, **cuando** pasa, **entonces** aparece el aviso y otro al
  volver.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| front | Vite, Tailwind con tokens, cliente de la API, splash, toasts y layout | #8 | — |

**Depende de:** HU-S01.

### HU-S07 · Vistas y navegación por rol

> **Como** persona con uno o varios roles, **quiero** cambiar de rol y ver solo las secciones
> de mi rol activo **para** no confundirme ni hacer lo que no me toca.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| layout | P0 | M | Hecha | 21 | — |

**Criterios de aceptación**

- **Dado** una cuenta con varios roles, **cuando** entro, **entonces** elijo el rol y puedo
  cambiarlo después.
- **Dado** el rol activo, **cuando** veo la bottom bar y el menú, **entonces** solo aparecen
  sus secciones (cliente: Inicio, Catálogo, Favoritos, Avisos y Cuenta; transportista:
  Entregas, Avisos y Cuenta; vendedor y administrador: sus 3 secciones, Avisos y Menú).
- **Dado** escritorio, **cuando** tengo panel, **entonces** el menú lateral queda fijo.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| front | Selector de rol para cuentas con varios roles | #20, #21 | — |
| front | Capas, desplegables y un solo breakpoint | #43 | — |
| back | Administrador supervisor y vendedor de ejemplo | #50 | — |
| front | `useNavegacion`, `MenuLateral` y `CajonMenu` | #51 | — |
| front | Menú lateral fijo | #52 | — |

**Depende de:** HU-S02.

## modelos

### HU-S04 · Modelos 3D de ejemplo

> **Como** equipo, **quiero** muebles modelados en Blender a escala real y ligeros **para**
> mostrar el catálogo desde el primer arranque.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| modelos | P1 | L | Hecha | 07, 12 | — |

**Criterios de aceptación**

- **Dado** el arranque con `SEMILLA_CATALOGO=true`, **cuando** falta algún ejemplo,
  **entonces** se agrega por slug a nombre del vendedor de ejemplo.
- **Dado** un modelo, **cuando** se exporta, **entonces** es `.glb` a escala real, con +Y
  arriba y ligero (el Sillón Alba, el más detallado, pesa 792 KB).

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| 3d | Modelos, renders y diseño de pantallas | #3 | — |
| 3d | Renders sin sombra | #4 | — |
| back | Semilla del catálogo con los modelos | #7 | — |
| 3d | Cuatro muebles nuevos y semilla por slug | #12 | — |
| 3d | Sillón Alba con material `GC_Color` | #28 | — |

**Depende de:** nada.

## infra

### HU-S05 · Docker

> **Como** equipo, **quiero** levantar MySQL, back y front con un solo comando **para** que
> funcione igual en la laptop y en el servidor.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| infra | P1 | M | Hecha | 08 | — |

**Criterios de aceptación**

- **Dado** el `.env`, **cuando** corro `docker compose up`, **entonces** suben MySQL, back y
  front en orden, cada uno sano antes del siguiente.
- **Dado** el front en nginx, **cuando** pide `/api` o `/uploads`, **entonces** se reenvía al
  back en el mismo origen.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| infra | `UPLOADS_DIR` absoluto para IntelliJ | #11 | — |
| infra | Dockerfiles multietapa y `docker-compose.yml` | #13 | — |
| docs | Guía de Docker, compose y Jenkins | #16 | — |

**Depende de:** HU-S01.

### HU-S06 · Jenkins

> **Como** equipo, **quiero** que cada cambio en `develop`, `test` y `main` se pruebe solo y que
> `test` y `main` se desplieguen **para** no hacer pasos a mano.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| infra | P1 | M | Hecha | 09 | — |

**Criterios de aceptación**

- **Dado** un commit en `develop`, `test` o `main`, **cuando** Jenkins lo detecta (cada 2
  minutos), **entonces** corre las pruebas del back y el lint y build del front.
- **Dado** `test` o `main` en verde, **cuando** termina, **entonces** se despliega con Docker.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| infra | Imagen de Jenkins, JCasC, job multibranch y `Jenkinsfile` | #14 | — |

**Depende de:** HU-S05.

### HU-S08 · HTTPS en la red local

> **Como** equipo, **quiero** abrir la app por HTTPS con un túnel **para** probar en el
> teléfono el AR y las notificaciones push.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| infra | P1 | M | Pendiente | — | — |

**Criterios de aceptación**

- **Dado** el túnel encendido, **cuando** abro la dirección en el teléfono, **entonces** la app
  carga por HTTPS con certificado válido.
- **Dado** la dirección del túnel, **cuando** el front llama a la API, **entonces** CORS y
  `FRONTEND_URL` la aceptan.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| infra | Túnel con certificado (por ejemplo Tailscale Funnel) | — | — |
| infra | `FRONTEND_URL` y CORS para la dirección del túnel | — | — |
| docs | Pasos en la guía de infraestructura | — | — |

**Depende de:** HU-S05.

### HU-S09 · Webhook de GitHub para Jenkins

> **Como** equipo, **quiero** que GitHub avise a Jenkins en cada push **para** no esperar el
> escaneo de 2 minutos.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| infra | P2 | S | Pendiente | 09 | — |

**Criterios de aceptación**

- **Dado** un push a `develop`, **cuando** llega a GitHub, **entonces** Jenkins empieza el
  build en segundos; el escaneo queda como respaldo.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| infra | Webhook del repo hacia Jenkins por el túnel | — | — |
| docs | Actualizar la fase 9 y la guía | — | — |

**Depende de:** HU-S06, HU-S08.

### HU-S10 · Primera versión estable

> **Como** equipo, **quiero** promover el trabajo a `main` y etiquetarlo **para** tener una
> versión estable desplegada.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| infra | P0 | S | Pendiente | 09 | — |

**Criterios de aceptación**

- **Dado** `test` en verde, **cuando** se fusiona a `main`, **entonces** Jenkins despliega
  `gc-main` y queda la etiqueta de la versión.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| infra | QA: fases 1 a 10 a `test` | #17 | — |
| infra | Promover `develop` (fases 11 a 22) a `test` | — | — |
| infra | Fusionar `test` a `main` | #18 | — |
| infra | Etiqueta de la versión | — | — |

**Depende de:** HU-S06.

## seguridad

### HU-S11 · Límite de intentos al entrar

> **Como** equipo, **quiero** frenar los intentos repetidos de contraseña **para** que nadie
> pueda adivinarla probando sin parar.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P1 | M | Pendiente | `ANALISIS_seguridad.md` #1 | — |

**Criterios de aceptación**

- **Dado** 5 intentos fallidos con el mismo correo o IP, **cuando** intento otra vez,
  **entonces** se bloquea 15 minutos y veo cuánto falta.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Contador por correo e IP con bloqueo temporal y prueba | — | — |
| front | Mensaje de bloqueo en Entrar | — | — |

**Depende de:** HU-S02.

### HU-S12 · Cerrar sesión en todos lados

> **Como** persona con cuenta, **quiero** cerrar mi sesión en todos mis dispositivos **para**
> proteger mi cuenta si pierdo el teléfono.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P2 | M | Pendiente | `ANALISIS_seguridad.md` #2 | — |

**Criterios de aceptación**

- **Dado** "Cerrar sesión en todos lados", **cuando** lo uso, **entonces** los refresh token
  anteriores dejan de servir.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Registro del `jti` y revisión en `/refresh` | — | — |
| front | Opción en Perfil y seguridad | — | — |

**Depende de:** HU-S02.

### HU-S13 · Correos de cuenta en segundo plano

> **Como** persona que se registra, **quiero** que la respuesta no espere al correo **para** no
> quedarme esperando si el servidor de correo tarda.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P2 | S | Pendiente | `ANALISIS_seguridad.md` #3 | — |

**Criterios de aceptación**

- **Dado** el registro o "Olvidé mi contraseña", **cuando** envío, **entonces** la respuesta
  llega sin esperar al envío del correo.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Verificación y recuperación por evento después del commit con `@Async` | — | — |

**Depende de:** HU-S02.
