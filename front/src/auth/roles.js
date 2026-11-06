import { Heart, Package, Shield } from 'lucide-react';

/** Datos de cada rol para el selector: nombre, qué hace, icono y a dónde lleva al elegirlo. */
export const ROLES = {
  ADMIN: { nombre: 'Administrador', detalle: 'Usuarios, roles, categorías y todo el catálogo', Icono: Shield, inicio: '/panel' },
  VENDEDOR: { nombre: 'Vendedor', detalle: 'Tus muebles, modelos 3D y publicaciones', Icono: Package, inicio: '/panel/muebles' },
  CLIENTE: { nombre: 'Cliente', detalle: 'Explorar el catálogo, ver en 3D y guardar favoritos', Icono: Heart, inicio: '/' },
};

const ORDEN = ['ADMIN', 'VENDEDOR', 'CLIENTE'];

/** Roles conocidos de la cuenta, en orden de mayor a menor alcance. */
export function ordenarRoles(roles = []) {
  return [...roles].sort((a, b) => (ORDEN.indexOf(a) + 1 || 99) - (ORDEN.indexOf(b) + 1 || 99));
}

export function datosRol(rol) {
  return ROLES[rol] ?? { nombre: rol, detalle: 'Rol personalizado', Icono: Shield, inicio: '/' };
}
