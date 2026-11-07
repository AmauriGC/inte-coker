import { useLocation } from 'react-router';
import BottomBar from './BottomBar';
import SalidaAnimada from './SalidaAnimada';

/** Rutas a pantalla completa: sin barra inferior (flujos de cuenta). El detalle sí la lleva. */
const SIN_BARRA = [/^\/entrar/, /^\/verificar/, /^\/olvide-password/, /^\/restablecer-password/];

/** Layout de la parte pública: columna centrada y bottom bar. */
export default function LayoutMovil() {
  const { pathname } = useLocation();
  const conBarra = !SIN_BARRA.some((r) => r.test(pathname));

  return (
    <div className={`min-h-dvh ${conBarra ? 'pb-28' : ''}`}>
      <SalidaAnimada />
      {conBarra && <BottomBar />}
    </div>
  );
}
