import { useCallback, useMemo } from 'react';
import { useAlmacen } from '../../common/hooks/useAlmacen';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { FavoritosContext } from './FavoritosContext';

/** Copia mínima del mueble para pintar la lista de favoritos sin pedirla al back. */
function resumen(m) {
  return {
    id: m.id,
    slug: m.slug,
    nombre: m.nombre,
    precio: m.precio,
    imagenUrl: m.imagenUrl,
    anchoCm: m.anchoCm,
    fondoCm: m.fondoCm,
    altoCm: m.altoCm,
    categoria: m.categoria,
  };
}

/**
 * Favoritos en el dispositivo (localStorage). Sincronizar con el back queda pendiente
 * para cuando exista el endpoint (permiso FAVORITO_GESTIONAR).
 */
export default function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useAlmacen('gc.favoritos', []);
  const { notificar } = useNotificaciones();

  const alternar = useCallback(
    (mueble) => {
      const estaba = favoritos.some((f) => f.id === mueble.id);
      if (estaba) {
        const respaldo = favoritos;
        setFavoritos((lista) => lista.filter((f) => f.id !== mueble.id));
        notificar({
          tipo: 'favorito',
          titulo: 'Quitado de favoritos',
          texto: mueble.nombre,
          guardar: false,
          accion: { texto: 'Deshacer', alHacer: () => setFavoritos(respaldo) },
        });
      } else {
        setFavoritos((lista) => [resumen(mueble), ...lista.filter((f) => f.id !== mueble.id)]);
        notificar({
          tipo: 'favorito',
          titulo: 'Guardado en favoritos',
          texto: mueble.nombre,
          accion: { texto: 'Deshacer', alHacer: () => setFavoritos((lista) => lista.filter((f) => f.id !== mueble.id)) },
        });
      }
    },
    [favoritos, notificar, setFavoritos],
  );

  const valor = useMemo(() => {
    const ids = new Set(favoritos.map((f) => f.id));
    return { favoritos, esFavorito: (id) => ids.has(id), alternar };
  }, [favoritos, alternar]);

  return <FavoritosContext value={valor}>{children}</FavoritosContext>;
}
