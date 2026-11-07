import { MapPin, PackageCheck, PackageX, Phone, Store, User } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { confirmar, pedirTexto } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import ChipEstado from '../../pedidos/components/ChipEstado';
import { PAGOS } from '../../pedidos/estados';
import { entregasApi } from '../api/entregasApi';

/** Lo que el transportista necesita en la puerta: a quién, dónde, qué y cuánto cobrar. */
export default function EntregaPage() {
  const { id } = useParams();
  const { notificar } = useNotificaciones();
  const { datos: e, error, mutar } = useConsulta((s) => entregasApi.entrega(id, s), [id]);
  const [enCurso, setEnCurso] = useState(null);

  if (error && !e) {
    return (
      <Pagina className="mx-auto max-w-2xl px-4 pb-32">
        <Encabezado volver titulo="Entrega" />
        <EstadoVacio icono={PackageX} titulo={error.estado === 404 ? 'Esta entrega ya no es tuya' : 'No pudimos cargarla'} texto={error.estado === 404 ? 'El vendedor la reasignó o ya no existe.' : error.message}>
          <Boton variante="secundario" a="/entregas">
            Ver mis entregas
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }
  if (!e) {
    return (
      <div className="mx-auto grid max-w-2xl gap-4 px-4 pt-24" aria-busy>
        <div className="esqueleto h-24 rounded-[24px]" />
        <div className="esqueleto h-48 rounded-[24px]" />
      </div>
    );
  }

  const cobrar = Number(e.porCobrar) > 0;
  const pago = PAGOS[e.metodoPago];
  const d = e.entrega;
  const direccion = d && [d.direccion, d.ciudad, d.codigoPostal].filter(Boolean).join(', ');

  async function ejecutar(tipo) {
    if (tipo === 'entregada') {
      const ok = await confirmar({
        titulo: cobrar ? `¿Entregado y cobrado ${precio(e.porCobrar)}?` : '¿Ya lo entregaste?',
        texto: cobrar ? `Confirma que recibiste el pago con ${pago?.texto.toLowerCase() ?? 'el método acordado'}.` : 'El cliente ya lo había pagado.',
        boton: 'Sí, entregado',
      });
      if (!ok) return;
    }
    let motivo = null;
    if (tipo === 'fallida') {
      motivo = await pedirTexto({
        titulo: '¿Qué pasó?',
        texto: 'El pedido regresa al vendedor para que lo vuelva a enviar.',
        placeholder: 'Nadie en casa, dirección incorrecta…',
        boton: 'Reportar',
        obligatorio: true,
        peligro: true,
      });
      if (motivo === null) return;
    }
    setEnCurso(tipo);
    try {
      const nueva = tipo === 'entregada' ? await entregasApi.entregada(e.id) : await entregasApi.noEntregada(e.id, motivo);
      mutar(() => nueva);
      notificar({ tipo: 'exito', titulo: tipo === 'entregada' ? 'Entrega confirmada' : 'Entrega reportada', texto: `${e.folio} · ${e.mueble}`, guardar: false });
    } catch (err) {
      notificar({ tipo: 'error', titulo: 'No se pudo actualizar la entrega', texto: err.message, guardar: false });
    } finally {
      setEnCurso(null);
    }
  }

  return (
    <Pagina className="mx-auto max-w-2xl px-4 pb-32">
      <Encabezado volver titulo={e.folio} subtitulo={`Vendedor: ${e.vendedor}`} acciones={<ChipEstado estado={e.estado} tipoEntrega="DOMICILIO" />} />

      <div className="grid gap-4">
        <section className={`rounded-[24px] p-4 ${cobrar ? 'bg-tinta text-crema' : 'border border-linea bg-white'}`}>
          <p className={`text-[12px] font-semibold uppercase tracking-wider ${cobrar ? 'text-crema/70' : 'text-gris'}`}>
            {cobrar ? (e.cobradoEn ? 'Cobrado' : 'Por cobrar') : 'Pago'}
          </p>
          <p className="mt-1 flex items-center gap-2 font-display text-[28px] font-bold leading-none">
            {cobrar ? precio(e.porCobrar) : 'Ya pagado'}
            {cobrar && pago && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-crema/15 px-2.5 py-1 font-sans text-[13px] font-semibold">
                <pago.Icono className="size-4" aria-hidden />
                {pago.texto}
              </span>
            )}
          </p>
        </section>

        <section className="flex items-center gap-3.5 rounded-[24px] border border-linea bg-white p-4">
          <ImagenMueble mueble={{ nombre: e.mueble, imagenUrl: e.imagenUrl }} sombra={false} redondeo="rounded-2xl" className="size-20 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-display text-[17px] font-semibold">{e.mueble}</p>
            <p className="text-[13px] text-gris">
              {e.cantidad} {e.cantidad === 1 ? 'pieza' : 'piezas'}
            </p>
            {e.color && (
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] font-semibold">
                <span className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: e.color.hex }} aria-hidden />
                {e.color.nombre}
              </p>
            )}
          </div>
        </section>

        {d ? (
          <section className="grid gap-3 rounded-[24px] border border-linea bg-white p-4 text-[14px]">
            <Dato Icono={User} etiqueta="Recibe" valor={d.nombreRecibe} />
            <Dato Icono={MapPin} etiqueta="Dirección" valor={direccion} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Boton variante="secundario" icono={MapPin} a={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`} target="_blank" rel="noopener noreferrer">
                Abrir mapa
              </Boton>
              <Boton variante="secundario" icono={Phone} a={`tel:${(d.telefono ?? '').replace(/[^\d+]/g, '')}`}>
                Llamar
              </Boton>
            </div>
          </section>
        ) : (
          <p className="flex gap-2.5 rounded-2xl bg-crema px-4 py-3 text-[13px] leading-relaxed text-texto">
            <Store className="mt-0.5 size-4 shrink-0" aria-hidden />
            {e.estado === 'ENTREGADO'
              ? 'Entrega cerrada. Los datos del cliente ya no se muestran.'
              : 'Esta entrega regresó al vendedor. Los datos del cliente ya no se muestran.'}
          </p>
        )}

        {e.estado === 'EN_CAMINO' && (
          <div className="grid gap-2">
            <Boton variante="acento" icono={PackageCheck} bloque cargando={enCurso === 'entregada'} disabled={Boolean(enCurso)} onClick={() => ejecutar('entregada')} className="h-14 text-[16px]">
              {cobrar ? 'Entregado y cobrado' : 'Entregado'}
            </Boton>
            <Boton variante="secundario" icono={PackageX} bloque cargando={enCurso === 'fallida'} disabled={Boolean(enCurso)} onClick={() => ejecutar('fallida')}>
              No se pudo entregar
            </Boton>
          </div>
        )}
      </div>
    </Pagina>
  );
}

function Dato({ Icono, etiqueta, valor }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-crema text-tinta">
        <Icono className="size-[17px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-gris">{etiqueta}</p>
        <p className="break-words text-[14px] text-tinta">{valor}</p>
      </div>
    </div>
  );
}
