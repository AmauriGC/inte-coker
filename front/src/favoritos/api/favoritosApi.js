import { obtener, peticion } from '../../common/api/cliente';

const TAMANO = 100;

/** Favoritos de la cuenta (permiso FAVORITO_GESTIONAR). */
export const favoritosApi = {
  /** Trae todas las páginas (100 por página) y devuelve la lista de muebles. */
  async todos(signal) {
    const lista = [];
    for (let page = 0; ; page++) {
      const pagina = await obtener('/favoritos', { consulta: { page, size: TAMANO }, signal });
      lista.push(...pagina.contenido);
      if (pagina.ultima) return lista;
    }
  },
  guardar: (muebleId) => obtener(`/favoritos/${muebleId}`, { metodo: 'PUT' }),
  quitar: (muebleId) => peticion(`/favoritos/${muebleId}`, { metodo: 'DELETE' }),
  /** Sube los guardados sin sesión; el back acepta hasta 100 por llamada. */
  sincronizar: (muebleIds, signal) =>
    obtener('/favoritos/sincronizar', { metodo: 'POST', cuerpo: { muebleIds: muebleIds.slice(0, TAMANO) }, signal }),
};
