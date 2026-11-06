# GC-Confort · front

PWA del catálogo de muebles en 3D: React 19, Vite, Tailwind CSS v4, React Router,
Motion, lucide-react, SweetAlert2 y `<model-viewer>` para 3D y AR.

## Arranque

```
npm install
npm run dev      # http://localhost:5173
```

Necesita el back en marcha y `VITE_API_URL` en el `.env` de la raíz del repositorio
(por defecto `http://localhost:8080/api`).

## Scripts

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | ESLint |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve `dist/` |

Estructura y reglas: `documentacion/front/CONVENCIONES_FRONT.md`.
