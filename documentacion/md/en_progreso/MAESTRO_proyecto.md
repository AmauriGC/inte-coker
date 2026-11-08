# MAESTRO · Proyecto GC-Confort (Catálogo de muebles 3D)

- Estado: En progreso
- Responsable: Cristian Amauri Gonzaga Castañeda
- Creado: 05/11/2026 · Actualizado: 06/11/2026

## Objetivo

PWA de catálogo de muebles donde el cliente ve cada mueble en 3D y lo coloca a
tamaño real en su casa con realidad aumentada, para saber si cabe y cómo se ve
antes de comprarlo. El proyecto sirve también para practicar Docker,
docker-compose y Jenkins con despliegue automático al hacer push.

## Problema

Comprar muebles en línea es una apuesta: las fotos no dicen si el mueble cabe en
el espacio ni cómo combina con el cuarto. Muchas devoluciones salen de ahí.

## Stack

| Capa | Tecnología |
|---|---|
| Back | Spring Boot 4.1.2, Java 21, Maven, MySQL 8, JPA, Spring Security + JWT, Mail, SpringDoc, Actuator |
| Front | React 19 + Vite 8, Tailwind CSS v4, React Router, Motion, lucide-react, SweetAlert2 |
| 3D | Blender 5.2 (MCP), exportación `.glb`, `<model-viewer>` con AR |
| PWA | `manifest.webmanifest` + service worker propio (estrategias de la práctica 4.2) |
| Infra | Dockerfile multietapa, docker-compose (MySQL, back, front con nginx), Jenkins (JCasC, multibranch) |

## Roles (multirol)

| Rol | Puede |
|---|---|
| `ADMIN` | Todo; gestiona usuarios, roles y categorías |
| `VENDEDOR` | Crea, edita y elimina sus muebles; sube modelos `.glb` e imágenes |
| `CLIENTE` | Ve el catálogo, el visor 3D y AR; guarda favoritos |

Un usuario puede tener varios roles. Los permisos (`MUEBLE_CREAR`, etc.) viajan en
el JWT y se validan con `@PreAuthorize`.

## Fases

- [x] Fase 0 — Repositorio, ramas y documentación
- [x] Fase 1 — Back base: paquetes, `ApiResponse`, `GlobalExceptionHandler`, CORS
- [x] Fase 2 — Seguridad: usuario, rol, permiso, JWT, registro, verificación por correo, recuperar contraseña, datos iniciales
- [x] Fase 3 — Catálogo: categorías y muebles (CRUD paginado), subida de `.glb` e imágenes
- [x] Fase 4 — Front base: Vite, Tailwind, rutas, sesión, alertas
- [x] Fase 5 — Front catálogo: listado, detalle, visor 3D y AR, panel del vendedor y del admin
- [x] Fase 6 — PWA: manifest, service worker, instalación y modo sin conexión
- [x] Fase 7 — Modelos 3D en Blender y exportación optimizada (8 muebles: ver `blender/README.md`)
- [x] Fase 8 — Docker: Dockerfile del back y del front, docker-compose con MySQL
- [x] Fase 9 — Jenkins: pipeline y despliegue automático de `test` y `main`
- [x] Fase 10 — Favoritos en el back: guardados en la cuenta y sincronizados al entrar
- [x] Fase 11 — Pedidos: comprar, preguntar, existencias y conversación cliente-vendedor
- [x] Fase 12 — Detalle con el 3D protagonista, bottom bar en el detalle y Sillón Alba
- [x] Fase 13 — Me gusta, reseñas y mejores calificados
- [x] Fase 14 — Perfil del vendedor y sus trabajos
- [x] Fase 15 — Colores en existencia y cambio de color en vivo
- [x] Fase 16 — Apartados con anticipo
- [x] Fase 17 — Transportista y método de pago
- [x] Fase 18 — Métricas: ventas, zonas, muebles y conversión
- [x] Fase 19 — Más para el cliente
- [ ] Fase 20 — Avisos en la cuenta, solicitud de vendedor y transportistas del vendedor

## Fases documentadas

| Fase | Archivo | Estado |
|---|---|---|
| 0 | (este maestro) | hecho |
| 1 | `md/hechos/FASE_01_back_base.md` | hecho |
| 2 | `md/hechos/FASE_02_seguridad.md` | hecho |
| 3 | `md/hechos/FASE_03_catalogo.md` | hecho |
| 4 | `md/hechos/FASE_04_front_base.md` | hecho |
| 5 | `md/hechos/FASE_05_front_catalogo.md` | hecho |
| 6 | `md/hechos/FASE_06_pwa.md` | hecho |
| 7 | `md/hechos/FASE_07_modelos.md` | hecho |
| 8 | `md/hechos/FASE_08_docker.md` | hecho |
| 9 | `md/hechos/FASE_09_jenkins.md` | hecho |
| 10 | `md/hechos/FASE_10_favoritos.md` | hecho |
| 11 | `md/hechos/FASE_11_pedidos.md` | hecho |
| 12 | `md/hechos/FASE_12_detalle_3d.md` | hecho |
| 13 | `md/hechos/FASE_13_resenas.md` | hecho |
| 14 | `md/hechos/FASE_14_vendedores.md` | hecho |
| 15 | `md/hechos/FASE_15_colores.md` | hecho |
| 16 | `md/hechos/FASE_16_apartados.md` | hecho |
| 17 | `md/hechos/FASE_17_transportista.md` | hecho |
| 18 | `md/hechos/FASE_18_metricas.md` | hecho |
| 19 | `md/hechos/FASE_19_cliente.md` | hecho |
| 20 | `md/pendientes/FASE_20_cuentas.md` | pendiente |

## Pendientes después de las fases

| Tema | Nota |
|---|---|
| AR en el teléfono | "Verlo en mi sala": WebXR y Scene Viewer piden HTTPS; probar con un túnel (por ejemplo Tailscale) |
| Webhook de GitHub | Jenkins escanea cada 2 minutos; con un túnel público se puede usar webhook |

El maestro pasa a `hechos/` cuando se cierren estos pendientes o se descarten.

## Diseño

Pantallas (móvil y paneles web) en el lienzo de diseño:
https://claude.ai/artifact/2ouk8qCM5BmS6n2W5EiKiL

Detalle del mueble con el 3D protagonista (fase 12):
https://claude.ai/artifact/Xi7bMwkUwABNnfyUmze5Dh

| Decisión | Valor |
|---|---|
| Nombre | GC-Confort |
| Fondo / tinta | `#F3F0EA` / `#1D1B18` |
| Acento | Terracota `#A8461F` (acciones principales) |
| Secundario | Salvia `#2E4A3B` (3D, AR, éxito) |
| Tipografía | Space Grotesk (títulos), Inter (texto) |
| Radios | 12–14 px campos, 20–28 px tarjetas, botones en píldora |
| Filtros | Siempre `<select>` |
| Imágenes de producto | PNG sin sombra, `object-fit: contain`; la sombra es una elipse CSS difuminada |
