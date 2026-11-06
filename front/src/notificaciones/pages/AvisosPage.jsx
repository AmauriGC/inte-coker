import { BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { confirmar } from '../../common/alertas/alertas';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import { haceCuanto } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../context/NotificacionesContext';
import { tipoAviso } from '../tipos';

const FILTROS = [
  { id: 'todos', texto: 'Todos' },
  { id: 'sin-leer', texto: 'Sin leer' },
];

/** Bandeja de avisos (tablero "10 · Avisos y toasts"). Deslizar a la izquierda borra. */
export default function AvisosPage() {
  const { avisos, sinLeer, marcarLeido, marcarTodo, eliminar, vaciar } = useNotificaciones();
  const [filtro, setFiltro] = useState('todos');
  const lista = filtro === 'sin-leer' ? avisos.filter((a) => !a.leido) : avisos;

  async function borrarTodo() {
    if (await confirmar({ titulo: '¿Borrar todos los avisos?', texto: 'No se pueden recuperar.', boton: 'Borrar', peligro: true })) vaciar();
  }

  return (
    <Pagina className="mx-auto max-w-md px-4">
      <Encabezado
        titulo="Avisos"
        acciones={
          avisos.length > 0 && (
            <>
              <button type="button" onClick={marcarTodo} disabled={!sinLeer} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-terracota hover:bg-terracota-suave disabled:opacity-40">
                <CheckCheck className="size-4" /> Marcar todo leído
              </button>
              <button type="button" onClick={borrarTodo} className="grid size-9 place-items-center rounded-full text-gris hover:bg-crema-2" aria-label="Borrar todos los avisos">
                <Trash2 className="size-4" />
              </button>
            </>
          )
        }
      />

      <div role="tablist" className="mb-4 flex gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`relative h-9 rounded-full border px-4 text-[13px] font-semibold ${filtro === f.id ? 'border-tinta text-crema' : 'border-borde bg-white text-tinta'}`}
          >
            {filtro === f.id && <motion.span layoutId="filtro-avisos" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">
              {f.texto}
              {f.id === 'sin-leer' && sinLeer > 0 && ` · ${sinLeer}`}
            </span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <EstadoVacio icono={BellOff} titulo={filtro === 'sin-leer' ? 'Todo al día' : 'Sin avisos'} texto="Aquí verás lo que pase con tus favoritos y tus muebles." />
      ) : (
        <ul className="grid gap-2">
          <AnimatePresence initial={false}>
            {lista.map((a, i) => {
              const { Icono, fondo, color } = tipoAviso(a.tipo);
              return (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }}
                  exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.6, right: 0.05 }}
                  onDragEnd={(_, info) => info.offset.x < -90 && eliminar(a.id)}
                >
                  <button
                    type="button"
                    onClick={() => marcarLeido(a.id)}
                    className={`flex w-full items-start gap-3 rounded-[20px] border p-3.5 text-left transition-colors ${a.leido ? 'border-linea bg-white/60' : 'border-linea bg-white shadow-[0_8px_20px_-16px_rgba(29,27,24,0.5)]'}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-[14px]" style={{ background: fondo, color }}>
                      <Icono className="size-[19px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[14.5px] ${a.leido ? 'font-medium text-texto' : 'font-semibold'}`}>{a.titulo}</span>
                      {a.texto && <span className="mt-0.5 block text-[13px] leading-snug text-gris">{a.texto}</span>}
                      <span className="mt-1 block text-[11.5px] font-medium text-gris-2">{haceCuanto(a.fecha)}</span>
                    </span>
                    {!a.leido && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-terracota" aria-label="Sin leer" />}
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {lista.length > 0 && <p className="mt-4 text-center text-[12px] text-gris-2">Desliza un aviso a la izquierda para borrarlo.</p>}
    </Pagina>
  );
}
