import { CircleAlert, Clock, Send, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useEnvio } from '../../common/hooks/useEnvio';
import { haceCuanto } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import { cuentaApi } from '../api/cuentaApi';

const MAXIMO = 500;

/**
 * Un cliente pide vender en GC-Confort. Muestra el estado de su última solicitud: en revisión,
 * aprobada (ya puede entrar al panel) o rechazada con el motivo (puede pedirlo de nuevo).
 */
export default function QuieroVenderPage() {
  const { usuario, tieneRol, refrescarUsuario } = useSesion();
  const navegar = useNavigate();
  const { datos: solicitud, error, recargar, mutar } = useConsulta((s) => cuentaApi.miSolicitud(s), []);
  const [entrando, setEntrando] = useState(false);

  async function irAlPanel() {
    setEntrando(true);
    try {
      await refrescarUsuario();
      navegar('/panel/perfil');
    } finally {
      setEntrando(false);
    }
  }

  const yaVende = tieneRol('VENDEDOR') || solicitud?.estado === 'APROBADA';

  return (
    <Pagina className="mx-auto max-w-md px-4 pb-32">
      <Encabezado volver titulo="Quiero vender" subtitulo="Publica tus muebles con 3D y realidad aumentada" />

      {error && solicitud === undefined ? (
        <EstadoVacio icono={CircleAlert} titulo="No pudimos cargar tu solicitud" texto={error.message}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : solicitud === undefined ? (
        <div className="esqueleto h-72 rounded-[28px]" />
      ) : yaVende ? (
        <EstadoVacio icono={Store} titulo="Ya puedes vender" texto="Completa tu perfil de vendedor y publica tu primer mueble.">
          <Boton cargando={entrando} onClick={irAlPanel}>
            Ir a mi panel
          </Boton>
        </EstadoVacio>
      ) : solicitud?.estado === 'PENDIENTE' ? (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-linea bg-white p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-terracota-suave px-3 py-1 text-[12.5px] font-semibold text-terracota">
            <Clock className="size-3.5" aria-hidden /> En revisión
          </span>
          <p className="mt-3 text-[14.5px] leading-relaxed text-texto">
            La enviaste {haceCuanto(solicitud.creadaEn)}. Te avisamos por correo y en Avisos cuando un administrador la revise.
          </p>
          <dl className="mt-4 grid gap-2 rounded-2xl bg-crema p-4 text-[13.5px]">
            <Dato etiqueta="Ciudad" valor={solicitud.ciudad} />
            <Dato etiqueta="Teléfono" valor={solicitud.telefono} />
            <Dato etiqueta="Lo que haces" valor={solicitud.mensaje} />
          </dl>
        </motion.section>
      ) : (
        <>
          {solicitud?.estado === 'RECHAZADA' && (
            <div role="status" className="mb-4 rounded-[22px] border border-[#EBC7C2] bg-[#FBEDEB] p-4 text-[13.5px] text-[#8C1D17]">
              <p className="font-semibold">Tu solicitud anterior no fue aprobada</p>
              <p className="mt-1">{solicitud.motivo}</p>
              <p className="mt-1 text-[#8C1D17]/80">Puedes corregirlo y volver a pedirlo.</p>
            </div>
          )}
          <Formulario inicial={solicitud} nombre={usuario?.nombre} alListo={(nueva) => mutar(() => nueva)} />
        </>
      )}
    </Pagina>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <dt className="text-[11.5px] font-semibold uppercase tracking-wider text-gris">{etiqueta}</dt>
      <dd className="mt-0.5 text-tinta">{valor}</dd>
    </div>
  );
}

function Formulario({ inicial, nombre, alListo }) {
  const [datos, setDatos] = useState(() => ({ ciudad: inicial?.ciudad ?? '', telefono: inicial?.telefono ?? '', mensaje: inicial?.mensaje ?? '' }));
  const { enviar, enviando, error, errores } = useEnvio((d) => cuentaApi.pedirVender(d));
  const campo = (clave) => ({
    value: datos[clave],
    error: errores[clave],
    onChange: (e) => setDatos((d) => ({ ...d, [clave]: e.target.value })),
  });

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar({ ciudad: datos.ciudad.trim(), telefono: datos.telefono.trim(), mensaje: datos.mensaje.trim() });
    if (r.ok) alListo(r.datos);
  }

  return (
    <form onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-4 rounded-[28px] border border-linea bg-white p-5">
      <p className="text-[14px] leading-relaxed text-texto">
        {nombre ? `${nombre}, cuéntanos` : 'Cuéntanos'} qué haces. Un administrador revisa tu solicitud y, si la aprueba, tu cuenta suma el
        panel de vendedor sin perder lo que ya tienes.
      </p>
      {error && !Object.keys(errores).length && (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Ciudad" autoComplete="address-level2" maxLength={80} {...campo('ciudad')} />
        <Campo etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="tel" placeholder="55 1234 5678" {...campo('telefono')} />
      </div>
      <Campo
        etiqueta="Qué muebles haces o vendes"
        multilinea
        maxLength={MAXIMO}
        placeholder="Mesas de pino, sillas tapizadas… ¿Tienes taller o tienda?"
        ayuda={`${datos.mensaje.length}/${MAXIMO}. Entre más nos cuentes, más rápido la revisamos.`}
        {...campo('mensaje')}
      />
      <Boton type="submit" icono={Send} bloque cargando={enviando} className="h-[52px]">
        Enviar solicitud
      </Boton>
    </form>
  );
}
