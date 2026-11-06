# Convención de commits

> Conventional Commits en español: `tipo(alcance): descripción`.

## 1. Formato

```
tipo(alcance): descripción en minúscula

[cuerpo opcional: qué y por qué]

[footers opcionales: Refs: HU-C01]
```

- **tipo**: uno de la sección 2.
- **alcance**: módulo o área, en minúsculas. Ej.: `auth`, `usuarios`, `roles`,
  `muebles`, `visor-3d`, `pwa`, `ui`, `env`, `docker`, `jenkins`, `blender`, `git`.
- **descripción**: en español, en minúscula, sin punto final, verbo en presente
  ("agrega", "corrige", "documenta").
- **cuerpo**: solo si hace falta explicar el por qué. Máximo ~72 caracteres por línea.
- **footers**: ligan el trabajo a la HU: `Refs: HU-V02`.

### Correctos

```
feat(auth): agrega inicio de sesión con jwt
feat(muebles): permite subir el modelo glb de un mueble
fix(cors): permite el origen del front en desarrollo
docs(git): documenta el flujo trunk-based
chore(docker): agrega dockerfile multietapa del back
test(auth): cubre el login con cuenta sin verificar
```

### Incorrectos

```
arregle cosas            <- sin tipo ni alcance
Login y catálogo         <- mezcla dos temas
Se agregó el login.      <- mayúscula, punto y voz pasiva
feat: cambios            <- descripción vacía
```

## 2. Tipos

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de error |
| `docs` | Solo documentación |
| `test` | Pruebas, sin tocar producción |
| `refactor` | Cambio interno sin cambiar comportamiento |
| `chore` | Configuración, dependencias, Docker, Jenkins |

## 3. Commits atómicos

**Un commit = un cambio lógico.** Cada commit compila por sí solo.

- Ideal: **10 archivos o menos** por commit.
- Si son más, debe ser un solo cambio transversal y se explica en el cuerpo.
- No mezclar temas (login y catálogo) ni tipos (`feat` y `fix`).

Ejemplo, el login separado en etapas:

```
feat(auth): agrega entidades de usuario, rol y permiso
feat(auth): genera y valida el token jwt
feat(auth): expone los endpoints de registro e inicio de sesión
feat(auth): envía el correo de verificación de cuenta
test(auth): cubre credenciales incorrectas y cuenta sin verificar
```

## 4. Antes de commitear

1. `git status` → qué vas a subir.
2. Que no entren secretos, binarios ni artefactos (`REGLAS_IGNORE.md`).
3. `git add <rutas>` solo de este commit (no `git add .` a ciegas).
4. Mensaje con el formato de arriba.

No se reescriben commits ya publicados; `git commit --amend` solo antes de subir.
