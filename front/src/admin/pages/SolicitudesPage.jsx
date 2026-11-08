import { Check, MapPin, Phone, UserPlus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { confirmar, pedirTexto } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { haceCuanto } from '../../common/utils/formato';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { adminApi } from '../api/adminApi';

const FILTROS = [
  { id: 'PENDIENTE', texto: 'Por revisar' },
  { id: 'APROBADA', texto: 'Aprobadas' },
  { id: 'RECHAZADA', texto: 'Rechazadas' },
  { id: '', texto: 'Todas' },
];
const ESTADOS = {
  PENDIENTE: { texto: 'Por revisar', clase: 'bg-terracota-suave text-terracota' },
  APROBADA: { texto: 'Aprobada', clase: 'bg-salvia-suave text-salvia' },
  RECHAZADA: { texto: 'Rechazada', clase: 'bg-[#F6DAD7] text-[#8C1D17]' },
};
const PASO = 20;

/** Solicitudes para vender: el administrador las aprueba (suma el rol Vendedor) o las rechaza con un motivo. */
export default function SolicitudesPage() {
  const { notificar } = useNotificaciones();
  const [estado, setEstado] = useState('PENDIENTE');
  const [cuantos, setCuantos] = useState(PASO);
  const [ocupado, setOcupado] = useState(null);
  const consulta = useConsulta((s) => adminApi.solicitudes({ estado, size: cuantos }, s), [estado, cuantos]);
  const lista = consulta.datos?.contenido ?? [];

  async function revisar(s, aprobar) {
    let motivo = null;
    if (aprobar) {
      const ok = await confirmar({
        titulo: `¿Aprobar a ${s.usuario.nombre}?`,
        texto: 'Su cuenta suma el rol Vendedor: podrá publicar muebles y atender pedidos.',
        boton: 'Aprobar',
      });
      if (!ok) return;
    } else {
      motivo = await pedirTexto({
        titulo: `¿Por qué no se aprueba?`,
        texto: `${s.usuario.nombre} lo recibe por correo y puede volver a pedirlo.`,
        placeholder: 'Faltan fotos de tus trabajos…',
        boton: 'Rechazar',
        obligatorio: true,
        peligro: true,
      });
      if (motivo === null) return;
    }
    setOcupado(s.id);
    try {
      const nueva = aprobar ? await adminApi.aprobarSolicitud(s.id) : await adminApi.rechazarSolicitud(s.id, motivo);
      consulta.mutar((d) => ({
        ...d,
        contenido: estado ? d.contenido.filter((x) => x.id !== s.id) : d.contenido.map((x) => (x.id === s.id ? nueva : x)),
      }));
      notificar({ tipo: 'exito', titulo: aprobar ? `${s.usuario.nombre} ya puede vender` : 'Solicitud rechazada' });
    } catch (err) {
      notificar({ tipo: 'error', titulo: 'No se pudo revisar', texto: err.message });
    } finally {
      setOcupado(null);
    }
  }

  return (
    <Pagina className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Solicitudes para vender" texto="Quién quiere publicar sus muebles. Al aprobar, su cuenta suma el panel de vendedor." />

      <div role="tablist" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        {FILTROS.map((f) => (
          <button
            key={f.id || 'todas'}
            type="button"
            role="tab"
            aria-selected={estado === f.id}
            onClick={() => {
              setEstado(f.id);
              setCuantos(PASO);
            }}
            className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-colors ${
              estado === f.id ? 'border-tinta bg-tinta text-crema' : 'border-borde bg-white text-tinta hover:bg-crema'
            }`}
          >
            {f.texto}
          </button>
        ))}
      </div>

      {consulta.error && !consulta.datos ? (
        <EstadoVacio icono={UserPlus} titulo="No pudimos cargar las solicitudes" texto={consulta.error.message}>
          <Boton variante="secundario" onClick={consulta.recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !consulta.datos ? (
        <div className="grid gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="esqueleto h-44 rounded-[24px]" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <EstadoVacio
          icono={UserPlus}
          titulo={estado === 'PENDIENTE' ? 'Nada por revisar' : 'Sin solicitudes'}
          texto="Los clientes piden vender desde Cuenta > Quiero vender."
        />
      ) : (
        <ul className="grid gap-3">
          {lista.map((s, i) => {
            const e = ESTADOS[s.estado];
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.04 } }}
                className="rounded-[24px] border border-linea bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-[16px] font-semibold">{s.usuario.nombre}</p>
                    <p className="truncate text-[13px] text-gris">{s.usuario.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${e.clase}`}>{e.texto}</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-texto">{s.mensaje}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-gris">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {s.ciudad}
                  </span>
                  <a href={`tel:${s.telefono.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1 hover:text-tinta">
                    <Phone className="size-3.5" aria-hidden /> {s.telefono}
                  </a>
                  <span>Enviada {haceCuanto(s.creadaEn)}</span>
                </div>
                {s.estado === 'RECHAZADA' && s.motivo && <p className="mt-2 text-[13px] text-[#8C1D17]">Motivo: {s.motivo}</p>}
                {s.revisadoPor && (
                  <p className="mt-1 text-[12px] text-gris-2">
                    Revisó {s.revisadoPor} {haceCuanto(s.revisadaEn)}
                  </p>
                )}
                {s.estado === 'PENDIENTE' && (
                  <div className="mt-4 flex gap-2">
                    <Boton icono={Check} cargando={ocupado === s.id} disabled={Boolean(ocupado)} onClick={() => revisar(s, true)} className="h-10 px-4 text-[14px]">
                      Aprobar
                    </Boton>
                    <Boton variante="secundario" icono={X} disabled={Boolean(ocupado)} onClick={() => revisar(s, false)} className="h-10 px-4 text-[14px]">
                      Rechazar
                    </Boton>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
      {consulta.datos && !consulta.datos.ultima && (
        <Boton variante="secundario" bloque cargando={consulta.cargando} onClick={() => setCuantos((c) => c + PASO)} className="mt-4">
          Ver más
        </Boton>
      )}
    </Pagina>
  );
}
