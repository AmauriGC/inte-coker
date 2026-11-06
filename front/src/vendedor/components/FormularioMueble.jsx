import { Info } from 'lucide-react';
import { useState } from 'react';
import Campo from '../../common/components/Campo';
import Selector from '../../common/components/Selector';
import { useEnvio } from '../../common/hooks/useEnvio';
import { vendedorApi } from '../api/vendedorApi';
import SubidaArchivo from './SubidaArchivo';

const VACIO = { nombre: '', descripcion: '', precio: '', anchoCm: '', fondoCm: '', altoCm: '', materiales: '', categoriaId: '' };

function desde(mueble) {
  if (!mueble) return VACIO;
  return {
    nombre: mueble.nombre ?? '',
    descripcion: mueble.descripcion ?? '',
    precio: mueble.precio ?? '',
    anchoCm: mueble.anchoCm ?? '',
    fondoCm: mueble.fondoCm ?? '',
    altoCm: mueble.altoCm ?? '',
    materiales: mueble.materiales ?? '',
    categoriaId: mueble.categoria?.id ?? '',
  };
}

const numero = (v) => (v === '' || v === null ? null : Number(v));

/**
 * Datos del mueble y, una vez creado, sus archivos (glb e imagen).
 * id del form: "form-mueble" para que el botón del pie de la Hoja lo envíe.
 */
export default function FormularioMueble({ mueble, categorias, alGuardar, alCambiarArchivos, alEstado }) {
  const [datos, setDatos] = useState(() => desde(mueble));
  const guardar = (cuerpo) => (mueble?.id ? vendedorApi.actualizar(mueble.id, cuerpo) : vendedorApi.crear(cuerpo));
  const { enviar, enviando, error, errores } = useEnvio(guardar);
  const campo = (clave) => ({
    value: datos[clave],
    error: errores[clave],
    onChange: (e) => setDatos((d) => ({ ...d, [clave]: e.target.value })),
  });

  async function alEnviar(e) {
    e.preventDefault();
    alEstado?.(true);
    const r = await enviar({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim() || null,
      precio: numero(datos.precio),
      anchoCm: numero(datos.anchoCm),
      fondoCm: numero(datos.fondoCm),
      altoCm: numero(datos.altoCm),
      materiales: datos.materiales.trim() || null,
      categoriaId: numero(datos.categoriaId),
    });
    alEstado?.(false);
    if (r.ok) alGuardar(r.datos, !mueble?.id);
  }

  const opciones = [{ valor: '', texto: 'Elige una categoría' }, ...(categorias ?? []).map((c) => ({ valor: c.id, texto: c.nombre }))];

  return (
    <div className="grid gap-6">
      <form id="form-mueble" onSubmit={alEnviar} className="grid gap-4" noValidate aria-busy={enviando}>
        {error && !Object.keys(errores).length && (
          <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
        )}
        <Campo etiqueta="Nombre" placeholder="Sofá Nube" {...campo('nombre')} required />
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Precio (MXN)" type="number" inputMode="decimal" min="0" step="0.01" placeholder="18990" {...campo('precio')} />
          <Selector etiqueta="Categoría" opciones={opciones} {...campo('categoriaId')} />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-semibold text-texto">Medidas reales (cm)</legend>
          <div className="grid grid-cols-3 gap-3">
            <Campo placeholder="Ancho" aria-label="Ancho en centímetros" type="number" inputMode="numeric" min="1" {...campo('anchoCm')} />
            <Campo placeholder="Fondo" aria-label="Fondo en centímetros" type="number" inputMode="numeric" min="1" {...campo('fondoCm')} />
            <Campo placeholder="Alto" aria-label="Alto en centímetros" type="number" inputMode="numeric" min="1" {...campo('altoCm')} />
          </div>
        </fieldset>
        <Campo etiqueta="Materiales" placeholder="Lino, roble, espuma HR" ayuda="Sepáralos con comas." {...campo('materiales')} />
        <Campo etiqueta="Descripción" multilinea placeholder="Qué lo hace especial" {...campo('descripcion')} />
      </form>

      <section className="grid gap-3">
        <h3 className="font-display text-[15px] font-semibold">Archivos</h3>
        {!mueble?.id && (
          <p className="flex gap-2 rounded-2xl bg-crema px-4 py-3 text-[13px] text-texto">
            <Info className="mt-0.5 size-4 shrink-0" /> Guarda los datos primero; después subes el modelo 3D y la foto.
          </p>
        )}
        <SubidaArchivo
          tipo="modelo"
          listo={Boolean(mueble?.modeloUrl)}
          deshabilitado={!mueble?.id}
          subir={(archivo, alProgreso) => vendedorApi.subirModelo(mueble.id, archivo, alProgreso)}
          alSubir={alCambiarArchivos}
        />
        <SubidaArchivo
          tipo="imagen"
          listo={Boolean(mueble?.imagenUrl)}
          deshabilitado={!mueble?.id}
          subir={(archivo, alProgreso) => vendedorApi.subirImagen(mueble.id, archivo, alProgreso)}
          alSubir={alCambiarArchivos}
        />
        <p className="text-[12.5px] text-gris">Para publicarlo necesita el modelo 3D y la foto.</p>
      </section>
    </div>
  );
}
