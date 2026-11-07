import { Send } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import { useEnvio } from '../../common/hooks/useEnvio';
import { resenasApi } from '../api/resenasApi';
import { SelectorEstrellas } from './Estrellas';

/** Escribir o editar mi reseña. Solo aparece si el back dice que puedo (pedido entregado). */
export default function HojaResena({ abierta, alCerrar, mueble, actual, alListo }) {
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      titulo={actual ? 'Editar mi reseña' : 'Escribir reseña'}
      pie={
        <Boton type="submit" form="form-resena" icono={Send} bloque className="h-14 text-[16px]">
          {actual ? 'Guardar cambios' : 'Publicar reseña'}
        </Boton>
      }
    >
      {abierta && <Formulario mueble={mueble} actual={actual} alListo={alListo} />}
    </Hoja>
  );
}

function Formulario({ mueble, actual, alListo }) {
  const [estrellas, setEstrellas] = useState(actual?.estrellas ?? 0);
  const [texto, setTexto] = useState(actual?.texto ?? '');
  const { enviar, enviando, error, errores } = useEnvio((datos) => resenasApi.guardar(mueble.id, datos));

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar({ estrellas: estrellas || null, texto: texto.trim() || null });
    if (r.ok) alListo(r.datos);
  }

  return (
    <form id="form-resena" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-5">
      <p className="text-[14px] leading-relaxed text-texto">
        Cuéntale a otras personas cómo te fue con <span className="font-semibold">{mueble.nombre}</span>. Tu reseña aparece como
        compra verificada.
      </p>
      <SelectorEstrellas valor={estrellas} alCambiar={setEstrellas} error={errores.estrellas} />
      <Campo
        etiqueta="Tu reseña (opcional)"
        multilinea
        maxLength={1000}
        placeholder="Calidad, medidas, entrega, cómo se ve en tu espacio…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        error={errores.texto ?? (error && !Object.keys(errores).length ? error.message : undefined)}
      />
    </form>
  );
}
