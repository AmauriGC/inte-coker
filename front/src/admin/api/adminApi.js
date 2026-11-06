import { obtener, peticion } from '../../common/api/cliente';

/** Usuarios, roles y categorías (requieren USUARIO_GESTIONAR, ROL_GESTIONAR y CATEGORIA_GESTIONAR). */
export const adminApi = {
  usuarios: ({ buscar, page = 0, size = 20 } = {}, signal) => obtener('/usuarios', { consulta: { buscar, page, size }, signal }),
  cambiarRoles: (id, roles) => obtener(`/usuarios/${id}/roles`, { metodo: 'PUT', cuerpo: { roles } }),
  cambiarEstado: (id, activo) => obtener(`/usuarios/${id}/estado`, { metodo: 'PATCH', cuerpo: { activo } }),

  roles: (signal) => obtener('/roles', { signal }),
  permisos: (signal) => obtener('/roles/permisos', { signal }),
  cambiarPermisos: (id, permisos) => obtener(`/roles/${id}/permisos`, { metodo: 'PUT', cuerpo: { permisos } }),

  categorias: ({ buscar } = {}, signal) => obtener('/categorias', { consulta: { buscar, size: 100 }, signal }),
  crearCategoria: (datos) => obtener('/categorias', { metodo: 'POST', cuerpo: datos }),
  actualizarCategoria: (id, datos) => obtener(`/categorias/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminarCategoria: (id) => peticion(`/categorias/${id}`, { metodo: 'DELETE' }),
};

export const NOMBRE_ROL = { ADMIN: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente' };
