import { Mail, Phone, Plus, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { confirmar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Interruptor from '../../common/components/Interruptor';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { transportistasApi } from '../api/transportistasApi';
import HojaTransportista from '../components/HojaTransportista';

/** Mis transportistas: los registro, les reenvío la invitación y los doy de baja o de alta. */
export default function TransportistasPage() {
  const { notificar } = useNotificaciones();
  const { datos, error, recargar, mutar } = useConsulta((s) => transportistasApi.listar(s), []);
  const [hoja, setHoja] = useState(false);
  const [ocupado, setOcupado] = useState(null);
  const lista = datos ?? [];

  function reemplazar(t) {
    mutar((l) => (l.some((x) => x.id === t.id) ? l.map((x) => (x.id === t.id ? t : x)) : [...l, t].sort((a, b) => a.nombre.localeCompare(b.nombre))));
  }

  async function accion(t, fn, exito) {
    setOcupado(t.id);
    try {
      reemplazar(await fn());
      notificar({ tipo: 'exito', titulo: exito });
    } catch (err) {
      notificar({ tipo: 'error', titulo: 'No se pudo guardar', texto: err.message });
    } finally {
      setOcupado(null);
    }
  }

  async function cambiarActivo(t, activo) {
    if (!activo) {
      const ok = await confirmar({
        titulo: `¿Dar de baja a ${t.nombre}?`,
        texto: 'Ya no podrá entrar ni recibir envíos. Puedes darlo de alta otra vez.',
        boton: 'Dar de baja',
        peligro: true,
      });
      if (!ok) return;
    }
    accion(t, () => transportistasApi.cambiarActivo(t.id, activo), activo ? `${t.nombre} está de alta` : `${t.nombre} está de baja`);
  }

  return (
    <Pagina className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Mis transportistas" texto="Quién lleva tus envíos a domicilio. Solo tú puedes asignarles pedidos.">
        {lista.length > 0 && (
          <Boton icono={Plus} onClick={() => setHoja(true)}>
            Agregar
          </Boton>
        )}
      </EncabezadoPanel>

      {error && !datos ? (
        <EstadoVacio icono={Truck} titulo="No pudimos cargar tus transportistas" texto={error.message}>
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
        <EstadoVacio icono={Truck} titulo="Aún no tienes transportistas" texto="Regístralos con su correo; les llega una invitación para activar su cuenta.">
          <Boton icono={Plus} onClick={() => setHoja(true)}>
            Agregar transportista
          </Boton>
        </EstadoVacio>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.04 } }}
              className={`rounded-[24px] border bg-white p-4 ${t.activo ? 'border-linea' : 'border-dashed border-borde opacity-75'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-[16px] font-semibold">{t.nombre}</p>
                  <p className="text-[12.5px] text-gris">
                    {t.enCamino > 0 ? `${t.enCamino} ${t.enCamino === 1 ? 'entrega' : 'entregas'} en camino` : 'Sin entregas ahora'}
                  </p>
                </div>
                {t.invitacionPendiente ? (
                  <span className="shrink-0 rounded-full bg-terracota-suave px-2.5 py-0.5 text-[11.5px] font-semibold text-terracota">Invitación enviada</span>
                ) : !t.activo ? (
                  <span className="shrink-0 rounded-full bg-crema px-2.5 py-0.5 text-[11.5px] font-semibold text-gris">De baja</span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-1 text-[13px] text-gris">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">{t.email}</span>
                </span>
                {t.telefono && (
                  <a href={`tel:${t.telefono.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-tinta">
                    <Phone className="size-3.5" aria-hidden /> {t.telefono}
                  </a>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                {t.invitacionPendiente ? (
                  <Boton
                    variante="secundario"
                    icono={Mail}
                    cargando={ocupado === t.id}
                    disabled={Boolean(ocupado)}
                    onClick={() => accion(t, () => transportistasApi.reenviarInvitacion(t.id), 'Invitación enviada otra vez')}
                    className="h-9 px-3 text-[13px]"
                  >
                    Reenviar invitación
                  </Boton>
                ) : (
                  <span />
                )}
                <label className="flex items-center gap-2 text-[13px] font-semibold text-texto">
                  {t.activo ? 'Activo' : 'De baja'}
                  <Interruptor etiqueta={`${t.nombre} activo`} activo={t.activo} alCambiar={(v) => cambiarActivo(t, v)} />
                </label>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <HojaTransportista
        abierta={hoja}
        alCerrar={() => setHoja(false)}
        alListo={(t) => {
          reemplazar(t);
          setHoja(false);
          notificar({ tipo: 'exito', titulo: `Invitamos a ${t.nombre}`, texto: `Le llegó un correo a ${t.email} para activar su cuenta.` });
        }}
      />
    </Pagina>
  );
}
