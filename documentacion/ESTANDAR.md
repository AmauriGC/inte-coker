# Estándar de documentación

> Cómo se escribe y se mueve la documentación del proyecto.

## 1. Estructura

```
documentacion/
├── README.md                 <- mapa e índice
├── ESTANDAR.md               <- este archivo
├── git/
│   ├── FLUJO_GIT.md          <- ramas, PRs y promoción
│   ├── CONVENCION_COMMITS.md <- mensajes de commit
│   └── REGLAS_IGNORE.md      <- qué no subir
├── historias_de_usuario/     <- HU por rol
└── md/
    ├── pendientes/           <- escrito, no iniciado
    ├── en_progreso/          <- trabajándose ahora
    ├── hechos/               <- terminado y verificado
    └── analisis/             <- dudas, decisiones y riesgos por revisar
```

Un documento por tema. No se duplica contenido: se enlaza.

## 2. Maestro + fases

Cada bloque de trabajo tiene un `MAESTRO_<tema>.md` con objetivo, alcance y fases.
Las fases pueden ser secciones del maestro o archivos `FASE_<nn>_<tema>.md`.

## 3. Estados

El estado es la carpeta, y se cambia con `git mv` en su propio commit:

```powershell
git mv documentacion/md/pendientes/FASE_02_seguridad.md documentacion/md/en_progreso/
git commit -m "docs(auth): pasa la fase de seguridad a en_progreso"
```

- El maestro no se mueve a `hechos/` hasta que todas sus fases estén hechas.
- Al cerrar una fase se marca `[x]` en el maestro.

## 4. `md/analisis/`

No es un estado: es el cajón de lo que necesita decisión. Un archivo por tema
(`ANALISIS_<tema>.md`); cada hallazgo lleva número, severidad, dónde está, qué
pasa y propuesta. Cuando se decide, el arreglo se hace en el código o documento
correspondiente y el hallazgo se marca como resuelto.

## 5. Nombres

- `MAESTRO_<tema>.md`, `FASE_<nn>_<tema>.md`, `ANALISIS_<tema>.md`.
- `<tema>` en minúsculas, sin acentos ni espacios, en snake_case.

## 6. Plantilla de fase

```markdown
# FASE <nn> · <tema>

- Maestro: MAESTRO_<tema>.md
- Estado: Pendiente | En progreso | Hecho
- Fecha: <dd/mm/aaaa>
- Traza: HU-<rol><nn>

## Objetivo
## Cambios
- [ ] Back: ...
- [ ] Front: ...
## Pruebas
## Pendientes al cerrar
```

## 7. Reglas para agentes de IA

1. Leer `AGENTS.md`, este estándar y `git/` antes de tocar código.
2. Si el tema no tiene maestro o fase, crearlo en `pendientes/` antes de programar.
3. Mover la fase a `en_progreso/` al empezar y a `hechos/` al verificarla.
4. Documentar en español, sin emojis.
5. Cada movimiento de MD va en su propio commit `docs(...)`.

## 8. Definition of Done

- [ ] Cumple su objetivo y criterios.
- [ ] Está ligado a una HU (si aplica).
- [ ] Se probó (compila, pruebas pasan, prueba manual hecha).
- [ ] El maestro refleja el estado final.
- [ ] Lo que quedó abierto está en "Pendientes al cerrar" o en `analisis/`.
