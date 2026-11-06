import { Info, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import ImagenMueble from '../../common/components/ImagenMueble';
import { useAlmacen } from '../../common/hooks/useAlmacen';
import { useEnvio } from '../../common/hooks/useEnvio';
import { precio } from '../../common/utils/formato';
import { pedidosApi } from '../api/pedidosApi';
import { ENTREGAS } from '../estados';

const MAXIMO_POR_PEDIDO = 10;
const ENTREGA_VACIA = { nombreRecibe: '', telefono: '', direccion: '', ciudad: '', codigoPostal: '' };

/**
 * Formulario de compra: cantidad, cómo recibirlo, datos de entrega y un mensaje.
 * Los datos de entrega se recuerdan en el dispositivo para el siguiente pedido.
 * Con pedidoId convierte esa consulta en pedido; sin él crea el pedido del mueble.
 * mueble: { id, nombre, precio, existencias, imagenUrl, categoria? }
 */
export default function HojaComprar({ abierta, alCerrar, mueble, pedidoId, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo={pedidoId ? 'Convertir en pedido' : 'Comprar'}
      pie={<PieCompra />}
    >
      {abierta && <Formulario mueble={mueble} pedidoId={pedidoId} alListo={alListo} />}
    </Hoja>
  );
}

function PieCompra() {
  return (
    <Boton type="submit" form="form-comprar" variante="acento" bloque className="h-14 text-[16px]">
      Enviar pedido al vendedor
    </Boton>
  );
}

function Formulario({ mueble, pedidoId, alListo }) {
  const { usuario } = useSesion();
  const [recordada, setRecordada] = useAlmacen('gc.entrega', ENTREGA_VACIA);
  const [entrega, setEntrega] = useState(() => {
    const guardados = Object.fromEntries(Object.entries(recordada ?? {}).filter(([, v]) => v));
    return { ...ENTREGA_VACIA, nombreRecibe: usuario?.nombre ?? '', ...guardados };
  });
  const [cantidad, setCantidad] = useState(1);
  const [tipo, setTipo] = useState('DOMICILIO');
  const [mensaje, setMensaje] = useState('');
  const guardar = (cuerpo) => (pedidoId ? pedidosApi.solicitar(pedidoId, cuerpo) : pedidosApi.pedir({ muebleId: mueble.id, ...cuerpo }));
  const { enviar, enviando, error, errores } = useEnvio(guardar);

  const tope = Math.max(1, Math.min(MAXIMO_POR_PEDIDO, mueble.existencias ?? MAXIMO_POR_PEDIDO));
  const domicilio = tipo === 'DOMICILIO';
  const campo = (clave) => ({
    value: entrega[clave],
    error: errores[clave],
    onChange: (e) => setEntrega((d) => ({ ...d, [clave]: e.target.value })),
  });

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const limpio = Object.fromEntries(Object.entries(entrega).map(([k, v]) => [k, v.trim() || null]));
    const r = await enviar({
      cantidad,
      tipoEntrega: tipo,
      ...limpio,
      direccion: domicilio ? limpio.direccion : null,
      ciudad: domicilio ? limpio.ciudad : null,
      codigoPostal: domicilio ? limpio.codigoPostal : null,
      mensaje: mensaje.trim() || null,
    });
    if (r.ok) {
      setRecordada(entrega);
      alListo(r.datos);
    }
  }

  return (
    <form id="form-comprar" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-5">
      <div className="flex items-center gap-3">
        <ImagenMueble mueble={mueble} sombra={false} redondeo="rounded-2xl" className="size-16 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[16px] font-semibold">{mueble.nombre}</p>
          <p className="text-[13px] text-gris">{precio(mueble.precio)} c/u</p>
        </div>
      </div>

      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold text-texto">Cantidad</legend>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-borde bg-white p-1">
            <button type="button" onClick={() => setCantidad((n) => Math.max(1, n - 1))} disabled={cantidad <= 1} className="grid size-10 place-items-center rounded-full hover:bg-crema disabled:opacity-40" aria-label="Una pieza menos">
              <Minus className="size-4" />
            </button>
            <output aria-live="polite" className="w-10 text-center font-display text-[18px] font-bold">{cantidad}</output>
            <button type="button" onClick={() => setCantidad((n) => Math.min(tope, n + 1))} disabled={cantidad >= tope} className="grid size-10 place-items-center rounded-full hover:bg-crema disabled:opacity-40" aria-label="Una pieza más">
              <Plus className="size-4" />
            </button>
          </div>
          {mueble.existencias != null && <p className="text-[12.5px] text-gris">Hay {mueble.existencias} disponibles</p>}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold text-texto">¿Cómo lo quieres recibir?</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {Object.entries(ENTREGAS).map(([valor, { texto, Icono }]) => {
            const elegido = tipo === valor;
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={elegido}
                onClick={() => setTipo(valor)}
                className={`flex flex-col items-start gap-2 rounded-[20px] border px-3.5 py-3 text-left transition-colors ${elegido ? 'border-tinta bg-crema' : 'border-borde bg-white hover:bg-crema'}`}
              >
                <span className={`grid size-9 place-items-center rounded-xl ${elegido ? 'bg-tinta text-crema' : 'bg-crema text-tinta'}`}>
                  <Icono className="size-[18px]" aria-hidden />
                </span>
                <span className="text-[13.5px] font-semibold leading-tight">{texto}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta={domicilio ? 'Quién recibe' : 'Tu nombre'} autoComplete="name" {...campo('nombreRecibe')} />
          <Campo etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="tel" placeholder="55 1234 5678" {...campo('telefono')} />
        </div>
        {domicilio ? (
          <>
            <Campo etiqueta="Dirección" autoComplete="street-address" placeholder="Calle, número y colonia" {...campo('direccion')} />
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <Campo etiqueta="Ciudad" autoComplete="address-level2" {...campo('ciudad')} />
              <Campo etiqueta="C. P." inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="01000" {...campo('codigoPostal')} />
            </div>
          </>
        ) : (
          <p className="text-[12.5px] text-gris">El vendedor te dirá en la conversación dónde y cuándo pasar por él. El teléfono es opcional.</p>
        )}
      </div>

      <Campo
        etiqueta="Mensaje para el vendedor (opcional)"
        multilinea
        maxLength={1000}
        placeholder="Por ejemplo: ¿pueden entregar el sábado?"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        error={errores.mensaje}
      />

      <div className="flex items-center justify-between rounded-2xl bg-crema px-4 py-3">
        <span className="text-[13.5px] font-semibold text-texto">Total</span>
        <span className="font-display text-[22px] font-bold">{precio(Number(mueble.precio) * cantidad)}</span>
      </div>
      <p className="-mt-2 flex gap-2 text-[12.5px] leading-snug text-gris">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        No se cobra nada en la app: el pago (transferencia o efectivo) lo acuerdas con el vendedor en la conversación cuando acepte tu pedido.
      </p>
    </form>
  );
}
