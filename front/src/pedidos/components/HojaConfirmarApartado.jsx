import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import { useEnvio } from '../../common/hooks/useEnvio';
import { precio } from '../../common/utils/formato';
import { pedidosApi } from '../api/pedidosApi';

const PLAZOS = [3, 7, 15, 30];
const fechaLarga = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

/** El vendedor anota el anticipo que recibió y el plazo para liquidar; las piezas se reservan. */
export default function HojaConfirmarApartado({ abierta, alCerrar, pedido, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo="Confirmar anticipo"
      pie={
        <Boton type="submit" form="form-apartado" variante="acento" icono={CalendarClock} bloque className="h-14 text-[16px]">
          Apartar el mueble
        </Boton>
      }
    >
      {abierta && <Formulario pedido={pedido} alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ pedido, alListo }) {
  const total = Number(pedido.total);
  const [anticipo, setAnticipo] = useState(() => String(Math.round(total * 0.3)));
  const [dias, setDias] = useState(7);
  const { enviar, enviando, error, errores } = useEnvio((d) => pedidosApi.confirmarApartado(pedido.id, d));
  const monto = Number(anticipo) || 0;
  const [limite] = useState(() => Date.now());
  const vence = new Date(limite + dias * 86400000);

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar({ anticipo: anticipo === '' ? null : Number(anticipo), dias });
    if (r.ok) alListo(r.datos);
  }

  return (
    <form id="form-apartado" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-5">
      <p className="text-[14px] leading-relaxed text-texto">
        Confirma solo si ya recibiste el anticipo. Se reservan {pedido.cantidad} {pedido.cantidad === 1 ? 'pieza' : 'piezas'} de{' '}
        <span className="font-semibold">{pedido.mueble.nombre}</span>
        {pedido.color && ` en ${pedido.color.nombre}`} hasta la fecha límite.
      </p>
      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}
      <Campo
        etiqueta="Anticipo recibido (MXN)"
        type="number"
        inputMode="decimal"
        min="1"
        step="0.01"
        value={anticipo}
        onChange={(e) => setAnticipo(e.target.value)}
        error={errores.anticipo}
        ayuda={`Total del pedido: ${precio(total)}`}
      />
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold text-texto">Plazo para liquidar</legend>
        <div role="radiogroup" className="grid grid-cols-4 gap-2">
          {PLAZOS.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={dias === d}
              onClick={() => setDias(d)}
              className={`h-11 rounded-2xl border text-[14px] font-semibold transition-colors ${dias === d ? 'border-tinta bg-tinta text-crema' : 'border-borde bg-white hover:bg-crema'}`}
            >
              {d} días
            </button>
          ))}
        </div>
        {errores.dias && <p className="mt-1.5 text-[12.5px] text-[#B3261E]">{errores.dias}</p>}
      </fieldset>
      <dl className="grid gap-1.5 rounded-2xl bg-crema px-4 py-3 text-[13.5px]">
        <div className="flex justify-between gap-3">
          <dt className="text-gris">Resta por pagar</dt>
          <dd className="font-semibold">{precio(Math.max(0, total - monto))}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gris">Fecha límite</dt>
          <dd className="font-semibold first-letter:uppercase">{fechaLarga.format(vence)}</dd>
        </div>
      </dl>
    </form>
  );
}
