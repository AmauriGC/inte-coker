import { lazy } from 'react';

// El panel se descarga aparte: quien solo mira el catálogo no lo carga.
export const PanelMueblesPage = lazy(() => import('../vendedor/pages/PanelMueblesPage'));
export const CategoriasPage = lazy(() => import('../admin/pages/CategoriasPage'));
export const UsuariosPage = lazy(() => import('../admin/pages/UsuariosPage'));
export const RolesPage = lazy(() => import('../admin/pages/RolesPage'));
