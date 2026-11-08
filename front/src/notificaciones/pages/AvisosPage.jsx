import { Bell, BellOff, CheckCheck, LogIn, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import { confirmar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { haceCuanto } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import { avisosApi } from '../api/avisosApi';
import { useAvisos } from '../context/AvisosContext';
import { useNotificaciones } from '../context/NotificacionesContext';
import { tipoAviso } from '../tipos';

const FILTROS = [
  { id: 'todos', texto: 'Todos' },
  { id: 'sin-leer', texto: 'Sin leer' },
];
const PASO = 20;

/** Bandeja de avisos de la cuenta. Tocar uno lo marca leído y lleva a lo que avisa; deslizar a la izquierda lo borra. */
export default function AvisosPage() {
  const { usuario } = useSesion();
  if (!usuario) {
    return (
      <Pagina className="mx-auto max-w-md px-4">
        <Encabezado titulo="Avisos" />
        <EstadoVacio icono={Bell} titulo="Entra para ver tus avisos" texto="Aquí te contamos lo que pasa con tus pedidos, tus muebles y tu cuenta.">
          <Boton a="/entrar" icono={LogIn}>
            Entrar
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }
  return <Bandeja />;
}

function Bandeja() {
  const navegar = useNavigate();
  const { sinLeer, refrescar } = useAvisos();
  const { notificar } = useNotificaciones();
  const [filtro, setFiltro] = useState('todos');
  const [cuantos, setCuantos] = useState(PASO);
  const consulta = useConsulta((s) => avisosApi.listar({ sinLeer: filtro === 'sin-leer', size: cuantos }, s), [filtro, cuantos]);
  const lista = consulta.datos?.contenido ?? [];
  const hayMas = consulta.datos ? !consulta.datos.ultima : false;

  async function hacer(fn, cambio) {
    try {
      await fn();
      consulta.mutar((d) => (d ? { ...d, contenido: cambio(d.contenido) } : d));
      refrescar();
    } catch (err) {
      notificar({ tipo: 'error', titulo: 'No se pudo actualizar', texto: err.message });
    }
  }

  function abrir(a) {
    if (!a.leida) hacer(() => avisosApi.marcarLeida(a.id), (l) => l.map((x) => (x.id === a.id ? { ...x, leida: true } : x)));
    if (a.ruta) navegar(a.ruta);
  }

  async function borrarTodo() {
    if (await confirmar({ titulo: '¿Borrar todos los avisos?', texto: 'No se pueden recuperar.', boton: 'Borrar', peligro: true })) {
      hacer(() => avisosApi.vaciar(), () => []);
    }
  }

  return (
    <Pagina className="mx-auto max-w-md px-4">
      <Encabezado
        titulo="Avisos"
        acciones={
          lista.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => hacer(() => avisosApi.marcarTodas(), (l) => l.map((x) => ({ ...x, leida: true })))}
                disabled={!sinLeer}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-terracota hover:bg-terracota-suave disabled:opacity-40"
              >
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
            onClick={() => {
              setFiltro(f.id);
              setCuantos(PASO);
            }}
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

      {consulta.error && !consulta.datos ? (
        <EstadoVacio icono={BellOff} titulo="No pudimos cargar tus avisos" texto={consulta.error.message}>
          <Boton variante="secundario" onClick={consulta.recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !consulta.datos ? (
        <div className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="esqueleto h-20 rounded-[20px]" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <EstadoVacio icono={BellOff} titulo={filtro === 'sin-leer' ? 'Todo al día' : 'Sin avisos'} texto="Aquí verás lo que pase con tus pedidos, tus muebles y tu cuenta." />
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
                  onDragEnd={(_, info) => info.offset.x < -90 && hacer(() => avisosApi.eliminar(a.id), (l) => l.filter((x) => x.id !== a.id))}
                >
                  <button
                    type="button"
                    onClick={() => abrir(a)}
                    className={`flex w-full items-start gap-3 rounded-[20px] border p-3.5 text-left transition-colors ${a.leida ? 'border-linea bg-white/60' : 'border-linea bg-white shadow-[0_8px_20px_-16px_rgba(29,27,24,0.5)]'}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-[14px]" style={{ background: fondo, color }}>
                      <Icono className="size-[19px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[14.5px] ${a.leida ? 'font-medium text-texto' : 'font-semibold'}`}>{a.titulo}</span>
                      {a.texto && <span className="mt-0.5 block text-[13px] leading-snug text-gris">{a.texto}</span>}
                      <span className="mt-1 block text-[11.5px] font-medium text-gris-2">{haceCuanto(a.fecha)}</span>
                    </span>
                    {!a.leida && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-terracota" aria-label="Sin leer" />}
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {hayMas && (
        <Boton variante="secundario" bloque cargando={consulta.cargando} onClick={() => setCuantos((c) => c + PASO)} className="mt-4">
          Ver más
        </Boton>
      )}
      {lista.length > 0 && <p className="mt-4 text-center text-[12px] text-gris-2">Desliza un aviso a la izquierda para borrarlo.</p>}
    </Pagina>
  );
}
