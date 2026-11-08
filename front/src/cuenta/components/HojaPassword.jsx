import { Check, KeyRound } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import { useEnvio } from '../../common/hooks/useEnvio';
import { cuentaApi } from '../api/cuentaApi';

const VACIO = { actual: '', nueva: '', confirmacion: '' };

/** Requisitos de la nueva contraseña, marcados conforme se escribe. */
function Requisitos({ valor }) {
  const reglas = [
    { texto: 'Al menos 8 caracteres', ok: valor.length >= 8 },
    { texto: 'Una letra', ok: /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(valor) },
    { texto: 'Un número', ok: /\d/.test(valor) },
  ];
  return (
    <ul className="-mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Requisitos de la contraseña">
      {reglas.map((r) => (
        <li key={r.texto} className={`inline-flex items-center gap-1.5 text-[12.5px] transition-colors ${r.ok ? 'font-semibold text-salvia' : 'text-gris'}`}>
          <span className={`grid size-4 place-items-center rounded-full ${r.ok ? 'bg-salvia text-white' : 'border border-borde'}`}>
            {r.ok && <Check className="size-3" strokeWidth={3} aria-hidden />}
          </span>
          {r.texto}
          <span className="sr-only">{r.ok ? ' (cumplido)' : ' (falta)'}</span>
        </li>
      ))}
    </ul>
  );
}

/** Cambiar la contraseña con la sesión abierta: la actual, la nueva y su confirmación. */
export default function HojaPassword({ abierta, alCerrar, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo="Cambiar contraseña"
      pie={
        <Boton type="submit" form="form-password" icono={KeyRound} bloque className="h-14 text-[16px]">
          Cambiar contraseña
        </Boton>
      }
    >
      {abierta && <Formulario alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ alListo }) {
  const [datos, setDatos] = useState(VACIO);
  const [intento, setIntento] = useState(false);
  const { enviar, enviando, error, errores } = useEnvio((d) => cuentaApi.cambiarPassword(d));
  const noCoincide = datos.confirmacion !== '' && datos.confirmacion !== datos.nueva;

  const campo = (clave) => ({
    value: datos[clave],
    error: errores[clave],
    onChange: (e) => setDatos((d) => ({ ...d, [clave]: e.target.value })),
  });

  async function alEnviar(e) {
    e.preventDefault();
    setIntento(true);
    if (enviando || noCoincide) return;
    const r = await enviar(datos);
    if (r.ok) alListo();
  }

  return (
    <form id="form-password" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-4">
      <p className="text-[14px] leading-relaxed text-texto">
        Por seguridad te pedimos la actual. Al cambiarla te mandamos un correo para avisarte.
      </p>
      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}
      <Campo etiqueta="Contraseña actual" type="password" autoComplete="current-password" {...campo('actual')} />
      <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" maxLength={72} {...campo('nueva')} />
      <Requisitos valor={datos.nueva} />
      <Campo
        etiqueta="Confirma la nueva contraseña"
        type="password"
        autoComplete="new-password"
        maxLength={72}
        {...campo('confirmacion')}
        error={errores.confirmacion ?? ((intento || datos.confirmacion.length >= datos.nueva.length) && noCoincide ? 'No coincide con la nueva contraseña' : undefined)}
      />
    </form>
  );
}
