import { RefreshCw, TriangleAlert, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { useEnLinea } from '../hooks/useEnLinea';
import Boton from './Boton';
import EstadoVacio from './EstadoVacio';

const CLAVE_RECARGA = 'gc.recarga-por-version';
const ESPERA_RECARGA_MS = 30_000;

/** El chunk de una pantalla no se pudo descargar (sin conexión o versión vieja tras desplegar). */
function esErrorDeCarga(error) {
  const mensaje = String(error?.message ?? error ?? '');
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(mensaje);
}

/**
 * Con conexión, un chunk que falta casi siempre es una versión nueva publicada: se recarga una
 * sola vez (si vuelve a fallar en 30 s, se queda la pantalla con el botón para no ciclar).
 */
function recargarUnaVez() {
  try {
    const ultima = Number(sessionStorage.getItem(CLAVE_RECARGA));
    if (ultima && Date.now() - ultima < ESPERA_RECARGA_MS) return;
    sessionStorage.setItem(CLAVE_RECARGA, String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
}

/**
 * Pantalla de error de una ruta (errorElement). Se dibuja dentro del layout, así la persona
 * conserva la navegación. Distingue sin conexión, versión nueva y un error cualquiera.
 */
export default function ErrorRuta() {
  const error = useRouteError();
  const enLinea = useEnLinea();
  const deCarga = esErrorDeCarga(error);

  useEffect(() => {
    if (deCarga && navigator.onLine) recargarUnaVez();
  }, [deCarga]);

  let contenido;
  if (deCarga && !enLinea) {
    contenido = { icono: WifiOff, titulo: 'Esta sección no está guardada', texto: 'Estás sin conexión. Ábrela una vez con internet para usarla después sin conexión.' };
  } else if (deCarga) {
    contenido = { icono: RefreshCw, titulo: 'Hay una versión nueva', texto: 'Recarga para seguir con lo último de GC-Confort.' };
  } else {
    contenido = { icono: TriangleAlert, titulo: 'Algo salió mal', texto: 'No pudimos mostrar esta pantalla. Recarga o vuelve al inicio.' };
  }

  return (
    <div className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4" role="alert">
      <EstadoVacio {...contenido}>
        <div className="grid w-full gap-2 sm:flex sm:justify-center">
          <Boton icono={RefreshCw} onClick={() => window.location.reload()}>
            {deCarga && !enLinea ? 'Reintentar' : 'Recargar'}
          </Boton>
          <Boton variante="secundario" a="/">
            Ir al inicio
          </Boton>
        </div>
        {import.meta.env.DEV && !deCarga && error?.message && <p className="mt-4 break-words font-mono text-[11.5px] text-gris">{error.message}</p>}
      </EstadoVacio>
    </div>
  );
}
