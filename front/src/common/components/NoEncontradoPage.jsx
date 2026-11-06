import { Compass } from 'lucide-react';
import Boton from './Boton';
import EstadoVacio from './EstadoVacio';
import Pagina from './Pagina';

export default function NoEncontradoPage() {
  return (
    <Pagina className="mx-auto grid min-h-[80dvh] max-w-md place-items-center px-4">
      <EstadoVacio icono={Compass} titulo="Esta página no existe" texto="Quizá el enlace cambió. Vuelve al inicio y sigue explorando.">
        <Boton a="/">Ir al inicio</Boton>
      </EstadoVacio>
    </Pagina>
  );
}
