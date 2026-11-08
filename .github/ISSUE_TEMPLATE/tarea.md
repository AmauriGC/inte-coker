---
name: Tarea (back, front, docs o infra)
about: Una pieza de una historia. Se agrega como sub-issue de la historia y se cierra con su PR.
title: "HU-X00 · back · "
labels: ""
---

**Historia:** HU-X00 · <título de la historia>
**Capa:** <Back | Front | Docs | Infra> · **Módulo:** `<módulo>`

### Qué se hace

<Una o dos líneas.>

### Detalle técnico

| Elemento | Valor |
|---|---|
| Endpoints o rutas | |
| Clases o componentes | |
| Reglas o permisos | |

### Hecho cuando

- [ ] Pruebas (back: MySQL de pruebas; front: revisado en el navegador con el rol)
- [ ] Back: `./mvnw verify` / Front: `npm run lint` y `npm run build`
- [ ] PR a `develop` con `Closes #<esta tarjeta>` y `Refs: HU-X00`
