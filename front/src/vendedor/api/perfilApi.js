import { obtener, peticion, subirArchivo } from '../../common/api/cliente';

/** Perfil público de quien vende, su galería y la edición de "Mi perfil". */
export const perfilApi = {
  /** { id, nombre, slug, bio, ciudad, fotoUrl, portadaUrl, calificacion, totalResenas, mueblesPublicados, ventas, trabajos, vendeDesde, propio } */
  perfil: (slug, signal) => obtener(`/vendedores/${slug}`, { signal }),
  muebles: (slug, { size = 12 } = {}, signal) => obtener(`/vendedores/${slug}/muebles`, { consulta: { size }, signal }),
  trabajos: (slug, signal) => obtener(`/vendedores/${slug}/trabajos`, { signal }),

  miPerfil: (signal) => obtener('/vendedores/yo', { signal }),
  actualizar: ({ bio, ciudad }) => obtener('/vendedores/yo', { metodo: 'PUT', cuerpo: { bio, ciudad } }),
  /** cual = 'foto' | 'portada' */
  subirImagen: (cual, archivo, alProgreso) => subirArchivo(`/vendedores/yo/${cual}`, archivo, { alProgreso }).then((r) => r.datos),
  quitarImagen: (cual) => obtener(`/vendedores/yo/${cual}`, { metodo: 'DELETE' }),

  agregarTrabajo: ({ titulo, descripcion, archivo }) => {
    const datos = new FormData();
    datos.append('titulo', titulo);
    if (descripcion) datos.append('descripcion', descripcion);
    datos.append('archivo', archivo);
    return obtener('/vendedores/yo/trabajos', { metodo: 'POST', cuerpo: datos });
  },
  editarTrabajo: (id, { titulo, descripcion }) => obtener(`/vendedores/yo/trabajos/${id}`, { metodo: 'PUT', cuerpo: { titulo, descripcion } }),
  eliminarTrabajo: (id) => peticion(`/vendedores/yo/trabajos/${id}`, { metodo: 'DELETE' }),
  ordenarTrabajos: (ids) => obtener('/vendedores/yo/trabajos/orden', { metodo: 'PUT', cuerpo: { ids } }),
};

export const MAXIMO_TRABAJOS = 24;
