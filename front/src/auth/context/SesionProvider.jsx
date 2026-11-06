import { useCallback, useEffect, useMemo, useState } from 'react';
import { alExpirarSesion } from '../../common/api/cliente';
import { tokens } from '../../common/api/tokens';
import { limpiarCacheApi } from '../../pwa/estadoPwa';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { authApi } from '../api/authApi';
import { SesionContext } from './SesionContext';

export default function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(() => tokens.usuario());
  const { notificar } = useNotificaciones();

  const refrescarUsuario = useCallback(async (signal) => {
    const actual = await authApi.yo(signal);
    tokens.actualizarUsuario(actual);
    setUsuario(actual);
    return actual;
  }, []);

  // Al abrir la app con sesión guardada, trae roles y permisos al día.
  useEffect(() => {
    if (!tokens.access()) return undefined;
    const control = new AbortController();
    authApi
      .yo(control.signal)
      .then((actual) => {
        tokens.actualizarUsuario(actual);
        setUsuario(actual);
      })
      .catch(() => {
        /* sin red: se queda el usuario guardado; con 401 lo cierra alExpirarSesion */
      });
    return () => control.abort();
  }, []);

  useEffect(
    () =>
      alExpirarSesion(() => {
        setUsuario(null);
        limpiarCacheApi();
        notificar({ tipo: 'info', titulo: 'Tu sesión expiró', texto: 'Vuelve a entrar para continuar.', guardar: false });
      }),
    [notificar],
  );

  const entrar = useCallback(async (email, password) => {
    const datos = await authApi.login(email, password);
    tokens.guardar(datos);
    setUsuario(datos.usuario);
    return datos.usuario;
  }, []);

  const salir = useCallback(() => {
    tokens.limpiar();
    limpiarCacheApi();
    setUsuario(null);
  }, []);

  const valor = useMemo(() => {
    const permisos = new Set(usuario?.permisos ?? []);
    const roles = new Set(usuario?.roles ?? []);
    return {
      usuario,
      autenticado: Boolean(usuario),
      entrar,
      salir,
      refrescarUsuario,
      tienePermiso: (...lista) => lista.some((p) => permisos.has(p)),
      tieneRol: (rol) => roles.has(rol),
    };
  }, [usuario, entrar, salir, refrescarUsuario]);

  return <SesionContext value={valor}>{children}</SesionContext>;
}
