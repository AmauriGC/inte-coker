import { Store, Truck } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Hoja from '../../common/components/Hoja';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useEnvio } from '../../common/hooks/useEnvio';
import { pedidosApi } from '../api/pedidosApi';

/** El vendedor manda el pedido a domicilio: elige transportista o lo lleva él mismo. */
export default function HojaEnviar({ abierta, alCerrar, pedido, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo="Enviar pedido"
      pie={
        <Boton type="submit" form="form-enviar" variante="primario" icono={Truck} bloque className="h-14 text-[16px]">
          Marcar en camino
        </Boton>
      }
    >
      {abierta && <Formulario pedido={pedido} alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ pedido, alListo }) {
  const { datos, cargando, error: errorLista } = useConsulta((s) => pedidosApi.transportistas(s), []);
  const [elegido, setElegido] = useState(null);
  const { enviar, enviando, error } = useEnvio((id) => pedidosApi.cambiarEstado(pedido.id, 'EN_CAMINO', null, id));
  const lista = datos ?? [];

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar(elegido);
    if (r.ok) alListo(r.datos);
  }

  const opcion = (id, titulo, detalle, Icono) => {
    const activo = elegido === id;
    return (
      <button
        key={id ?? 'yo'}
        type="button"
        role="radio"
        aria-checked={activo}
        onClick={() => setElegido(id)}
        className={`flex items-center gap-3 rounded-[20px] border px-3.5 py-3 text-left transition-colors ${activo ? 'border-tinta bg-crema' : 'border-borde bg-white hover:bg-crema'}`}
      >
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${activo ? 'bg-tinta text-crema' : 'bg-crema text-tinta'}`}>
          <Icono className="size-[18px]" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-semibold">{titulo}</span>
          <span className="block text-[12.5px] text-gris">{detalle}</span>
        </span>
      </button>
    );
  };

  return (
    <form id="form-enviar" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-4">
      <p className="text-[14px] leading-relaxed text-texto">
        Va para <span className="font-semibold">{pedido.entrega.nombreRecibe}</span> en {pedido.entrega.ciudad}. El transportista ve la
        dirección, el teléfono y lo que debe cobrar; no ve la conversación.
      </p>
      {(error || errorLista) && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{(error ?? errorLista).message}</p>
      )}
      <div role="radiogroup" aria-label="Quién lo lleva" className="grid gap-2">
        {opcion(null, 'Lo llevo yo', 'Tú confirmas la entrega y el cobro', Store)}
        {cargando && <div className="esqueleto h-16 rounded-[20px]" />}
        {lista.map((t) =>
          opcion(t.id, t.nombre, t.enCamino ? `${t.enCamino} ${t.enCamino === 1 ? 'entrega' : 'entregas'} en camino` : 'Sin entregas ahora', Truck),
        )}
        {!cargando && !lista.length && (
          <p className="text-[12.5px] text-gris">Aún no hay transportistas. Un administrador puede dar el rol Transportista en Usuarios.</p>
        )}
      </div>
    </form>
  );
}
