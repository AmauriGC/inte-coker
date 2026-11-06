import { Heart, LayoutGrid } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import TarjetaMueble from '../../catalogo/components/TarjetaMueble';
import Encabezado from '../../layout/Encabezado';
import { useFavoritos } from '../context/FavoritosContext';

export default function FavoritosPage() {
  const { favoritos } = useFavoritos();

  return (
    <Pagina className="mx-auto max-w-5xl px-4">
      <Encabezado titulo="Favoritos" subtitulo={favoritos.length ? `${favoritos.length} guardados` : 'Tu lista'} />
      {favoritos.length === 0 ? (
        <EstadoVacio icono={Heart} titulo="Aún no guardas nada" texto="Toca el corazón de un mueble para tenerlo a la mano y compararlo después.">
          <Boton a="/catalogo" icono={LayoutGrid}>
            Explorar el catálogo
          </Boton>
        </EstadoVacio>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {favoritos.map((m, i) => (
              <TarjetaMueble key={m.id} mueble={m} indice={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Pagina>
  );
}
