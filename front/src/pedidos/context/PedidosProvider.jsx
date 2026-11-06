import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { router } from '../../app/router';
import { useSesion } from '../../auth/context/SesionContext';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { pedidosApi } from '../api/pedidosApi';
import { PedidosContext } from './PedidosContext';

const VACIO = { comprasSinLeer: 0, ventasSinLeer: 0, ventasPorAtender: 0 };
const INTERVALO = 30_000;

/**
 * Pide /pedidos/resumen cada 30 s mientras la pestaña está visible (y al volver a ella).
 * Si un contador sube, avisa con un toast que lleva al lugar donde está lo nuevo.
 * No hay WebSocket: la consulta periódica basta para la demo (decisión D5).
 */
export default function PedidosProvider({ children }) {
  const { usuario, cuentaTienePermiso } = useSesion();
  const { notificar } = useNotificaciones();
  const activo = Boolean(usuario) && cuentaTienePermiso('PEDIDO_CREAR', 'PEDIDO_ATENDER');
  const [resumen, setResumen] = useState(VACIO);
  const [version, setVersion] = useState(0);
  const anterior = useRef(null);

  const consultar = useEffectEvent(async (signal) => {
    const nuevo = await pedidosApi.resumen(signal);
    const antes = anterior.current;
    anterior.current = nuevo;
    setResumen(nuevo);
    if (!antes) return;
    const ir = (ruta) => ({ texto: 'Ver', alHacer: () => router.navigate(ruta) });
    if (nuevo.ventasPorAtender > antes.ventasPorAtender) {
      notificar({ tipo: 'pedido', titulo: 'Tienes un pedido nuevo', texto: 'Acéptalo o recházalo desde Pedidos.', accion: ir('/panel/pedidos') });
    } else if (nuevo.ventasSinLeer > antes.ventasSinLeer) {
      notificar({ tipo: 'mensaje', titulo: 'Un cliente te escribió', texto: 'Respóndele desde Pedidos.', accion: ir('/panel/pedidos') });
    } else if (nuevo.comprasSinLeer > antes.comprasSinLeer) {
      notificar({ tipo: 'mensaje', titulo: 'Tienes novedades de un pedido', texto: 'El vendedor respondió o cambió el estado.', accion: ir('/pedidos') });
    }
  });

  useEffect(() => {
    anterior.current = null;
    if (!activo) return undefined;
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
  }, [activo, usuario?.id, version]);

  /** Vuelve a pedir el resumen ya (por ejemplo, después de leer una conversación). */
  const refrescar = useCallback(() => setVersion((v) => v + 1), []);

  const valor = useMemo(() => ({ resumen: activo ? resumen : VACIO, refrescar }), [activo, resumen, refrescar]);
  return <PedidosContext value={valor}>{children}</PedidosContext>;
}
