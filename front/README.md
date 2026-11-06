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
| `npm run dev:red` | Igual, pero visible en la red local (para abrirlo desde el teléfono) |
| `npm run lint` | ESLint |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve `dist/` |

## Probar desde el teléfono

1. Teléfono y laptop en la misma red Wi-Fi.
2. `npm run dev:red` y abre en el teléfono la dirección `Network` que muestra Vite (la de Wi-Fi).
3. Si no carga, permite Node.js en redes privadas en el Firewall de Windows.

En desarrollo el front llama a `/api` y `/uploads` de su misma dirección y Vite los reenvía al
back (`server.proxy`), así que no hace falta cambiar `VITE_API_URL` ni CORS.
El service worker no corre en desarrollo, y AR con WebXR exige HTTPS; en Android se usa Scene Viewer.

Estructura y reglas: `documentacion/front/CONVENCIONES_FRONT.md`.
