import { createBrowserRouter, Navigate } from 'react-router';
import RutaProtegida from '../auth/components/RutaProtegida';
import CuentaPage from '../auth/pages/CuentaPage';
import LoginPage from '../auth/pages/LoginPage';
import OlvidePasswordPage from '../auth/pages/OlvidePasswordPage';
import RestablecerPasswordPage from '../auth/pages/RestablecerPasswordPage';
import VerificarPage from '../auth/pages/VerificarPage';
import CatalogoPage from '../catalogo/pages/CatalogoPage';
import EntregaPage from '../entregas/pages/EntregaPage';
import EntregasPage from '../entregas/pages/EntregasPage';
import DetallePage from '../catalogo/pages/DetallePage';
import InicioPage from '../catalogo/pages/InicioPage';
import NoEncontradoPage from '../common/components/NoEncontradoPage';
import FavoritosPage from '../favoritos/pages/FavoritosPage';
import LayoutMovil from '../layout/LayoutMovil';
import LayoutPanel from '../layout/LayoutPanel';
import Raiz from '../layout/Raiz';
import AvisosPage from '../notificaciones/pages/AvisosPage';
import MisPedidosPage from '../pedidos/pages/MisPedidosPage';
import PedidoPage from '../pedidos/pages/PedidoPage';
import ResenasPage from '../resenas/pages/ResenasPage';
import PerfilVendedorPage from '../vendedor/pages/PerfilVendedorPage';
import { CategoriasPage, MiPerfilPage, PanelMueblesPage, PanelPedidosPage, ResenasModeracionPage, RolesPage, UsuariosPage } from './paginasPanel';

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
          { path: 'mueble/:slug/resenas', element: <ResenasPage /> },
          { path: 'vendedor/:slug', element: <PerfilVendedorPage /> },
          { path: 'favoritos', element: <FavoritosPage /> },
          { path: 'avisos', element: <AvisosPage /> },
          { path: 'pedidos', element: <RutaProtegida><MisPedidosPage /></RutaProtegida> },
          { path: 'pedidos/:id', element: <RutaProtegida><PedidoPage /></RutaProtegida> },
          { path: 'entregas', element: <RutaProtegida permisos={['ENTREGA_REALIZAR']}><EntregasPage /></RutaProtegida> },
          { path: 'entregas/:id', element: <RutaProtegida permisos={['ENTREGA_REALIZAR']}><EntregaPage /></RutaProtegida> },
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
          <RutaProtegida permisos={['MUEBLE_CREAR', 'PEDIDO_ATENDER', 'PEDIDO_SUPERVISAR', 'PERFIL_VENDEDOR_EDITAR', 'RESENA_MODERAR', 'CATEGORIA_GESTIONAR', 'USUARIO_GESTIONAR', 'ROL_GESTIONAR']}>
            <LayoutPanel />
          </RutaProtegida>
        ),
        children: [
          { index: true, element: <Navigate to="muebles" replace /> },
          { path: 'muebles', element: <RutaProtegida permisos={['MUEBLE_CREAR']}><PanelMueblesPage /></RutaProtegida> },
          { path: 'muebles/:slug', element: <RutaProtegida permisos={['MUEBLE_CREAR']}><DetallePage enPanel /></RutaProtegida> },
          { path: 'pedidos', element: <RutaProtegida permisos={['PEDIDO_ATENDER', 'PEDIDO_SUPERVISAR']}><PanelPedidosPage /></RutaProtegida> },
          { path: 'pedidos/:id', element: <RutaProtegida permisos={['PEDIDO_ATENDER', 'PEDIDO_SUPERVISAR']}><PedidoPage enPanel /></RutaProtegida> },
          { path: 'perfil', element: <RutaProtegida permisos={['PERFIL_VENDEDOR_EDITAR']}><MiPerfilPage /></RutaProtegida> },
          { path: 'resenas', element: <RutaProtegida permisos={['RESENA_MODERAR']}><ResenasModeracionPage /></RutaProtegida> },
          { path: 'categorias', element: <RutaProtegida permisos={['CATEGORIA_GESTIONAR']}><CategoriasPage /></RutaProtegida> },
          { path: 'usuarios', element: <RutaProtegida permisos={['USUARIO_GESTIONAR']}><UsuariosPage /></RutaProtegida> },
          { path: 'roles', element: <RutaProtegida permisos={['ROL_GESTIONAR']}><RolesPage /></RutaProtegida> },
        ],
      },
    ],
  },
]);
