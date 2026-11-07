import { CalendarClock, Info, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import ImagenMueble from '../../common/components/ImagenMueble';
import { useAlmacen } from '../../common/hooks/useAlmacen';
import { useEnvio } from '../../common/hooks/useEnvio';
import { precio } from '../../common/utils/formato';
import { catalogoApi } from '../../catalogo/api/catalogoApi';
import MuestrasColor from '../../catalogo/components/MuestrasColor';
import { colorInicial } from '../../common/utils/colores';
import { useConsulta } from '../../common/hooks/useConsulta';
import { pedidosApi } from '../api/pedidosApi';
import { ENTREGAS, PAGOS } from '../estados';

const MAXIMO_POR_PEDIDO = 10;
const ENTREGA_VACIA = { nombreRecibe: '', telefono: '', direccion: '', ciudad: '', codigoPostal: '' };

/**
 * Formulario de compra: cantidad, cómo recibirlo, datos de entrega y un mensaje.
 * Los datos de entrega se recuerdan en el dispositivo para el siguiente pedido.
 * Con pedidoId convierte esa consulta en pedido; sin él crea el pedido del mueble.
 * mueble: { id, nombre, precio, existencias, imagenUrl, slug, variantes? }. Si el mueble se
 * vende por color se elige aquí (color = id inicial; alCambiarColor avisa al visor).
 * apartar = true pide apartarlo con anticipo (el vendedor confirma el monto y la fecha límite).
 */
export default function HojaComprar({ abierta, alCerrar, mueble, pedidoId, color, alCambiarColor, apartar = false, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo={apartar ? 'Apartar con anticipo' : pedidoId ? 'Convertir en pedido' : 'Comprar'}
      pie={<PieCompra apartar={apartar} />}
    >
      {abierta && <Formulario mueble={mueble} pedidoId={pedidoId} color={color} alCambiarColor={alCambiarColor} apartar={apartar} alListo={alListo} />}
    </Hoja>
  );
}

function PieCompra({ apartar }) {
  return (
    <Boton type="submit" form="form-comprar" variante="acento" bloque className="h-14 text-[16px]">
      {apartar ? 'Pedir apartado' : 'Enviar pedido al vendedor'}
    </Boton>
  );
}

function Formulario({ mueble, pedidoId, color, alCambiarColor, apartar, alListo }) {
  const { usuario } = useSesion();
  const [recordada, setRecordada] = useAlmacen('gc.entrega', ENTREGA_VACIA);
  const [entrega, setEntrega] = useState(() => {
    const guardados = Object.fromEntries(Object.entries(recordada ?? {}).filter(([, v]) => v));
    return { ...ENTREGA_VACIA, nombreRecibe: usuario?.nombre ?? '', ...guardados };
  });
  const [cantidad, setCantidad] = useState(1);
  const [tipo, setTipo] = useState('DOMICILIO');
  const [pago, setPago] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const guardar = (cuerpo) => (pedidoId ? pedidosApi.solicitar(pedidoId, cuerpo) : pedidosApi.pedir({ muebleId: mueble.id, ...cuerpo }));
  const { enviar, enviando, error, errores } = useEnvio(guardar);

  // Desde una consulta el mueble llega resumido: sus colores se piden aparte.
  const variantesC = useConsulta(
    (s) => (mueble.variantes === undefined && mueble.slug ? catalogoApi.mueble(mueble.slug, s).then((m) => m.variantes ?? []) : Promise.resolve(mueble.variantes ?? [])),
    [mueble.slug],
  );
  const variantes = variantesC.datos ?? [];
  const [elegido, setElegido] = useState(color ?? null);
  const colorId = colorInicial(variantes, elegido);
  const variante = variantes.find((v) => v.id === colorId) ?? null;
  const disponibles = variante ? variante.existencias : mueble.existencias;
  const tope = Math.max(1, Math.min(MAXIMO_POR_PEDIDO, disponibles ?? MAXIMO_POR_PEDIDO));
  const piezas = Math.min(cantidad, tope);

  function elegirColor(id) {
    setElegido(id);
    alCambiarColor?.(id);
  }
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
      cantidad: piezas,
      varianteId: variante?.id ?? null,
      apartar,
      tipoEntrega: tipo,
      metodoPago: pago,
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

      {apartar && (
        <p className="flex gap-2.5 rounded-2xl bg-[#F8F0DD] px-4 py-3 text-[13px] leading-relaxed text-[#6B4A12]">
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Acuerdas el anticipo con el vendedor en la conversación. Cuando lo reciba, confirma el monto y te da hasta 30 días para
            liquidar; mientras, las piezas quedan reservadas para ti.
          </span>
        </p>
      )}

      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}

      {variantes.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-texto">
            Color <span className="font-normal text-gris">· {variante?.nombre}</span>
          </legend>
          <MuestrasColor grande variantes={variantes} valor={colorId} alElegir={elegirColor} />
          {variante?.existencias === 0 && <p className="mt-2 text-[12.5px] text-[#8C1D17]">Este color está agotado; elige otro o pregúntale al vendedor.</p>}
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold text-texto">Cantidad</legend>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-borde bg-white p-1">
            <button type="button" onClick={() => setCantidad(() => Math.max(1, piezas - 1))} disabled={piezas <= 1} className="grid size-10 place-items-center rounded-full hover:bg-crema disabled:opacity-40" aria-label="Una pieza menos">
              <Minus className="size-4" />
            </button>
            <output aria-live="polite" className="w-10 text-center font-display text-[18px] font-bold">{piezas}</output>
            <button type="button" onClick={() => setCantidad(() => Math.min(tope, piezas + 1))} disabled={piezas >= tope} className="grid size-10 place-items-center rounded-full hover:bg-crema disabled:opacity-40" aria-label="Una pieza más">
              <Plus className="size-4" />
            </button>
          </div>
          {disponibles != null && <p className="text-[12.5px] text-gris">Hay {disponibles} disponibles{variante ? ` en ${variante.nombre}` : ''}</p>}
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

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold text-texto">¿Cómo vas a pagar?</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {Object.entries(PAGOS).map(([valor, { texto, Icono }]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={pago === valor}
              onClick={() => setPago(valor)}
              className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-[14px] font-semibold transition-colors ${pago === valor ? 'border-tinta bg-tinta text-crema' : 'border-borde bg-white hover:bg-crema'}`}
            >
              <Icono className="size-[18px]" aria-hidden />
              {texto}
            </button>
          ))}
        </div>
        <p className={`mt-1.5 text-[12.5px] ${errores.metodoPago ? 'text-[#B3261E]' : 'text-gris'}`}>
          {errores.metodoPago ?? (apartar ? 'Para liquidar lo que reste del apartado.' : domicilio ? 'Pagas al recibirlo; quien lo entrega confirma el cobro.' : 'Pagas al recogerlo.')}
        </p>
      </fieldset>

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
        <span className="font-display text-[22px] font-bold">{precio(Number(mueble.precio) * piezas)}</span>
      </div>
      <p className="-mt-2 flex gap-2 text-[12.5px] leading-snug text-gris">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        No se cobra nada en la app: el pago (transferencia o efectivo) lo acuerdas con el vendedor en la conversación cuando acepte tu pedido.
      </p>
    </form>
  );
}
