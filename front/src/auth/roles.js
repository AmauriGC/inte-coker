import { Heart, Package, Shield, Truck } from 'lucide-react';

/** Datos de cada rol para el selector: nombre, qué hace, icono y a dónde lleva al elegirlo. */
export const ROLES = {
  ADMIN: { nombre: 'Administrador', detalle: 'Usuarios, roles, categorías, pedidos y todo el catálogo', Icono: Shield, inicio: '/panel' },
  VENDEDOR: { nombre: 'Vendedor', detalle: 'Tus muebles, modelos 3D, publicaciones y pedidos', Icono: Package, inicio: '/panel/muebles' },
  TRANSPORTISTA: { nombre: 'Transportista', detalle: 'Tus entregas a domicilio y el cobro', Icono: Truck, inicio: '/entregas' },
  CLIENTE: { nombre: 'Cliente', detalle: 'Explorar en 3D, guardar favoritos, comprar y reseñar', Icono: Heart, inicio: '/' },
};

const ORDEN = ['ADMIN', 'VENDEDOR', 'TRANSPORTISTA', 'CLIENTE'];

/** Roles conocidos de la cuenta, en orden de mayor a menor alcance. */
export function ordenarRoles(roles = []) {
  return [...roles].sort((a, b) => (ORDEN.indexOf(a) + 1 || 99) - (ORDEN.indexOf(b) + 1 || 99));
}

export function datosRol(rol) {
  return ROLES[rol] ?? { nombre: rol, detalle: 'Rol personalizado', Icono: Shield, inicio: '/' };
}
