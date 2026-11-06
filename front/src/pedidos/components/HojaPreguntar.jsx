import { Send } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import { useEnvio } from '../../common/hooks/useEnvio';
import { pedidosApi } from '../api/pedidosApi';

const SUGERENCIAS = ['¿Sigue disponible?', '¿Hacen envíos a mi ciudad?', '¿Lo tienen en otro color?', '¿Cuánto tarda la entrega?'];

/** Pregunta al vendedor sin comprar. Si ya había una consulta abierta, el mensaje se suma a ella. */
export default function HojaPreguntar({ abierta, alCerrar, mueble, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo="Preguntar al vendedor"
      pie={
        <Boton type="submit" form="form-preguntar" icono={Send} bloque className="h-14 text-[16px]">
          Enviar pregunta
        </Boton>
      }
    >
      {abierta && <Formulario mueble={mueble} alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ mueble, alListo }) {
  const [texto, setTexto] = useState('');
  const { enviar, enviando, error, errores } = useEnvio((t) => pedidosApi.preguntar(mueble.id, t));

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar(texto.trim());
    if (r.ok) alListo(r.datos);
  }

  return (
    <form id="form-preguntar" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-4">
      <p className="text-[14px] leading-relaxed text-texto">
        Escríbele a <span className="font-semibold">{mueble.vendedor?.nombre ?? 'quien lo vende'}</span> sobre{' '}
        <span className="font-semibold">{mueble.nombre}</span>. Te avisamos cuando responda.
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="Preguntas frecuentes">
        {SUGERENCIAS.map((s) => (
          <li key={s}>
            <button type="button" onClick={() => setTexto(s)} className="rounded-full border border-borde bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-crema">
              {s}
            </button>
          </li>
        ))}
      </ul>
      <Campo
        etiqueta="Tu pregunta"
        multilinea
        autoFocus
        maxLength={1000}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        error={errores.mensaje ?? (error && !Object.keys(errores).length ? error.message : undefined)}
      />
    </form>
  );
}
