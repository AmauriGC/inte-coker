import { Lock, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import { useEnvio } from '../../common/hooks/useEnvio';
import { usePedidos } from '../context/PedidosContext';
import { pedidosApi } from '../api/pedidosApi';

const INTERVALO = 10_000;
const hora = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' });
const dia = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

/** Junta sin repetir y en orden: un mensaje propio puede llegar también en la siguiente consulta. */
function juntar(actuales, nuevos) {
  const porId = new Map((actuales ?? []).map((m) => [m.id, m]));
  nuevos.forEach((m) => porId.set(m.id, m));
  return [...porId.values()].sort((a, b) => a.id - b.id);
}

/**
 * Chat del pedido. Pide los mensajes nuevos cada 10 s con la pestaña visible; si llegan
 * mensajes del otro lado, marca la conversación como leída. Si llega un mensaje del
 * sistema (cambio de estado), avisa con alCambiarEstado para recargar el pedido.
 * Se monta con key={pedido.id}: cada pedido empieza de cero.
 */
export default function Conversacion({ pedido, alCambiarEstado, className = '' }) {
  const { usuario } = useSesion();
  const { refrescar } = usePedidos();
  const [mensajes, setMensajes] = useState(null);
  const [texto, setTexto] = useState('');
  const ultimo = useRef(null);
  const fin = useRef(null);
  const { enviar, enviando, error } = useEnvio((t) => pedidosApi.escribir(pedido.id, t));
  const participa = pedido.lado !== 'SUPERVISOR';

  const traer = useEffectEvent(async (signal) => {
    const despuesDe = ultimo.current;
    const nuevos = await pedidosApi.mensajes(pedido.id, despuesDe ?? undefined, signal);
    if (despuesDe !== null && !nuevos.length) return;
    if (nuevos.length) ultimo.current = Math.max(despuesDe ?? 0, ...nuevos.map((m) => m.id));
    setMensajes((actuales) => juntar(despuesDe === null ? [] : actuales, nuevos));

    const ajenos = nuevos.some((m) => m.autorId !== usuario?.id);
    if (participa && (despuesDe === null ? pedido.sinLeer > 0 : ajenos)) {
      pedidosApi.leido(pedido.id).then(refrescar, () => {});
    }
    if (despuesDe !== null && nuevos.some((m) => m.autor === 'SISTEMA')) alCambiarEstado?.();
  });

  // actividadEn cambia cuando esta persona cambia el estado: trae el mensaje del sistema ya.
  useEffect(() => {
    const control = new AbortController();
    const revisar = () => {
      if (document.visibilityState === 'visible') traer(control.signal).catch(() => {});
    };
    revisar();
    const intervalo = setInterval(revisar, INTERVALO);
    document.addEventListener('visibilitychange', revisar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', revisar);
      control.abort();
    };
  }, [pedido.id, pedido.actividadEn]);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [mensajes?.length]);

  async function alEnviar(e) {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    const r = await enviar(limpio);
    if (r.ok) {
      setTexto('');
      setMensajes((actuales) => juntar(actuales, [r.datos]));
    }
  }

  function alTeclear(e) {
    if (e.key === 'Enter' && !e.shiftKey) alEnviar(e);
  }

  return (
    <section className={`flex flex-col overflow-hidden rounded-[24px] border border-linea bg-white ${className}`} aria-label="Conversación">
      <header className="flex items-center justify-between gap-3 border-b border-linea px-4 py-3">
        <h2 className="font-display text-[16px] font-semibold">Conversación</h2>
        <p className="truncate text-[12.5px] text-gris">
          {pedido.lado === 'CLIENTE' ? `con ${pedido.vendedor.nombre}` : pedido.lado === 'VENDEDOR' ? `con ${pedido.cliente.nombre}` : 'solo lectura'}
        </p>
      </header>

      <ol className="flex min-h-56 flex-1 flex-col gap-2 overflow-y-auto bg-crema/60 px-3 py-4" aria-live="polite">
        {mensajes === null &&
          [0, 1, 2].map((i) => <li key={i} className={`esqueleto h-11 w-2/3 rounded-2xl ${i % 2 ? 'self-end' : ''}`} aria-hidden />)}
        {mensajes?.length === 0 && <li className="m-auto text-[13px] text-gris">Aún no hay mensajes.</li>}
        <AnimatePresence initial={false}>
          {mensajes?.map((m, i) => (
            <Mensaje key={m.id} mensaje={m} propio={m.autorId === usuario?.id} anterior={mensajes[i - 1]} pedido={pedido} />
          ))}
        </AnimatePresence>
        <li ref={fin} aria-hidden />
      </ol>

      {pedido.puedeEscribir ? (
        <form onSubmit={alEnviar} className="flex items-end gap-2 border-t border-linea p-2.5">
          <label htmlFor={`mensaje-${pedido.id}`} className="sr-only">
            Escribe un mensaje
          </label>
          <textarea
            id={`mensaje-${pedido.id}`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={alTeclear}
            rows={1}
            maxLength={1000}
            placeholder="Escribe un mensaje"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[20px] border border-borde bg-white px-4 py-2.5 text-[15px] outline-none [field-sizing:content] focus:border-tinta focus:ring-4 focus:ring-tinta/5"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-tinta text-crema transition-opacity disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="size-[18px]" />
          </button>
        </form>
      ) : (
        <p className="flex items-center gap-2 border-t border-linea px-4 py-3 text-[13px] text-gris">
          <Lock className="size-4 shrink-0" aria-hidden />
          {participa ? 'El pedido está cerrado; la conversación queda para consulta.' : 'Como administrador ves la conversación, pero no escribes en ella.'}
        </p>
      )}
      {error && <p role="alert" className="px-4 pb-3 text-[12.5px] text-[#B3261E]">{error.message}</p>}
    </section>
  );
}

function Mensaje({ mensaje, propio, anterior, pedido }) {
  const fecha = new Date(mensaje.creadoEn);
  const otroDia = !anterior || new Date(anterior.creadoEn).toDateString() !== fecha.toDateString();
  const separador = otroDia && (
    <p className="mx-auto my-1 rounded-full bg-white/80 px-3 py-0.5 text-[11px] font-semibold capitalize text-gris">{dia.format(fecha)}</p>
  );

  if (mensaje.autor === 'SISTEMA') {
    return (
      <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1">
        {separador}
        <p className="max-w-[88%] rounded-2xl bg-salvia-suave px-3 py-1.5 text-center text-[12.5px] font-medium text-salvia">
          {mensaje.texto}
          <span className="ml-1.5 text-[10.5px] opacity-70">{hora.format(fecha)}</span>
        </p>
      </motion.li>
    );
  }

  // El administrador no es parte de la conversación: ve al cliente a la izquierda y al vendedor a la derecha.
  const derecha = pedido.lado === 'SUPERVISOR' ? mensaje.autor === 'VENDEDOR' : propio;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col gap-1 ${derecha ? 'items-end' : 'items-start'}`}
    >
      {separador && <div className="self-center">{separador}</div>}
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words rounded-[20px] px-3.5 py-2 text-[14.5px] leading-snug ${
          derecha ? 'rounded-br-md bg-tinta text-crema' : 'rounded-bl-md border border-linea bg-white text-tinta'
        }`}
      >
        {!propio && <span className="mb-0.5 block text-[11.5px] font-semibold opacity-70">{mensaje.autorNombre}</span>}
        {mensaje.texto}
        <span className={`mt-0.5 block text-right text-[10.5px] ${derecha ? 'text-crema/60' : 'text-gris'}`}>{hora.format(fecha)}</span>
      </div>
    </motion.li>
  );
}
