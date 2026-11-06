# Flujo de Git

> Reglas de ramas, integración y despliegue del repositorio
> `https://github.com/AmauriGC/inte-coker`.
> Proyecto **individual**: las reglas de revisión se adaptan (ver sección 6).

## 1. Modelo: trunk-based con 3 ramas de ambiente

Se trabaja en ramas cortas que salen de `develop` y vuelven a `develop` por Pull
Request. `develop` es el tronco.

```
     main            <- producción (despliegue automático, fase Jenkins)
      │  (PR de promoción desde test)
     test            <- ambiente de pruebas (despliegue automático, fase Jenkins)
      │  (PR de promoción desde develop)
     develop         <- tronco de desarrollo; aquí se integra todo
      │
   feat/…  fix/…  docs/…  chore/…   <- ramas de trabajo (cortas, desde develop)
```

Regla de oro: **el trabajo baja hacia `develop` y sube hacia arriba
(`develop → test → main`), nunca al revés.**

- `develop` es la rama por defecto del repo y la base de toda rama de trabajo.
- `test` recibe de `develop` cuando hay un conjunto de cambios listo para probar.
- `main` recibe de `test` cuando la versión se verificó.

## 2. Ramas protegidas

`main`, `test` y `develop` están protegidas en GitHub: no aceptan push directo,
`--force` ni borrado. Solo se integran por Pull Request.

| Rama | Recibe de | Para qué sirve | Despliegue (fase Jenkins) |
|---|---|---|---|
| `main` | `test` | Versión estable | Producción, al hacer push |
| `test` | `develop` | Pruebas integradas | Ambiente de pruebas, al hacer push |
| `develop` | `feat/* fix/* docs/* ...` | Trabajo diario | Solo compila y corre pruebas |

## 3. Ramas de trabajo (efímeras)

- Salen **siempre de `develop`**.
- Son **cortas**: un tema, pocos días.
- Nombre: `tipo/descripcion-corta`, en minúsculas, en español, sin acentos.

| Prefijo | Uso |
|---|---|
| `feat/` | Funcionalidad nueva |
| `fix/` | Corrección de error |
| `docs/` | Documentación |
| `refactor/` | Cambio interno sin cambiar comportamiento |
| `chore/` | Configuración, dependencias, infraestructura (Docker, Jenkins) |
| `test/` | Pruebas que no agregan funcionalidad |

Ejemplos: `feat/login-jwt`, `feat/catalogo-muebles`, `feat/visor-3d`,
`fix/cors-front`, `chore/dockerfile-back`, `docs/historias-usuario`.

## 4. Flujo diario

1. Actualiza `develop` y crea tu rama:
   ```powershell
   git switch develop
   git pull --no-rebase
   git switch -c feat/mi-tema
   ```
2. Commits pequeños y atómicos (ver `CONVENCION_COMMITS.md`).
3. Antes de subir, trae lo último de `develop`:
   ```powershell
   git fetch origin
   git merge origin/develop
   ```
4. Sube la rama y abre el PR hacia `develop`:
   ```powershell
   git push -u origin feat/mi-tema
   gh pr create --base develop --title "feat(tema): descripcion" --body "Refs: HU-..."
   ```
5. Revisa el PR con la lista de la sección 6 y fusiona con **commit de merge**:
   ```powershell
   gh pr merge --merge
   ```
6. La rama **no se borra**: queda como historial.

## 5. Promoción entre ambientes

Siempre por Pull Request:

```powershell
# develop -> test
gh pr create --base test --head develop --title "QA: integra <tema>"
# test -> main
gh pr create --base main --head test --title "Release: v<x.y.z>"
```

Nada llega a `main` sin pasar por `test`. Al liberar en `main` se crea una
etiqueta: `git tag v0.1.0; git push origin v0.1.0`.

## 6. Pull Requests (autorrevisión)

Como el proyecto es individual, el PR no espera la aprobación de otra persona,
pero antes de fusionar se revisa:

- [ ] El título tiene formato de commit (`feat(login): ...`).
- [ ] La descripción dice qué cambia, por qué y liga la HU (`Refs: HU-C01`).
- [ ] Es un solo tema (si toca más de ~10 archivos sin ser una sola funcionalidad, se parte).
- [ ] El back compila (`./mvnw verify`) y el front construye (`npm run build`).
- [ ] No entra ningún secreto ni artefacto (ver `REGLAS_IGNORE.md`).
- [ ] La rama no está atrás de `develop`.
- [ ] El MD de la fase se actualizó.

Cuando exista Jenkins, el PR además debe pasar el pipeline.

## 7. Reglas rápidas

- Nunca commitear ni hacer push directo a `main`, `test` o `develop`.
- Siempre `git pull` de `develop` antes de empezar y antes de subir la rama.
- Nunca `git push --force` en ramas protegidas ni `git rebase` de ramas publicadas.
- Antes de commitear: `git status` y `git diff --cached --stat`.
