import { Send } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import { useEnvio } from '../../common/hooks/useEnvio';
import { transportistasApi } from '../api/transportistasApi';

const VACIO = { nombre: '', email: '', telefono: '' };

/** Registrar a un transportista: le llega un correo para poner su contraseña. */
export default function HojaTransportista({ abierta, alCerrar, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo="Nuevo transportista"
      pie={
        <Boton type="submit" form="form-transportista" icono={Send} bloque className="h-14 text-[16px]">
          Registrar e invitar
        </Boton>
      }
    >
      {abierta && <Formulario alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ alListo }) {
  const [datos, setDatos] = useState(VACIO);
  const { enviar, enviando, error, errores } = useEnvio((d) => transportistasApi.crear(d));
  const campo = (clave) => ({
    value: datos[clave],
    error: errores[clave],
    onChange: (e) => setDatos((d) => ({ ...d, [clave]: e.target.value })),
  });

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar({ nombre: datos.nombre.trim(), email: datos.email.trim(), telefono: datos.telefono.trim() });
    if (r.ok) alListo(r.datos);
  }

  return (
    <form id="form-transportista" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-4">
      <p className="text-[14px] leading-relaxed text-texto">
        Le mandamos un correo para que ponga su contraseña. Solo tú puedes asignarle envíos, y él solo ve la dirección, el teléfono y lo
        que debe cobrar.
      </p>
      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}
      <Campo etiqueta="Nombre" autoComplete="off" maxLength={100} {...campo('nombre')} />
      <Campo etiqueta="Correo" type="email" inputMode="email" autoComplete="off" placeholder="nombre@correo.com" {...campo('email')} />
      <Campo etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="off" placeholder="55 1234 5678" {...campo('telefono')} />
    </form>
  );
}
