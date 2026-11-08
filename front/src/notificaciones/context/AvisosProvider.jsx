import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { router } from '../../app/router';
import { useSesion } from '../../auth/context/SesionContext';
import { ponerInsignia } from '../../pwa/estadoPwa';
import { avisosApi } from '../api/avisosApi';
import { AvisosContext } from './AvisosContext';
import { useNotificaciones } from './NotificacionesContext';

const INTERVALO = 30_000;

/**
 * Cuenta los avisos sin leer de la cuenta cada 30 s mientras la pestaña está visible. Si llega
 * uno nuevo, lo muestra en un toast con su botón; los de pedidos ya los avisa PedidosProvider.
 * El total también va en el icono de la app instalada (Badging API).
 */
export default function AvisosProvider({ children }) {
  const { usuario, cuentaTienePermiso } = useSesion();
  const { notificar } = useNotificaciones();
  const [sinLeer, setSinLeer] = useState(0);
  const [version, setVersion] = useState(0);
  const anterior = useRef(null);
  const usuarioId = usuario?.id ?? null;
  const conPedidos = Boolean(usuario) && cuentaTienePermiso('PEDIDO_CREAR', 'PEDIDO_ATENDER');

  const consultar = useEffectEvent(async (signal) => {
    const total = await avisosApi.sinLeer(signal);
    const antes = anterior.current;
    anterior.current = total;
    setSinLeer(total);
    if (antes === null || total <= antes) return;
    const { contenido } = await avisosApi.listar({ size: 1 }, signal);
    const ultimo = contenido[0];
    if (!ultimo || (ultimo.tipo === 'pedido' && conPedidos)) return;
    notificar({
      tipo: ultimo.tipo,
      titulo: ultimo.titulo,
      texto: ultimo.texto,
      accion: ultimo.ruta ? { texto: 'Ver', alHacer: () => router.navigate(ultimo.ruta) } : undefined,
    });
  });

  useEffect(() => {
    anterior.current = null;
    if (!usuarioId) return undefined;
    const control = new AbortController();
    const revisar = () => {
      if (document.visibilityState === 'visible') consultar(control.signal).catch(() => {});
    };
    revisar();
    const intervalo = setInterval(revisar, INTERVALO);
    document.addEventListener('visibilitychange', revisar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', revisar);
      control.abort();
    };
  }, [usuarioId, version]);

  // Con la app instalada, el icono muestra cuántos avisos faltan por leer (0 sin sesión la limpia).
  useEffect(() => ponerInsignia(usuarioId ? sinLeer : 0), [usuarioId, sinLeer]);

  /** Vuelve a contar ya (después de leer o borrar en la bandeja). */
  const refrescar = useCallback(() => setVersion((v) => v + 1), []);

  const valor = useMemo(() => ({ sinLeer: usuarioId ? sinLeer : 0, refrescar }), [usuarioId, sinLeer, refrescar]);
  return <AvisosContext value={valor}>{children}</AvisosContext>;
}
