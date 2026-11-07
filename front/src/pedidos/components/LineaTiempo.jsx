import { Ban, Check, CircleX, MessageCircleQuestion } from 'lucide-react';
import { motion } from 'motion/react';
import { Hourglass } from 'lucide-react';
import { datosEstado, pasosDe } from '../estados';

const hora = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/**
 * Avance del pedido: solicitado, aceptado, en camino (o listo para recoger) y entregado.
 * Una consulta o un pedido cerrado sin entregar muestran un aviso en lugar de los pasos.
 */
export default function LineaTiempo({ pedido }) {
  if (pedido.estado === 'CONSULTA') {
    return (
      <Aviso Icono={MessageCircleQuestion} fondo="#E7E1D6" color="#4A443C" titulo="Todavía es una consulta">
        Pregunta lo que necesites. Cuando te decidas, conviértela en pedido con el botón de abajo.
      </Aviso>
    );
  }
  if (pedido.estado === 'VENCIDO') {
    return (
      <Aviso Icono={Hourglass} fondo="#E4E2DE" color="#4A443C" titulo="El apartado venció">
        No se liquidó antes de la fecha límite y las piezas regresaron al inventario.
      </Aviso>
    );
  }
  if (pedido.estado === 'RECHAZADO' || pedido.estado === 'CANCELADO') {
    const rechazado = pedido.estado === 'RECHAZADO';
    return (
      <Aviso
        Icono={rechazado ? CircleX : Ban}
        fondo={rechazado ? '#F6DAD7' : '#E4E2DE'}
        color={rechazado ? '#8C1D17' : '#4A443C'}
        titulo={rechazado ? 'El vendedor rechazó el pedido' : 'Pedido cancelado'}
      >
        {pedido.motivoCierre ? `Motivo: ${pedido.motivoCierre}` : 'Sin motivo indicado.'}
      </Aviso>
    );
  }

  const pasos = pasosDe(pedido);
  const actual = pasos.findIndex((p) => p.estado === pedido.estado);
  return (
    <ol className={`grid gap-1 ${pasos.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`} aria-label="Avance del pedido">
      {pasos.map((paso, i) => {
        const fecha = paso.valor ? paso.valor(pedido) : pedido[paso.fecha];
        const hecho = i <= actual;
        const { texto } = datosEstado(paso.estado, pedido.tipoEntrega);
        return (
          <li key={paso.estado} className="relative flex flex-col items-center text-center" aria-current={i === actual ? 'step' : undefined}>
            {i > 0 && (
              <span aria-hidden className="absolute left-[calc(-50%+18px)] top-[13px] h-[2px] w-[calc(100%-36px)] overflow-hidden rounded-full bg-linea">
                <motion.span
                  className="block h-full bg-salvia"
                  initial={{ width: 0 }}
                  animate={{ width: hecho ? '100%' : 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                />
              </span>
            )}
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { delay: 0.08 * i } }}
              className={`relative grid size-7 place-items-center rounded-full text-[12px] font-bold ${
                hecho ? 'bg-salvia text-white' : 'border-2 border-linea bg-white text-gris-2'
              }`}
            >
              {hecho ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
            </motion.span>
            <span className={`mt-1.5 text-[11.5px] font-semibold leading-tight ${hecho ? 'text-tinta' : 'text-gris'}`}>{texto}</span>
            {fecha && <span className="mt-0.5 text-[10.5px] text-gris">{hora.format(new Date(fecha))}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function Aviso({ Icono, fondo, color, titulo, children }) {
  return (
    <div className="flex gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: fondo, color }}>
      <Icono className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="text-[14px] font-semibold">{titulo}</p>
        <p className="mt-0.5 text-[13px] leading-snug opacity-90">{children}</p>
      </div>
    </div>
  );
}
