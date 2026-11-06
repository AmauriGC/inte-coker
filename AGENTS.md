# Instrucciones para agentes de IA

Monorepo del Catálogo de muebles 3D (PWA):

- `back/` — Spring Boot 4.1.2, Java 21, Maven. Paquete base `com.gc.back`.
- `front/` — React 19 + Vite + Tailwind CSS v4, módulos por dominio como el back.
- `documentacion/` — estándar, flujo de Git, historias y fases.

## Antes de tocar código

1. Lee `documentacion/README.md`, `documentacion/ESTANDAR.md` y `documentacion/git/`.
   Para el back, además `documentacion/back/CONVENCIONES_BACK.md`; para el front,
   `documentacion/front/CONVENCIONES_FRONT.md`.
2. Revisa `documentacion/md/analisis/` por decisiones pendientes.
3. Trabaja en una rama `tipo/tema` que salga de `develop`; nunca en `main`, `test` ni `develop`.

## Reglas

- Commits: `tipo(alcance): descripción` en español y minúscula, atómicos (`documentacion/git/CONVENCION_COMMITS.md`).
- Secretos solo en `.env` (raíz, no versionado); las claves nuevas se agregan también a `.env.example`.
- Back: el `controller` no lleva lógica; las reglas van en `service`; DTO de request con Bean Validation y `@Valid`; listados paginados; respuestas con `ApiResponse` y errores por `GlobalExceptionHandler`; mensajes en español.
- Documenta en español y sin emojis.
- Verifica antes de un PR: `./mvnw verify` en `back/` y `npm run lint` + `npm run build` en `front/`.
