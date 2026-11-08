# Historias · Invitado

Persona sin sesión. Ve el catálogo, el 3D y las reseñas; para comprar o guardar en su cuenta
tiene que entrar. Formato en `PLANTILLA_HISTORIA.md`.

## catalogo

### HU-I01 · Explorar el catálogo

> **Como** invitado, **quiero** buscar, filtrar por categoría y ordenar los muebles **para**
> encontrar uno que me guste.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| catalogo | P0 | M | Hecha | 03, 05, 13, 19 | #56 |

**Criterios de aceptación**

- **Dado** el catálogo, **cuando** escribo en el buscador o elijo una categoría,
  **entonces** solo veo los muebles publicados que coinciden, y el filtro queda en la URL.
- **Dado** el catálogo, **cuando** elijo un orden (recientes, precio, mejor calificados o
  más gustados), **entonces** la lista se reordena.
- **Dado** que no hay conexión ni copia guardada, **cuando** abro el catálogo, **entonces**
  veo un estado vacío que lo explica y un botón para reintentar.
- **Dado** el inicio, **cuando** entro, **entonces** veo la portada, los destacados, los
  mejor calificados y los vistos recientemente.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Catálogo público paginado con filtros, precio y orden; categorías públicas | #7 | #109 |
| front | Catálogo con búsqueda, categorías y orden en la URL, "Ver más" y estados vacíos | #8 | #110 |
| front | Inicio con portada animada, destacados, mejor calificados y vistos recientemente | #8, #30, #42 | #111 |

**Depende de:** HU-S01, HU-S03.

### HU-I02 · Ver el mueble en 3D

> **Como** invitado, **quiero** ver el mueble en 3D con sus medidas **para** imaginar cómo
> queda en mi casa.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| catalogo | P0 | L | Hecha | 03, 05, 12 | #57 |

**Criterios de aceptación**

- **Dado** un mueble publicado, **cuando** abro su detalle, **entonces** el visor 3D ocupa
  la mayor parte de la pantalla y puedo girarlo y acercarlo.
- **Dado** el visor, **cuando** toco "Medidas", **entonces** veo las cotas de ancho, fondo y
  alto en centímetros.
- **Dado** el visor, **cuando** toco pantalla completa, **entonces** se abre a toda la
  pantalla (también en iPhone) y salgo con Escape o el botón.
- **Dado** un borrador de otra persona, **cuando** abro su enlace, **entonces** veo "no
  encontrado".

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Detalle por slug y archivos `/uploads/**` con tipo `.glb` y caché de 30 días | #7 | #112 |
| front | `Visor3D` con `model-viewer` bajo demanda, progreso y cotas | #8 | #113 |
| front | Detalle con el 3D protagonista, controles flotantes, pantalla completa y bottom bar | #28 | #114 |

**Depende de:** HU-I01, HU-S04.

### HU-I03 · Cambiar el color en vivo

> **Como** invitado, **quiero** tocar los colores disponibles y ver el mueble cambiar en el
> visor **para** elegir el que me gusta.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| catalogo | P1 | M | Hecha | 15 | #58 |

**Criterios de aceptación**

- **Dado** un mueble con colores, **cuando** toco una muestra, **entonces** el modelo cambia
  de color al instante y la hoja muestra las piezas de ese color.
- **Dado** un color agotado, **cuando** lo veo, **entonces** su muestra aparece atenuada y
  tachada: se puede ver en 3D pero no comprar.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Colores del mueble en `MuebleResponse.variantes` | #33 | #115 |
| front | `MuestrasColor` y cambio de `baseColorFactor` del material `GC_Color` en el visor | #34 | #116 |

**Depende de:** HU-I02, HU-V02.

### HU-I04 · Verlo en mi espacio con AR

> **Como** invitado, **quiero** ver el mueble en mi sala con realidad aumentada **para** saber
> si cabe y cómo se ve.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| catalogo | P1 | M | Pendiente | 05 | #59 |

**Criterios de aceptación**

- **Dado** un teléfono compatible, **cuando** toco "Ver en mi espacio", **entonces** el
  mueble aparece en mi sala a escala real (WebXR, Scene Viewer o Quick Look).
- **Dado** un dispositivo sin AR, **cuando** toco el botón, **entonces** se explica por qué y
  puedo copiar el enlace para abrirlo en el teléfono.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| front | AR con `model-viewer` a escala real y explicación si no se admite | #8 | #117 |
| front | Probar y ajustar el AR en Android e iPhone por HTTPS | — | #118 |

**Depende de:** HU-I02, HU-S08 (HTTPS en la red local).

### HU-I05 · Comparar muebles

> **Como** invitado, **quiero** comparar hasta 3 muebles lado a lado **para** decidir cuál me
> conviene.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| catalogo | P2 | S | Hecha | 19 | #60 |

**Criterios de aceptación**

- **Dado** un detalle, **cuando** toco "Comparar", **entonces** el mueble se suma a la lista
  (hasta 3, guardada en el dispositivo).
- **Dado** `/comparar`, **cuando** lo abro, **entonces** veo precio, medidas, piezas,
  colores, materiales, calificación y vendedor, con el más económico marcado.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| front | Lista `gc.comparar`, botón en el detalle y `CompararPage` | #42 | #119 |
| front | Listas del dispositivo y muestras de color separadas por cuenta | #44 | #120 |

**Depende de:** HU-I02.

## vendedores

### HU-I06 · Conocer al vendedor

> **Como** invitado, **quiero** ver el perfil del vendedor con su calificación, sus muebles y
> sus trabajos **para** confiar en a quién le compro.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| vendedores | P1 | M | Hecha | 14 | #61 |

**Criterios de aceptación**

- **Dado** el detalle de un mueble, **cuando** toco la tarjeta del vendedor, **entonces** voy
  a `/vendedor/:slug`.
- **Dado** el perfil, **cuando** lo abro, **entonces** veo portada, foto, ciudad, año desde que
  vende, calificación, ventas y las pestañas "Muebles" y "Trabajos".

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | `GET /api/vendedores/{slug}` con cifras, muebles y trabajos públicos | #31 | #121 |
| front | `PerfilVendedorPage` y tarjeta del vendedor en el detalle | #32 | #122 |

**Depende de:** HU-V06.

## resenas

### HU-I07 · Leer reseñas

> **Como** invitado, **quiero** leer las reseñas y la calificación de un mueble **para** saber
> qué opinan quienes ya lo compraron.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| resenas | P1 | M | Hecha | 13 | #62 |

**Criterios de aceptación**

- **Dado** un mueble con reseñas, **cuando** abro su detalle, **entonces** veo el promedio
  con estrellas y un enlace a todas las reseñas.
- **Dado** `/mueble/:slug/resenas`, **cuando** filtro por estrellas u ordeno, **entonces** la
  lista paginada cambia y las reseñas ocultas no aparecen ni cuentan en el promedio.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Reseñas públicas, resumen con distribución y orden por calificación | #29 | #123 |
| front | `ResenasPage`, resumen en el detalle y estrella en las tarjetas | #30 | #124 |

**Depende de:** HU-C07.

## auth

### HU-I08 · Crear mi cuenta

> **Como** invitado, **quiero** registrarme y verificar mi correo **para** poder comprar y
> guardar mis favoritos.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P0 | M | Hecha | 02, 04, 21 | #63 |

**Criterios de aceptación**

- **Dado** el formulario de registro, **cuando** lo envío con datos válidos, **entonces** se
  crea una cuenta de cliente sin verificar y me llega el correo.
- **Dado** el enlace del correo (válido 24 h, un solo uso), **cuando** lo abro, **entonces**
  la cuenta queda activada y la pestaña se cierra sola a los 5 segundos.
- **Dado** que no me llegó, **cuando** pido reenviar, **entonces** veo el mismo mensaje exista
  o no la cuenta.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Registro, verificación con token de un solo uso y reenvío; correo HTML | #6 | #125 |
| front | Crear cuenta, "Revisa tu correo" y verificar | #8 | #126 |
| front | La pestaña de verificación se cierra sola y avisa a la pestaña original | #54 | #127 |

**Depende de:** HU-S02.

### HU-I09 · Entrar y recuperar mi contraseña

> **Como** invitado, **quiero** iniciar sesión y recuperar mi contraseña si la olvido **para**
> no perder mi cuenta.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| auth | P0 | S | Hecha | 02, 04 | #64 |

**Criterios de aceptación**

- **Dado** mi correo y contraseña, **cuando** entro, **entonces** la sesión se mantiene y el
  token se renueva solo.
- **Dado** que olvidé la contraseña, **cuando** la pido, **entonces** me llega un enlace de
  30 minutos para poner una nueva.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| back | Login, refresh, olvidé y restablecer contraseña | #6 | #128 |
| front | Entrar, olvidé y restablecer; renovación del token ante un 401 | #8 | #129 |

**Depende de:** HU-S02.

## pwa

### HU-I10 · Instalar la app y usarla sin conexión

> **Como** invitado, **quiero** instalar GC-Confort y ver lo que ya abrí sin conexión **para**
> usarla aunque falle la señal.

| Módulo | Prioridad | Tamaño | Estado | Fase | Tarjeta |
|---|---|---|---|---|---|
| pwa | P1 | L | Hecha | 06, 22 | #65 |

**Criterios de aceptación**

- **Dado** Chrome, Edge o Android, **cuando** aparece "Instala GC-Confort", **entonces**
  puedo instalarla; en iPhone veo los pasos para agregarla a inicio.
- **Dado** que ya abrí el catálogo y un detalle, **cuando** no hay conexión, **entonces** la
  app abre y muestra lo guardado, incluido el modelo 3D.
- **Dado** que se publica una versión nueva, **cuando** abro la app, **entonces** veo "Nueva
  versión lista" y se actualiza al aceptar.
- **Dado** una sección que no está guardada, **cuando** la abro sin conexión, **entonces** veo
  una pantalla que lo explica sin perder la navegación.

**Tareas**

| Capa | Tarea | PR | Tarjeta |
|---|---|---|---|
| front | Manifest, iconos, service worker propio con sus estrategias y avisos | #9 | #130 |
| front | Usar la app desde el teléfono en la red local | #10 | #131 |
| front | Errores por ruta, instalar en iPhone, red lenta, capturas e insignia | #55 | #132 |

**Depende de:** HU-I01.
