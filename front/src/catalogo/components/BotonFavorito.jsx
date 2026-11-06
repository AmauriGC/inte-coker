import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useFavoritos } from '../../favoritos/context/FavoritosContext';

/** Corazón que late al guardar. */
export default function BotonFavorito({ mueble, className = '' }) {
  const { esFavorito, alternar } = useFavoritos();
  const activo = esFavorito(mueble.id);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternar(mueble);
      }}
      aria-pressed={activo}
      aria-label={activo ? `Quitar ${mueble.nombre} de favoritos` : `Guardar ${mueble.nombre} en favoritos`}
      className={`grid size-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur ${className}`}
    >
      <motion.span key={String(activo)} initial={{ scale: activo ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 12 }}>
        <Heart className={`size-[19px] ${activo ? 'fill-terracota text-terracota' : 'text-tinta'}`} strokeWidth={2.1} />
      </motion.span>
    </motion.button>
  );
}
