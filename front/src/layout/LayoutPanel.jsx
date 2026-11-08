import { Suspense } from 'react';
import BottomBar from './BottomBar';
import MenuLateral from './MenuLateral';
import SalidaAnimada from './SalidaAnimada';

function Cargando() {
  return (
    <div className="grid gap-3 p-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="esqueleto h-16 rounded-2xl" />
      ))}
    </div>
  );
}

/** Panel de vendedor y administrador: menú lateral fijo en escritorio; bottom bar con "Menú" en móvil. */
export default function LayoutPanel() {
  return (
    <div className="min-h-dvh bg-crema lg:pl-[260px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] lg:block">
        <MenuLateral />
      </aside>

      <div className="min-w-0 pb-28 lg:pb-0">
        <Suspense fallback={<Cargando />}>
          <SalidaAnimada />
        </Suspense>
      </div>

      <BottomBar className="lg:hidden" />
    </div>
  );
}
