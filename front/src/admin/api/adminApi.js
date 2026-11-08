import { obtener, peticion } from '../../common/api/cliente';

/** Usuarios, roles y categorías (requieren USUARIO_GESTIONAR, ROL_GESTIONAR y CATEGORIA_GESTIONAR). */
export const adminApi = {
  usuarios: ({ buscar, page = 0, size = 20 } = {}, signal) => obtener('/usuarios', { consulta: { buscar, page, size }, signal }),
  cambiarRoles: (id, roles) => obtener(`/usuarios/${id}/roles`, { metodo: 'PUT', cuerpo: { roles } }),
  cambiarEstado: (id, activo) => obtener(`/usuarios/${id}/estado`, { metodo: 'PATCH', cuerpo: { activo } }),

  roles: (signal) => obtener('/roles', { signal }),
  permisos: (signal) => obtener('/roles/permisos', { signal }),
  cambiarPermisos: (id, permisos) => obtener(`/roles/${id}/permisos`, { metodo: 'PUT', cuerpo: { permisos } }),

  /** Solicitudes para vender (estado: PENDIENTE, APROBADA, RECHAZADA o todas). */
  solicitudes: ({ estado, page = 0, size = 20 } = {}, signal) => obtener('/solicitudes-vendedor', { consulta: { estado, page, size }, signal }),
  aprobarSolicitud: (id) => obtener(`/solicitudes-vendedor/${id}/aprobar`, { metodo: 'POST' }),
  rechazarSolicitud: (id, motivo) => obtener(`/solicitudes-vendedor/${id}/rechazar`, { metodo: 'POST', cuerpo: { motivo } }),

  categorias: ({ buscar } = {}, signal) => obtener('/categorias', { consulta: { buscar, size: 100 }, signal }),
  crearCategoria: (datos) => obtener('/categorias', { metodo: 'POST', cuerpo: datos }),
  actualizarCategoria: (id, datos) => obtener(`/categorias/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminarCategoria: (id) => peticion(`/categorias/${id}`, { metodo: 'DELETE' }),
};

