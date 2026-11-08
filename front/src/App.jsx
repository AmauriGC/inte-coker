import { AnimatePresence, MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './app/router';
import SesionProvider from './auth/context/SesionProvider';
import FavoritosProvider from './favoritos/context/FavoritosProvider';
import Splash from './layout/Splash';
import AvisosProvider from './notificaciones/context/AvisosProvider';
import NotificacionesProvider from './notificaciones/context/NotificacionesProvider';
import PedidosProvider from './pedidos/context/PedidosProvider';
import AvisosPwa from './pwa/AvisosPwa';

/** Tiempo mínimo del splash para que su animación se vea completa. */
const DURACION_SPLASH = 1600;

export default function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setSplash(false), DURACION_SPLASH);
    return () => clearTimeout(id);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <NotificacionesProvider>
        <SesionProvider>
          <FavoritosProvider>
            <PedidosProvider>
              <AvisosProvider>
                <RouterProvider router={router} />
              </AvisosProvider>
            </PedidosProvider>
          </FavoritosProvider>
        </SesionProvider>
        <AvisosPwa />
      </NotificacionesProvider>
      <AnimatePresence>{splash && <Splash key="splash" />}</AnimatePresence>
    </MotionConfig>
  );
}
