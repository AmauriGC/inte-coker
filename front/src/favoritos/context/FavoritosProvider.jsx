import { useCallback, useEffect, useEffectEvent, useMemo } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import { useAlmacen } from '../../common/hooks/useAlmacen';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { favoritosApi } from '../api/favoritosApi';
import { FavoritosContext } from './FavoritosContext';

const CLAVE_LOCAL = 'gc.favoritos';
const CLAVE_CUENTA = 'gc.favoritos.cuenta';
const SIN_CUENTA = { usuarioId: null, lista: [] };

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

const sin = (id) => (lista) => lista.filter((f) => f.id !== id);
const con = (mueble) => (lista) => [resumen(mueble), ...sin(mueble.id)(lista)];

/**
 * Favoritos en dos modos:
 * - Sin sesión (o sin el permiso FAVORITO_GESTIONAR): en el dispositivo (localStorage).
 * - Con sesión de cliente: en la cuenta (back). Al entrar se suben los del dispositivo y se
 *   vacía la lista local. Se guarda una copia de la cuenta para verla sin conexión; al
 *   cerrar sesión se borra.
 * Los cambios son optimistas: se ven al instante y se revierten si el back falla.
 */
export default function FavoritosProvider({ children }) {
  const { usuario, cuentaTienePermiso } = useSesion();
  const { notificar } = useNotificaciones();
  // Los favoritos son de la cuenta: no cambian al cambiar de rol activo.
  const enCuenta = Boolean(usuario) && cuentaTienePermiso('FAVORITO_GESTIONAR');
  const usuarioId = enCuenta ? usuario.id : null;

  const [locales, setLocales] = useAlmacen(CLAVE_LOCAL, []);
  const [cuenta, setCuenta] = useAlmacen(CLAVE_CUENTA, SIN_CUENTA);

  const favoritos = useMemo(() => {
    if (!usuarioId) return locales;
    return cuenta.usuarioId === usuarioId ? cuenta.lista : SIN_CUENTA.lista;
  }, [usuarioId, locales, cuenta]);

  const sincronizarYCargar = useEffectEvent(async (signal) => {
    const pendientes = locales.map((f) => f.id);
    if (pendientes.length) {
      await favoritosApi.sincronizar(pendientes, signal);
      setLocales([]);
    }
    const lista = await favoritosApi.todos(signal);
    setCuenta({ usuarioId, lista: lista.map(resumen) });
  });

  useEffect(() => {
    if (!usuarioId) {
      // Sin sesión de cliente: la copia de la cuenta no se queda en el dispositivo.
      try {
        localStorage.removeItem(CLAVE_CUENTA);
      } catch {
        /* sin almacenamiento */
      }
      return undefined;
    }
    const control = new AbortController();
    sincronizarYCargar(control.signal).catch(() => {
      /* sin red: se muestra la copia guardada y lo local se sube en el siguiente intento */
    });
    return () => control.abort();
  }, [usuarioId]);

  const aplicar = useCallback(
    (cambio) => {
      if (usuarioId) setCuenta((actual) => ({ usuarioId, lista: cambio(actual.usuarioId === usuarioId ? actual.lista : []) }));
      else setLocales(cambio);
    },
    [usuarioId, setCuenta, setLocales],
  );

  /** Guarda o quita; en la cuenta llama al back y revierte si falla. */
  const cambiar = useCallback(
    (mueble, guardar) => {
      aplicar(guardar ? con(mueble) : sin(mueble.id));
      if (!usuarioId) return;
      const llamada = guardar ? favoritosApi.guardar(mueble.id) : favoritosApi.quitar(mueble.id);
      llamada.catch((error) => {
        aplicar(guardar ? sin(mueble.id) : con(mueble));
        notificar({ tipo: 'error', titulo: 'No se pudo actualizar tus favoritos', texto: error.message, guardar: false });
      });
    },
    [aplicar, usuarioId, notificar],
  );

  const alternar = useCallback(
    (mueble) => {
      const estaba = favoritos.some((f) => f.id === mueble.id);
      cambiar(mueble, !estaba);
      notificar({
        tipo: 'favorito',
        titulo: estaba ? 'Quitado de favoritos' : 'Guardado en favoritos',
        texto: mueble.nombre,
        guardar: !estaba,
        accion: { texto: 'Deshacer', alHacer: () => cambiar(mueble, estaba) },
      });
    },
    [favoritos, cambiar, notificar],
  );

  const valor = useMemo(() => {
    const ids = new Set(favoritos.map((f) => f.id));
    return { favoritos, enCuenta, esFavorito: (id) => ids.has(id), alternar };
  }, [favoritos, enCuenta, alternar]);

  return <FavoritosContext value={valor}>{children}</FavoritosContext>;
}
