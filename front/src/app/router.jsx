import { createBrowserRouter, Navigate } from 'react-router';
import RutaProtegida from '../auth/components/RutaProtegida';
import CuentaPage from '../auth/pages/CuentaPage';
import LoginPage from '../auth/pages/LoginPage';
import OlvidePasswordPage from '../auth/pages/OlvidePasswordPage';
import RestablecerPasswordPage from '../auth/pages/RestablecerPasswordPage';
import VerificarPage from '../auth/pages/VerificarPage';
import CatalogoPage from '../catalogo/pages/CatalogoPage';
import DetallePage from '../catalogo/pages/DetallePage';
import InicioPage from '../catalogo/pages/InicioPage';
import NoEncontradoPage from '../common/components/NoEncontradoPage';
import FavoritosPage from '../favoritos/pages/FavoritosPage';
import LayoutMovil from '../layout/LayoutMovil';
import LayoutPanel from '../layout/LayoutPanel';
import Raiz from '../layout/Raiz';
import AvisosPage from '../notificaciones/pages/AvisosPage';
import { CategoriasPage, PanelMueblesPage, RolesPage, UsuariosPage } from './paginasPanel';

export const router = createBrowserRouter([
  {
    element: <Raiz />,
    children: [
      {
        element: <LayoutMovil />,
        children: [
          { index: true, element: <InicioPage /> },
          { path: 'catalogo', element: <CatalogoPage /> },
          { path: 'mueble/:slug', element: <DetallePage /> },
          { path: 'favoritos', element: <FavoritosPage /> },
          { path: 'avisos', element: <AvisosPage /> },
          { path: 'cuenta', element: <CuentaPage /> },
          { path: 'entrar', element: <LoginPage /> },
          { path: 'verificar', element: <VerificarPage /> },
          { path: 'olvide-password', element: <OlvidePasswordPage /> },
          { path: 'restablecer-password', element: <RestablecerPasswordPage /> },
          { path: '*', element: <NoEncontradoPage /> },
        ],
      },
      {
        path: 'panel',
        element: (
          <RutaProtegida permisos={['MUEBLE_CREAR', 'CATEGORIA_GESTIONAR', 'USUARIO_GESTIONAR', 'ROL_GESTIONAR']}>
            <LayoutPanel />
          </RutaProtegida>
        ),
        children: [
          { index: true, element: <Navigate to="muebles" replace /> },
          { path: 'muebles', element: <RutaProtegida permisos={['MUEBLE_CREAR']}><PanelMueblesPage /></RutaProtegida> },
          { path: 'categorias', element: <RutaProtegida permisos={['CATEGORIA_GESTIONAR']}><CategoriasPage /></RutaProtegida> },
          { path: 'usuarios', element: <RutaProtegida permisos={['USUARIO_GESTIONAR']}><UsuariosPage /></RutaProtegida> },
          { path: 'roles', element: <RutaProtegida permisos={['ROL_GESTIONAR']}><RolesPage /></RutaProtegida> },
        ],
      },
    ],
  },
]);
