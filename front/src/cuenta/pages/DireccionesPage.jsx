import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { confirmar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { cuentaApi, MAXIMO_DIRECCIONES } from '../api/cuentaApi';
import HojaDireccion from '../components/HojaDireccion';

/** Direcciones guardadas en la cuenta; la predeterminada sale primero al pedir. */
export default function DireccionesPage() {
  const { notificar } = useNotificaciones();
  const { datos, error, recargar, mutar } = useConsulta((s) => cuentaApi.direcciones(s), []);
  const [editando, setEditando] = useState(undefined);
  const [enCurso, setEnCurso] = useState(null);
  const lista = datos ?? [];

  async function accion(id, fn, exito) {
    setEnCurso(id);
    try {
      const nueva = await fn();
      mutar(() => nueva);
      notificar({ tipo: 'exito', titulo: exito, guardar: false });
    } catch (err) {
      notificar({ tipo: 'error', titulo: 'No se pudo guardar', texto: err.message, guardar: false });
    } finally {
      setEnCurso(null);
    }
  }

  async function borrar(d) {
    if (await confirmar({ titulo: `¿Borrar "${d.alias}"?`, texto: 'Tus pedidos anteriores no cambian.', boton: 'Borrar', peligro: true })) {
      accion(d.id, () => cuentaApi.eliminarDireccion(d.id), 'Dirección borrada');
    }
  }

  return (
    <Pagina className="mx-auto max-w-md px-4 pb-32">
      <Encabezado
        volver
        titulo="Mis direcciones"
        subtitulo={`Hasta ${MAXIMO_DIRECCIONES} para pedir más rápido`}
        acciones={
          lista.length > 0 &&
          lista.length < MAXIMO_DIRECCIONES && (
            <Boton variante="secundario" icono={Plus} onClick={() => setEditando(null)}>
              Agregar
            </Boton>
          )
        }
      />

      {error && !datos ? (
        <EstadoVacio icono={MapPin} titulo="No pudimos cargar tus direcciones" texto={error.message}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !datos ? (
        <div className="grid gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="esqueleto h-32 rounded-[24px]" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <EstadoVacio icono={MapPin} titulo="Aún no guardas direcciones" texto="Guarda tu casa u oficina y elígela con un toque al pedir un mueble.">
          <Boton icono={Plus} onClick={() => setEditando(null)}>
            Agregar dirección
          </Boton>
        </EstadoVacio>
      ) : (
        <ul className="grid gap-3">
          {lista.map((d, i) => (
            <motion.li
              key={d.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              className={`rounded-[24px] border bg-white p-4 ${d.predeterminada ? 'border-tinta' : 'border-linea'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-[16px] font-semibold">{d.alias}</p>
                {d.predeterminada && <span className="rounded-full bg-tinta px-2.5 py-0.5 text-[11.5px] font-semibold text-crema">Predeterminada</span>}
              </div>
              <p className="mt-1 text-[13.5px] text-texto">
                {d.nombreRecibe} · {d.telefono}
              </p>
              <p className="text-[13.5px] text-gris">
                {d.direccion}, {d.ciudad} {d.codigoPostal}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!d.predeterminada && (
                  <Boton variante="secundario" icono={Star} cargando={enCurso === d.id} disabled={Boolean(enCurso)} onClick={() => accion(d.id, () => cuentaApi.predeterminada(d.id), 'Dirección predeterminada')} className="h-9 px-3 text-[13px]">
                    Por defecto
                  </Boton>
                )}
                <Boton variante="secundario" icono={Pencil} disabled={Boolean(enCurso)} onClick={() => setEditando(d)} className="h-9 px-3 text-[13px]">
                  Editar
                </Boton>
                <Boton variante="fantasma" icono={Trash2} disabled={Boolean(enCurso)} onClick={() => borrar(d)} className="h-9 px-3 text-[13px]">
                  Borrar
                </Boton>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <HojaDireccion
        abierta={editando !== undefined}
        alCerrar={() => setEditando(undefined)}
        direccion={editando}
        alListo={(nueva) => {
          mutar(() => nueva);
          setEditando(undefined);
          notificar({ tipo: 'exito', titulo: 'Dirección guardada', guardar: false });
        }}
      />
    </Pagina>
  );
}
