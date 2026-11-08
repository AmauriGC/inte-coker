import { obtener, peticion } from '../../common/api/cliente';

/**
 * Pedidos y conversación con el vendedor. Estas rutas no pasan por la caché del service
 * worker: tienen datos privados (dirección, teléfono, mensajes).
 */
export const pedidosApi = {
  /** "Comprar": { muebleId, cantidad, tipoEntrega, metodoPago, nombreRecibe, telefono, direccion, ciudad, codigoPostal, mensaje } */
  pedir: (cuerpo) => obtener('/pedidos', { metodo: 'POST', cuerpo }),
  preguntar: (muebleId, mensaje) => obtener('/pedidos/consultas', { metodo: 'POST', cuerpo: { muebleId, mensaje } }),
  /** Convierte una consulta en pedido (mismo cuerpo que pedir, sin muebleId). */
  solicitar: (id, cuerpo) => obtener(`/pedidos/${id}/solicitar`, { metodo: 'PATCH', cuerpo }),

  compras: ({ estado, size = 20 }, signal) => obtener('/pedidos/compras', { consulta: { estado, size }, signal }),
  ventas: ({ estado, size = 20 }, signal) => obtener('/pedidos/ventas', { consulta: { estado, size }, signal }),
  todos: ({ estado, buscar, size = 20 }, signal) => obtener('/pedidos', { consulta: { estado, buscar, size }, signal }),

  pedido: (id, signal) => obtener(`/pedidos/${id}`, { signal }),
  /** El vendedor confirma el anticipo de un apartado: { anticipo, dias } (1 a 30). */
  confirmarApartado: (id, { anticipo, dias }) => obtener(`/pedidos/${id}/apartado`, { metodo: 'PATCH', cuerpo: { anticipo, dias } }),
  /** transportistaId solo al pasar a EN_CAMINO un envío a domicilio (null = lo lleva el vendedor). */
  cambiarEstado: (id, estado, motivo, transportistaId = null) =>
    obtener(`/pedidos/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado, motivo, transportistaId } }),

  /** Sin despuesDe: los últimos 200. Con despuesDe (id): solo los nuevos. */
  mensajes: (id, despuesDe, signal) => obtener(`/pedidos/${id}/mensajes`, { consulta: { despuesDe }, signal }),
  escribir: (id, texto) => obtener(`/pedidos/${id}/mensajes`, { metodo: 'POST', cuerpo: { texto } }),
  leido: (id) => peticion(`/pedidos/${id}/leido`, { metodo: 'POST' }),

  resumen: (signal) => obtener('/pedidos/resumen', { signal }),
};
