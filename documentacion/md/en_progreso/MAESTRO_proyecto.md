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
| Front | React + Vite, Tailwind CSS v4, lucide-react, SweetAlert2 |
| 3D | Blender 5.2 (MCP), exportación `.glb`, `<model-viewer>` con AR |
| PWA | `manifest.json` + service worker propio (estrategias de la práctica 4.2) |
| Infra (después) | Dockerfile, docker-compose, Jenkins |

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
- [ ] Fase 3 — Catálogo: categorías y muebles (CRUD paginado), subida de `.glb` e imágenes
- [ ] Fase 4 — Front base: Vite, Tailwind, rutas, sesión, alertas
- [ ] Fase 5 — Front catálogo: listado, detalle, visor 3D y AR, panel del vendedor y del admin
- [ ] Fase 6 — PWA: manifest, service worker, instalación y modo sin conexión
- [ ] Fase 7 — Modelos 3D en Blender y exportación optimizada (4 muebles hechos: ver `blender/README.md`)
- [ ] Fase 8 — Docker: Dockerfile del back y del front, docker-compose con MySQL
- [ ] Fase 9 — Jenkins: pipeline y despliegue automático de `test` y `main`

## Fases documentadas

| Fase | Archivo | Estado |
|---|---|---|
| 0 | (este maestro) | hecho |
| 1 | `md/hechos/FASE_01_back_base.md` | hecho |
| 2 | `md/hechos/FASE_02_seguridad.md` | hecho |
| 7 | `blender/README.md` | en progreso |

## Diseño

Pantallas (móvil y paneles web) en el lienzo de diseño:
https://claude.ai/artifact/2ouk8qCM5BmS6n2W5EiKiL

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
