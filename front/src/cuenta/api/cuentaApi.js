import { obtener, subirArchivo } from '../../common/api/cliente';

/** Mi cuenta: nombre, foto, direcciones guardadas, solicitud para vender y avisos de existencias. */
export const cuentaApi = {
  actualizarPerfil: (nombre) => obtener('/cuenta/perfil', { metodo: 'PUT', cuerpo: { nombre } }),
  subirFoto: (archivo, alProgreso) => subirArchivo('/cuenta/foto', archivo, { alProgreso }).then((r) => r.datos),
  quitarFoto: () => obtener('/cuenta/foto', { metodo: 'DELETE' }),
  subirPortada: (archivo, alProgreso) => subirArchivo('/cuenta/portada', archivo, { alProgreso }).then((r) => r.datos),
  quitarPortada: () => obtener('/cuenta/portada', { metodo: 'DELETE' }),
  /** { actual, nueva, confirmacion } */
  cambiarPassword: (datos) => obtener('/cuenta/password', { metodo: 'PUT', cuerpo: datos }),

  /** Todas devuelven la lista completa, con la predeterminada primero. */
  direcciones: (signal) => obtener('/cuenta/direcciones', { signal }),
  crearDireccion: (d) => obtener('/cuenta/direcciones', { metodo: 'POST', cuerpo: d }),
  actualizarDireccion: (id, d) => obtener(`/cuenta/direcciones/${id}`, { metodo: 'PUT', cuerpo: d }),
  predeterminada: (id) => obtener(`/cuenta/direcciones/${id}/predeterminada`, { metodo: 'PATCH' }),
  eliminarDireccion: (id) => obtener(`/cuenta/direcciones/${id}`, { metodo: 'DELETE' }),

  /** Mi última solicitud para vender (null si nunca pedí). */
  miSolicitud: (signal) => obtener('/solicitud-vendedor', { signal }),
  pedirVender: (datos) => obtener('/solicitud-vendedor', { metodo: 'POST', cuerpo: datos }),

  /** Avisos que tengo del mueble: ids de color (null = el mueble sin color). */
  avisos: (muebleId, signal) => obtener(`/muebles/${muebleId}/avisame`, { signal }),
  avisame: (muebleId, varianteId) => obtener(`/muebles/${muebleId}/avisame`, { metodo: 'POST', consulta: { varianteId } }),
  quitarAviso: (muebleId, varianteId) => obtener(`/muebles/${muebleId}/avisame`, { metodo: 'DELETE', consulta: { varianteId } }),
};

export const MAXIMO_DIRECCIONES = 5;
