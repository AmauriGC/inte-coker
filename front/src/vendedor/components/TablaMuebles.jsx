import { Check, Eye, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router';
import ImagenMueble from '../../common/components/ImagenMueble';
import Interruptor from '../../common/components/Interruptor';
import { medidas, precio } from '../../common/utils/formato';

function EstadoArchivo({ listo, texto }) {
  return listo ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-salvia-suave px-2.5 py-1 text-[12px] font-semibold text-salvia">
      <Check className="size-3.5" strokeWidth={2.6} /> {texto}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-terracota-suave px-2.5 py-1 text-[12px] font-semibold text-terracota-osc">
      <TriangleAlert className="size-3.5" /> Falta {texto.toLowerCase()}
    </span>
  );
}

/** Existencias: en rojo cuando se agotó. */
function Existencias({ n }) {
  return n === 0 ? (
    <span className="inline-flex rounded-full bg-[#F6DAD7] px-2.5 py-1 text-[12px] font-semibold text-[#8C1D17]">Agotado</span>
  ) : (
    <span className="text-texto">
      <span className="font-semibold text-tinta">{n}</span> en existencia
    </span>
  );
}

function Acciones({ mueble, alEditar, alEliminar }) {
  const boton = 'grid size-9 place-items-center rounded-full text-texto hover:bg-crema';
  return (
    <div className="flex justify-end gap-1">
      <Link to={`/panel/muebles/${mueble.slug}`} className={boton} aria-label={`Ver ${mueble.nombre}`}>
        <Eye className="size-[17px]" />
      </Link>
      <button type="button" onClick={() => alEditar(mueble)} className={boton} aria-label={`Editar ${mueble.nombre}`}>
        <Pencil className="size-[17px]" />
      </button>
      <button type="button" onClick={() => alEliminar(mueble)} className={`${boton} hover:bg-[#F6DAD7] hover:text-[#B3261E]`} aria-label={`Eliminar ${mueble.nombre}`}>
        <Trash2 className="size-[17px]" />
      </button>
    </div>
  );
}

/** Tabla en escritorio y tarjetas en móvil (tablero "Panel del vendedor"). */
export default function TablaMuebles({ muebles, alEditar, alEliminar, alPublicar, publicando }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[24px] border border-linea bg-white md:block">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-linea bg-crema/50 text-[12px] uppercase tracking-wider text-gris">
            <tr>
              <th className="px-5 py-3 font-semibold">Mueble</th>
              <th className="px-3 py-3 font-semibold">Medidas</th>
              <th className="px-3 py-3 font-semibold">Existencias</th>
              <th className="px-3 py-3 font-semibold">Archivos</th>
              <th className="px-3 py-3 font-semibold">Publicado</th>
              <th className="px-5 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {muebles.map((m) => (
                <motion.tr key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-linea last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <ImagenMueble mueble={m} redondeo="rounded-xl" sombra={false} className="size-12 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{m.nombre}</p>
                        <p className="truncate text-[12.5px] text-gris">
                          {m.categoria?.nombre} · {precio(m.precio)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-texto">{medidas(m)}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <Existencias n={m.existencias} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <EstadoArchivo listo={Boolean(m.modeloUrl)} texto="3D" />
                      <EstadoArchivo listo={Boolean(m.imagenUrl)} texto="Foto" />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Interruptor activo={m.publicado} alCambiar={(v) => alPublicar(m, v)} deshabilitado={publicando === m.id} etiqueta={`Publicar ${m.nombre}`} />
                  </td>
                  <td className="px-5 py-3">
                    <Acciones mueble={m} alEditar={alEditar} alEliminar={alEliminar} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        <AnimatePresence initial={false}>
          {muebles.map((m) => (
            <motion.li key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} className="rounded-[22px] border border-linea bg-white p-3">
              <div className="flex gap-3">
                <ImagenMueble mueble={m} redondeo="rounded-2xl" sombra={false} className="size-20 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15.5px] font-semibold">{m.nombre}</p>
                  <p className="truncate text-[12.5px] text-gris">{medidas(m)}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[14px] font-bold">
                    {precio(m.precio)}
                    <span className="text-[12.5px] font-normal">
                      <Existencias n={m.existencias} />
                    </span>
                  </p>
                </div>
                <Interruptor activo={m.publicado} alCambiar={(v) => alPublicar(m, v)} deshabilitado={publicando === m.id} etiqueta={`Publicar ${m.nombre}`} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-linea pt-2.5">
                <div className="flex flex-wrap gap-1.5">
                  <EstadoArchivo listo={Boolean(m.modeloUrl)} texto="3D" />
                  <EstadoArchivo listo={Boolean(m.imagenUrl)} texto="Foto" />
                </div>
                <Acciones mueble={m} alEditar={alEditar} alEliminar={alEliminar} />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
