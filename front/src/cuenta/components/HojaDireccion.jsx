import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import Interruptor from '../../common/components/Interruptor';
import { useEnvio } from '../../common/hooks/useEnvio';
import { cuentaApi } from '../api/cuentaApi';

const VACIA = { alias: '', nombreRecibe: '', telefono: '', direccion: '', ciudad: '', codigoPostal: '', predeterminada: false };

/** Agregar (direccion = null) o editar una dirección guardada. alListo recibe la lista nueva. */
export default function HojaDireccion({ abierta, alCerrar, direccion, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo={direccion ? 'Editar dirección' : 'Nueva dirección'}
      pie={
        <Boton type="submit" form="form-direccion" bloque className="h-14 text-[16px]">
          Guardar dirección
        </Boton>
      }
    >
      {abierta && <Formulario key={direccion?.id ?? 'nueva'} direccion={direccion} alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ direccion, alListo }) {
  const [datos, setDatos] = useState(() => ({ ...VACIA, ...(direccion ?? {}) }));
  const guardar = (d) => (direccion ? cuentaApi.actualizarDireccion(direccion.id, d) : cuentaApi.crearDireccion(d));
  const { enviar, enviando, error, errores } = useEnvio(guardar);
  const campo = (clave) => ({
    value: datos[clave],
    error: errores[clave],
    onChange: (e) => setDatos((d) => ({ ...d, [clave]: e.target.value })),
  });

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar(datos);
    if (r.ok) alListo(r.datos);
  }

  return (
    <form id="form-direccion" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-3">
      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}
      <Campo etiqueta="Nombre de la dirección" placeholder="Casa, oficina…" maxLength={40} {...campo('alias')} />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Quién recibe" autoComplete="name" {...campo('nombreRecibe')} />
        <Campo etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="tel" placeholder="55 1234 5678" {...campo('telefono')} />
      </div>
      <Campo etiqueta="Dirección" autoComplete="street-address" placeholder="Calle, número y colonia" {...campo('direccion')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Campo etiqueta="Ciudad" autoComplete="address-level2" {...campo('ciudad')} />
        <Campo etiqueta="C. P." inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="01000" {...campo('codigoPostal')} />
      </div>
      {!direccion?.predeterminada && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-crema px-4 py-3">
          <span className="text-[14px] font-semibold">Usarla por defecto al pedir</span>
          <Interruptor
            etiqueta="Usarla por defecto al pedir"
            activo={datos.predeterminada}
            alCambiar={(v) => setDatos((d) => ({ ...d, predeterminada: v }))}
          />
        </div>
      )}
    </form>
  );
}
