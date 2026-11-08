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
    <div className="min-h-dvh bg-crema lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-30 hidden h-dvh lg:block">
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
