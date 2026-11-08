import { Ban, CalendarClock, CircleCheck, CircleX, HandCoins, PackageCheck, ShoppingBag, Store, Truck } from 'lucide-react';
import { precio } from '../../common/utils/formato';
import { useState } from 'react';
import { confirmar, pedirTexto } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { pedidosApi } from '../api/pedidosApi';

/**
 * Cómo se ve cada acción. El back ya dice cuáles puede hacer esta persona (pedido.acciones),
 * así el front no repite la máquina de estados.
 */
function accion(estado, p) {
  const consulta = p.estado === 'CONSULTA';
  const apartado = p.estado === 'APARTADO';
  switch (estado) {
    case 'APARTADO':
      return { texto: 'Confirmar anticipo', Icono: CalendarClock, variante: 'acento', apartado: true };
    case 'SOLICITADO':
      return { texto: 'Pedir este mueble', Icono: ShoppingBag, variante: 'acento', hoja: true };
    case 'ACEPTADO':
      if (apartado) {
        return {
          texto: 'Marcar liquidado',
          Icono: HandCoins,
          variante: 'primario',
          exito: 'Apartado liquidado',
          confirmar: {
            titulo: '¿Ya liquidó el apartado?',
            texto: `Confirma que recibiste lo que restaba (${precio(p.apartado?.resta ?? 0)}). El pedido sigue como aceptado para acordar la entrega.`,
            boton: 'Sí, liquidado',
          },
        };
      }
      if (p.apartado) {
        // El cliente pidió apartar, pero el vendedor puede aceptarlo como venta normal.
        return {
          texto: 'Aceptar con pago completo',
          Icono: CircleCheck,
          variante: 'secundario',
          exito: 'Pedido aceptado con pago completo',
          confirmar: {
            titulo: '¿Aceptar con pago completo?',
            texto: `Ya no se aparta: el cliente paga el total (${precio(p.total)}) en lugar del anticipo. Se descuentan ${p.cantidad} de las existencias de ${p.mueble.nombre}.`,
            boton: 'Aceptar',
          },
        };
      }
      return {
        texto: 'Aceptar pedido',
        Icono: CircleCheck,
        variante: 'primario',
        exito: 'Pedido aceptado',
        confirmar: {
          titulo: '¿Aceptar el pedido?',
          texto: `Se descuentan ${p.cantidad} de las existencias de ${p.mueble.nombre}. Después acuerden el pago y la entrega en la conversación.`,
          boton: 'Aceptar pedido',
        },
      };
    case 'RECHAZADO':
      return {
        texto: consulta ? 'Cerrar consulta' : 'Rechazar',
        Icono: CircleX,
        variante: 'secundario',
        exito: consulta ? 'Consulta cerrada' : 'Pedido rechazado',
        motivo: {
          titulo: consulta ? '¿Cerrar la consulta?' : '¿Rechazar el pedido?',
          texto: 'El cliente verá el motivo en la conversación.',
          placeholder: 'Por ejemplo: ya no lo fabricamos en ese color',
          boton: consulta ? 'Cerrar consulta' : 'Rechazar',
          obligatorio: true,
          peligro: true,
        },
      };
    case 'EN_CAMINO': {
      const recoger = p.tipoEntrega === 'RECOGER';
      if (!recoger && p.lado === 'VENDEDOR') {
        return { texto: 'Enviar pedido', Icono: Truck, variante: 'primario', enviar: true };
      }
      return {
        texto: recoger ? 'Listo para recoger' : 'Marcar en camino',
        Icono: recoger ? Store : Truck,
        variante: 'primario',
        exito: recoger ? 'Avisamos que está listo' : 'Pedido en camino',
        confirmar: {
          titulo: recoger ? '¿Ya está listo para recoger?' : '¿El pedido ya va en camino?',
          texto: 'Le avisamos al cliente por correo y en la conversación.',
          boton: 'Sí, avisar',
        },
      };
    }
    case 'ENTREGADO':
      return {
        texto: p.lado === 'CLIENTE' ? 'Ya lo recibí' : 'Marcar entregado',
        Icono: PackageCheck,
        variante: 'primario',
        exito: 'Pedido entregado',
        confirmar: {
          titulo: p.lado === 'CLIENTE' ? '¿Ya tienes el mueble?' : '¿El cliente ya lo recibió?',
          texto: 'El pedido se cierra y la conversación queda solo para consulta.',
          boton: 'Sí, entregado',
        },
      };
    case 'CANCELADO':
      if (apartado) {
        return {
          texto: 'Cancelar apartado',
          Icono: Ban,
          variante: 'secundario',
          exito: 'Apartado cancelado',
          motivo: {
            titulo: '¿Cancelar el apartado?',
            texto: 'Las piezas regresan al inventario. El anticipo lo resuelven entre ustedes.',
            placeholder: p.lado === 'CLIENTE' ? 'Motivo (opcional)' : 'Motivo de la cancelación',
            boton: 'Cancelar apartado',
            obligatorio: p.lado !== 'CLIENTE',
            peligro: true,
          },
        };
      }
      return {
        texto: consulta ? 'Cerrar consulta' : 'Cancelar pedido',
        Icono: Ban,
        variante: 'secundario',
        exito: consulta ? 'Consulta cerrada' : 'Pedido cancelado',
        motivo: {
          titulo: consulta ? '¿Cerrar la consulta?' : '¿Cancelar el pedido?',
          texto: p.lado === 'SUPERVISOR' ? 'Cliente y vendedor verán el motivo.' : 'Si quieres, cuéntale al vendedor por qué.',
          placeholder: p.lado === 'SUPERVISOR' ? 'Motivo de la cancelación' : 'Motivo (opcional)',
          boton: consulta ? 'Cerrar consulta' : 'Cancelar pedido',
          obligatorio: p.lado === 'SUPERVISOR',
          peligro: true,
        },
      };
    default:
      return null;
  }
}

/** Botones según pedido.acciones. alSolicitar abre la hoja para convertir la consulta en pedido. */
export default function AccionesPedido({ pedido, alActualizar, alSolicitar, alConfirmarApartado, alEnviar, className = '' }) {
  const { notificar } = useNotificaciones();
  const [enCurso, setEnCurso] = useState(null);
  const lista = pedido.acciones.map((estado) => ({ estado, ...accion(estado, pedido) })).filter((a) => a.texto);
  if (!lista.length) return null;

  async function ejecutar(a) {
    if (a.hoja) return alSolicitar();
    if (a.apartado) return alConfirmarApartado();
    if (a.enviar) return alEnviar();
    let motivo = null;
    if (a.motivo) {
      motivo = await pedirTexto(a.motivo);
      if (motivo === null) return undefined;
    } else if (a.confirmar && !(await confirmar(a.confirmar))) {
      return undefined;
    }
    setEnCurso(a.estado);
    try {
      alActualizar(await pedidosApi.cambiarEstado(pedido.id, a.estado, motivo || null));
      notificar({ tipo: 'exito', titulo: a.exito, texto: `${pedido.folio} · ${pedido.mueble.nombre}`, guardar: false });
    } catch (error) {
      notificar({ tipo: 'error', titulo: 'No se pudo actualizar el pedido', texto: error.message, guardar: false });
    } finally {
      setEnCurso(null);
    }
    return undefined;
  }

  // Lo principal primero y a todo lo ancho. Los secundarios miden según su texto y crecen:
  // si dos no caben en una fila, cada uno baja a la suya en lugar de cortar o desbordar el texto.
  const orden = (a) => (a.variante === 'secundario' ? 1 : 0);
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {[...lista].sort((x, y) => orden(x) - orden(y)).map((a) => (
        <Boton
          key={a.estado}
          variante={a.variante}
          icono={a.Icono}
          cargando={enCurso === a.estado}
          disabled={Boolean(enCurso)}
          onClick={() => ejecutar(a)}
          className={`whitespace-nowrap ${a.variante === 'secundario' ? 'flex-auto' : 'w-full'}`}
        >
          {a.texto}
        </Boton>
      ))}
    </div>
  );
}
