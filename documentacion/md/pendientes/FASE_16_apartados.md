# FASE 16 · Apartados con anticipo

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§8, D2 y D9)

## Objetivo

Que el cliente aparte un mueble dejando un anticipo que se acuerda fuera de la app. El
vendedor confirma el anticipo y la fecha límite; si no se liquida a tiempo, el apartado
vence solo y las existencias regresan.

## Partes

- [ ] 16a · Back
  - Estados `APARTADO` y `VENCIDO`; `Pedido.apartado`, `anticipo`, `apartadoHasta`, `apartadoEn`.
  - Acciones "Confirmar anticipo" y "Liquidado"; hasta 3 apartados abiertos por cliente.
  - Tarea programada cada hora que vence apartados y devuelve existencias.
  - Avisos: confirmado, faltan 24 h y vencido.
  - Pruebas con MySQL.
- [ ] 16b · Front
  - Botón "Apartar" en el detalle y hoja con cantidad, color y mensaje.
  - Fecha límite y anticipo visibles en el pedido; diálogo del vendedor para confirmarlos.
- [ ] 16c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
