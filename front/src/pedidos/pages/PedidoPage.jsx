import { ArrowLeft, MapPin, Phone, ReceiptText, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { pedidosApi } from '../api/pedidosApi';
import AccionesPedido from '../components/AccionesPedido';
import ChipEstado from '../components/ChipEstado';
import Conversacion from '../components/Conversacion';
import HojaComprar from '../components/HojaComprar';
import LineaTiempo from '../components/LineaTiempo';
import { usePedidos } from '../context/PedidosContext';
import { ENTREGAS } from '../estados';

const aparece = (i) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { delay: 0.05 * i } } });

/**
 * Detalle del pedido con su avance, datos de entrega, acciones y la conversación.
 * Lo usan el cliente (/pedidos/:id) y el panel (/panel/pedidos/:id, enPanel); lo que se
 * puede hacer lo decide el back según quién mira (pedido.lado y pedido.acciones).
 */
export default function PedidoPage({ enPanel = false }) {
  const { id } = useParams();
  const { refrescar } = usePedidos();
  const { notificar } = useNotificaciones();
  const [convertir, setConvertir] = useState(false);
  const { datos: pedido, error, recargar, mutar } = useConsulta((s) => pedidosApi.pedido(id, s), [id]);
  const salida = enPanel ? '/panel/pedidos' : '/pedidos';

  const actualizar = useCallback(
    (nuevo) => {
      mutar(() => nuevo);
      refrescar();
    },
    [mutar, refrescar],
  );
  const cerrarHoja = useCallback(() => setConvertir(false), []);

  if (error) {
    return (
      <Pagina className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4">
        <EstadoVacio icono={ReceiptText} titulo={error.estado === 404 ? 'Este pedido no existe' : 'No pudimos cargar el pedido'} texto={error.message}>
          <Boton a={salida} icono={ArrowLeft}>
            {enPanel ? 'Volver a pedidos' : 'Volver a mis pedidos'}
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  if (!pedido) {
    return (
      <div className={`mx-auto grid max-w-5xl gap-4 px-4 ${enPanel ? 'py-8' : 'pt-24'}`} aria-busy>
        <div className="esqueleto h-24 rounded-[24px]" />
        <div className="esqueleto h-16 rounded-[24px]" />
        <div className="esqueleto h-72 rounded-[24px]" />
      </div>
    );
  }

  const { mueble } = pedido;
  const enlace = mueble.slug && (enPanel || mueble.publicado) ? (enPanel ? `/panel/muebles/${mueble.slug}` : `/mueble/${mueble.slug}`) : null;
  const entrega = ENTREGAS[pedido.tipoEntrega];
  const otro = pedido.lado === 'CLIENTE' ? { rol: 'Vendedor', ...pedido.vendedor } : { rol: 'Cliente', ...pedido.cliente };
  const datosEntrega = pedido.entrega;

  return (
    <Pagina className={`mx-auto max-w-5xl px-4 ${enPanel ? 'py-6 lg:px-8 lg:py-8' : 'pb-32'}`}>
      <Encabezado
        volver
        titulo={pedido.folio}
        subtitulo={pedido.estado === 'CONSULTA' ? 'Consulta' : 'Pedido'}
        acciones={<ChipEstado estado={pedido.estado} tipoEntrega={pedido.tipoEntrega} />}
        className={enPanel ? 'pt-0!' : ''}
      />

      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-start">
        <div className="grid gap-4">
          <motion.section {...aparece(0)} className="rounded-[24px] border border-linea bg-white p-4">
            <div className="flex items-center gap-3.5">
              <ImagenMueble mueble={mueble} sombra={false} redondeo="rounded-2xl" className="size-20 shrink-0" />
              <div className="min-w-0 flex-1">
                {enlace ? (
                  <Link to={enlace} className="block truncate font-display text-[17px] font-semibold hover:underline">
                    {mueble.nombre}
                  </Link>
                ) : (
                  <p className="truncate font-display text-[17px] font-semibold">{mueble.nombre}</p>
                )}
                <p className="text-[13px] text-gris">
                  {pedido.cantidad} × {precio(pedido.precioUnitario)}
                  {mueble.id === null && ' · ya no está en el catálogo'}
                </p>
                <p className="mt-0.5 font-display text-[19px] font-bold">{precio(pedido.total)}</p>
              </div>
            </div>
            {pedido.lado === 'VENDEDOR' && mueble.existencias != null && ['SOLICITADO', 'ACEPTADO'].includes(pedido.estado) && (
              <p className={`mt-3 rounded-xl px-3 py-2 text-[12.5px] font-semibold ${mueble.existencias < pedido.cantidad && pedido.estado === 'SOLICITADO' ? 'bg-[#F6DAD7] text-[#8C1D17]' : 'bg-crema text-texto'}`}>
                Existencias actuales: {mueble.existencias}
                {pedido.estado === 'SOLICITADO' && mueble.existencias < pedido.cantidad && ' · no alcanzan para este pedido'}
              </p>
            )}
          </motion.section>

          <motion.section {...aparece(1)} className="rounded-[24px] border border-linea bg-white p-4">
            <LineaTiempo pedido={pedido} />
          </motion.section>

          <motion.section {...aparece(2)} className="grid gap-3 rounded-[24px] border border-linea bg-white p-4 text-[14px]">
            {pedido.lado === 'SUPERVISOR' ? (
              <>
                <Dato Icono={User} etiqueta="Cliente" valor={pedido.cliente.nombre} />
                <Dato Icono={User} etiqueta="Vendedor" valor={pedido.vendedor.nombre} />
              </>
            ) : (
              <Dato Icono={User} etiqueta={otro.rol} valor={otro.nombre} />
            )}
            {entrega && (
              <Dato
                Icono={entrega.Icono}
                etiqueta={entrega.texto}
                valor={[datosEntrega.nombreRecibe, datosEntrega.direccion, [datosEntrega.ciudad, datosEntrega.codigoPostal].filter(Boolean).join(' ')]
                  .filter(Boolean)
                  .join(' · ') || 'El vendedor indicará dónde recogerlo'}
              />
            )}
            {datosEntrega.telefono && (
              <Dato
                Icono={Phone}
                etiqueta="Teléfono"
                valor={
                  <a href={`tel:${datosEntrega.telefono.replace(/[^\d+]/g, '')}`} className="font-semibold text-terracota hover:underline">
                    {datosEntrega.telefono}
                  </a>
                }
              />
            )}
            {!entrega && <Dato Icono={MapPin} etiqueta="Entrega" valor="Se define al convertir la consulta en pedido" />}
          </motion.section>

          <AccionesPedido pedido={pedido} alActualizar={actualizar} alSolicitar={() => setConvertir(true)} />
        </div>

        <Conversacion
          key={pedido.id}
          pedido={pedido}
          alCambiarEstado={recargar}
          className="md:sticky md:top-6 md:max-h-[calc(100dvh-48px)]"
        />
      </div>

      {pedido.acciones.includes('SOLICITADO') && (
        <HojaComprar
          abierta={convertir}
          alCerrar={cerrarHoja}
          pedidoId={pedido.id}
          mueble={{ ...mueble, precio: pedido.precioUnitario }}
          alListo={(nuevo) => {
            setConvertir(false);
            actualizar(nuevo);
            notificar({ tipo: 'pedido', titulo: 'Pedido enviado', texto: `${nuevo.folio}: el vendedor ya puede aceptarlo.` });
          }}
        />
      )}

      {!enPanel && pedido.lado === 'CLIENTE' && pedido.estado === 'ENTREGADO' && mueble.slug && (
        <div className="mt-6 text-center">
          <Boton variante="fantasma" a="/catalogo">
            Seguir explorando el catálogo
          </Boton>
        </div>
      )}
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
        <div className="break-words text-[14px] text-tinta">{valor}</div>
      </div>
    </div>
  );
}
