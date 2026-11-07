import { obtener } from '../../common/api/cliente';

/**
 * Entregas del transportista (solo las que le asignaron). La dirección y el teléfono llegan
 * mientras el pedido va en camino; el service worker no guarda estas rutas.
 */
export const entregasApi = {
  /** pendientes = true: en camino; false: ya cerradas. */
  listar: ({ pendientes, size = 20 }, signal) => obtener('/entregas', { consulta: { pendientes, size }, signal }),
  entrega: (id, signal) => obtener(`/entregas/${id}`, { signal }),
  entregada: (id) => obtener(`/entregas/${id}/entregada`, { metodo: 'POST' }),
  noEntregada: (id, motivo) => obtener(`/entregas/${id}/no-entregada`, { metodo: 'POST', cuerpo: { motivo } }),
};
