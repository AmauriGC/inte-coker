import { useCallback, useEffect, useMemo, useState } from 'react';
import { alExpirarSesion } from '../../common/api/cliente';
import { tokens } from '../../common/api/tokens';
import { useAlmacen } from '../../common/hooks/useAlmacen';
import { limpiarCacheApi } from '../../pwa/estadoPwa';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { authApi } from '../api/authApi';
import { ordenarRoles } from '../roles';
import { SesionContext } from './SesionContext';

export default function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(() => tokens.usuario());
  const { notificar } = useNotificaciones();
  // Rol elegido cuando la cuenta tiene varios: { usuarioId, rol }. Solo filtra la interfaz.
  const [eleccion, setEleccion] = useAlmacen('gc.rol', null);

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

  // Se lee el id de lo guardado: justo después de entrar, el estado aún no trae al usuario.
  const cambiarRol = useCallback((rol) => setEleccion({ usuarioId: tokens.usuario()?.id ?? null, rol }), [setEleccion]);

  const valor = useMemo(() => {
    const roles = ordenarRoles(usuario?.roles);
    const multiRol = roles.length > 1;
    const porRol = usuario?.permisosPorRol ?? {};
    const rolActivo = eleccion?.usuarioId === usuario?.id && roles.includes(eleccion?.rol) ? eleccion.rol : (roles[0] ?? null);
    const deCuenta = new Set(usuario?.permisos ?? []);
    // Con varios roles, la interfaz solo muestra lo del rol activo; el back valida con todos.
    const activos = multiRol && porRol[rolActivo] ? new Set(porRol[rolActivo]) : deCuenta;
    return {
      usuario,
      autenticado: Boolean(usuario),
      entrar,
      salir,
      refrescarUsuario,
      roles,
      multiRol,
      rolActivo,
      cambiarRol,
      tienePermiso: (...lista) => lista.some((p) => activos.has(p)),
      cuentaTienePermiso: (...lista) => lista.some((p) => deCuenta.has(p)),
      rolCon: (...lista) => roles.find((r) => (porRol[r] ?? []).some((p) => lista.includes(p))) ?? null,
      tieneRol: (rol) => roles.includes(rol),
    };
  }, [usuario, eleccion, entrar, salir, refrescarUsuario, cambiarRol]);

  return <SesionContext value={valor}>{children}</SesionContext>;
}
