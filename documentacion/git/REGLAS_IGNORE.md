# Qué no subir al repositorio

## 1. Nunca se suben

**Secretos**
- `.env` y cualquier `.env.*` (excepto `.env.example`).
- Contraseñas, el `JWT_SECRET`, la contraseña de aplicación de Gmail, tokens, llaves (`*.pem`, `*.key`).

Se sube **`.env.example`** con valores de ejemplo, nunca los reales.

**Artefactos de build y dependencias**
- `back/target/`, `front/node_modules/`, `front/dist/`, `coverage/`.

**Archivos subidos por usuarios**
- `uploads/` (modelos `.glb` e imágenes que suben los vendedores).

**Sistema y editor**
- `.DS_Store`, `Thumbs.db`, `desktop.ini`, `.idea/`, `*.iml`, `.vscode/`.

**Blender**
- `*.blend1`, `*.blend2` (respaldos automáticos).

## 2. Qué sí se sube de Blender

| Archivo | Dónde | ¿Se sube? |
|---|---|---|
| `.glb` final, optimizado (menos de 5 MB) | `front/public/models/` | Sí: es un recurso de la app |
| `.blend` fuente | `blender/` | Sí, si pesa menos de 50 MB |
| Renders y texturas sueltas pesadas | — | No |

Si un `.blend` pesa más de 50 MB, se guarda fuera del repo o con Git LFS.

## 3. Revisión antes de commitear

```powershell
git status
git diff --cached --stat
```

Si aparece un archivo que no reconoces, no lo agregues. Si un secreto ya se subió:
quítalo, agrega la regla al `.gitignore` y **rota la clave** (el historial la conserva).

## 4. `.gitignore`

- Raíz: secretos, `uploads/`, sistema, editores y Blender.
- `back/.gitignore`: el que genera Spring Initializr (`target/`, IDE).
- `front/.gitignore`: el que genera Vite (`node_modules/`, `dist/`).
