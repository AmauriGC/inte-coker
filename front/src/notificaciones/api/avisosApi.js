import { obtener, peticion } from '../../common/api/cliente';

/** Bandeja de avisos de la cuenta (/api/notificaciones). */
export const avisosApi = {
  listar: ({ sinLeer = false, page = 0, size = 20 } = {}, signal) => obtener('/notificaciones', { consulta: { sinLeer, page, size }, signal }),
  sinLeer: (signal) => obtener('/notificaciones/sin-leer', { signal }),
  marcarLeida: (id) => obtener(`/notificaciones/${id}/leida`, { metodo: 'PATCH' }),
  marcarTodas: () => peticion('/notificaciones/leidas', { metodo: 'POST' }),
  eliminar: (id) => peticion(`/notificaciones/${id}`, { metodo: 'DELETE' }),
  vaciar: () => peticion('/notificaciones', { metodo: 'DELETE' }),
};
