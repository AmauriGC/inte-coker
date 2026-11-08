import { useLocation } from 'react-router';
import BottomBar from './BottomBar';
import MenuLateral from './MenuLateral';
import SalidaAnimada from './SalidaAnimada';
import { useNavegacion } from './useNavegacion';

/** Rutas a pantalla completa: sin barra inferior (flujos de cuenta). El detalle sí la lleva. */
const SIN_BARRA = [/^\/entrar/, /^\/verificar/, /^\/olvide-password/, /^\/restablecer-password/, /^\/activar/];

/**
 * Layout de la parte pública: columna centrada y bottom bar. Quien tiene panel (vendedor,
 * administrador) ve en escritorio el menú lateral en lugar de la bottom bar.
 */
export default function LayoutMovil() {
  const { pathname } = useLocation();
  const { conMenu } = useNavegacion();
  const conBarra = !SIN_BARRA.some((r) => r.test(pathname));
  const lateral = conBarra && conMenu;

  return (
    <div className={`min-h-dvh ${lateral ? 'lg:pl-[260px]' : ''}`}>
      {lateral && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] lg:block">
          <MenuLateral />
        </aside>
      )}
      <div className={`min-w-0 ${conBarra ? 'pb-28' : ''} ${lateral ? 'lg:pb-10' : ''}`}>
        <SalidaAnimada />
      </div>
      {conBarra && <BottomBar className={lateral ? 'lg:hidden' : ''} />}
    </div>
  );
}
