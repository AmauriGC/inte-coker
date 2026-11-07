import { obtener } from '../../common/api/cliente';

/** Me gusta, reseñas de compra verificada y moderación. */
export const resenasApi = {
  /** dar = true pone el me gusta; false lo quita. Devuelve { meGusta, total }. */
  meGusta: (muebleId, dar) => obtener(`/muebles/${muebleId}/me-gusta`, { metodo: dar ? 'PUT' : 'DELETE' }),

  /** { promedio, total, distribucion: [{ estrellas, total }] de 5 a 1, totalMeGusta, meGusta, puedeResenar, miResena } */
  resumen: (muebleId, signal) => obtener(`/muebles/${muebleId}/resenas/resumen`, { signal }),

  /** orden: recientes | mejores | peores; estrellas: 1 a 5 o vacío para todas. */
  lista: (muebleId, { estrellas, orden = 'recientes', size = 10 } = {}, signal) =>
    obtener(`/muebles/${muebleId}/resenas`, { consulta: { estrellas, orden, size }, signal }),

  guardar: (muebleId, { estrellas, texto }) => obtener(`/muebles/${muebleId}/resenas`, { metodo: 'PUT', cuerpo: { estrellas, texto } }),
  responder: (resenaId, texto) => obtener(`/resenas/${resenaId}/respuesta`, { metodo: 'POST', cuerpo: { texto } }),

  moderacion: ({ oculta, buscar, size = 20 } = {}, signal) => obtener('/resenas', { consulta: { oculta, buscar, size }, signal }),
  ocultar: (resenaId, oculta) => obtener(`/resenas/${resenaId}/oculta`, { metodo: 'PATCH', cuerpo: { oculta } }),
};
