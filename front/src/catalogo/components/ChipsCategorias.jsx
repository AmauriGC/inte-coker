import { LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { estiloCategoria } from '../../common/utils/categorias';

/** Fila deslizable de categorías; la activa lleva la píldora negra animada. */
export default function ChipsCategorias({ categorias, activa, alElegir, idLayout = 'chip-categoria' }) {
  const lista = [{ id: '', nombre: 'Todo', slug: null }, ...(categorias ?? [])];
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
      <ul className="flex w-max gap-2 py-1">
        {lista.map((c) => {
          const Icono = c.slug ? estiloCategoria(c.slug).Icono : LayoutGrid;
          const esActiva = String(activa ?? '') === String(c.id);
          return (
            <li key={c.id || 'todo'}>
              <button
                type="button"
                onClick={() => alElegir(c.id)}
                aria-pressed={esActiva}
                className={`relative inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition-colors ${
                  esActiva ? 'border-tinta text-crema' : 'border-borde bg-white text-tinta hover:border-gris-2'
                }`}
              >
                {esActiva && (
                  <motion.span layoutId={idLayout} className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                )}
                <Icono className="relative size-4" aria-hidden />
                <span className="relative">{c.nombre}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
