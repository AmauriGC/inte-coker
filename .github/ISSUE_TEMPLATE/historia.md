---
name: Historia de usuario
about: Lo que un rol quiere hacer y para qué. Las tareas de back y front van como sub-issues.
title: "HU-X00 · "
labels: historia
---

> **Como** <rol>, **quiero** <acción> **para** <beneficio>.

| Rol | Módulo | Fase | Prioridad | Tamaño |
|:---:|:---:|:---:|:---:|:---:|
| <rol> | <módulo> | <nn> | P1 | M |

### Criterios de aceptación

- [ ] **Dado** <contexto>, **cuando** <acción>, **entonces** <resultado>.

### Tareas

Aparecen abajo como sub-issues (back, front, docs). Cada una se cierra con su PR.

### Depende de

Marcadas como "Blocked by" en la tarjeta: <HU-...>.

### Definición de terminado

- [ ] Todas las sub-issues cerradas
- [ ] Criterios de aceptación revisados en el navegador con el rol
- [ ] Back: `./mvnw verify` en verde
- [ ] Front: `npm run lint` y `npm run build` en verde
- [ ] Documentada en su fase y en `HU_<rol>.md`

### Trazabilidad

- Fase: `documentacion/md/...`
- PRs:
