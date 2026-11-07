import { Ban, CalendarClock, CircleCheck, CircleX, Hourglass, MessageCircleQuestion, PackageCheck, ShoppingBag, Store, Truck } from 'lucide-react';

/** Texto, icono y colores de cada estado del pedido (mismos tonos que los avisos). */
export const ESTADOS = {
  CONSULTA: { texto: 'Consulta', Icono: MessageCircleQuestion, fondo: '#E7E1D6', color: '#4A443C' },
  SOLICITADO: { texto: 'Solicitado', Icono: ShoppingBag, fondo: '#F3DED3', color: '#7E3316' },
  APARTADO: { texto: 'Apartado', Icono: CalendarClock, fondo: '#EFE3C8', color: '#6B4A12' },
  ACEPTADO: { texto: 'Aceptado', Icono: CircleCheck, fondo: '#DCE3D9', color: '#2E4A3B' },
  EN_CAMINO: { texto: 'En camino', Icono: Truck, fondo: '#E6DDCF', color: '#1D1B18' },
  ENTREGADO: { texto: 'Entregado', Icono: PackageCheck, fondo: '#DCE3D9', color: '#2E4A3B' },
  RECHAZADO: { texto: 'Rechazado', Icono: CircleX, fondo: '#F6DAD7', color: '#B3261E' },
  CANCELADO: { texto: 'Cancelado', Icono: Ban, fondo: '#E4E2DE', color: '#4A443C' },
  VENCIDO: { texto: 'Vencido', Icono: Hourglass, fondo: '#E4E2DE', color: '#4A443C' },
};

export const ABIERTOS = ['CONSULTA', 'SOLICITADO', 'APARTADO', 'ACEPTADO', 'EN_CAMINO'];

/** EN_CAMINO se lee "Listo para recoger" cuando el cliente pasa por él. */
export function datosEstado(estado, tipoEntrega) {
  const base = ESTADOS[estado] ?? ESTADOS.CONSULTA;
  if (estado === 'EN_CAMINO' && tipoEntrega === 'RECOGER') return { ...base, texto: 'Listo para recoger', Icono: Store };
  return base;
}

/** Pasos de la línea de tiempo y el campo de fecha de cada uno. */
export const PASOS = [
  { estado: 'SOLICITADO', fecha: 'solicitadoEn' },
  { estado: 'ACEPTADO', fecha: 'aceptadoEn' },
  { estado: 'EN_CAMINO', fecha: 'enCaminoEn' },
  { estado: 'ENTREGADO', fecha: 'entregadoEn' },
];

/** Pasos de este pedido: un apartado suma el paso "Apartado" (fecha en que se confirmó el anticipo). */
export function pasosDe(pedido) {
  if (!pedido.apartado) return PASOS;
  return [PASOS[0], { estado: 'APARTADO', valor: (p) => p.apartado?.confirmadoEn }, ...PASOS.slice(1)];
}

/** Opciones para filtrar listas por estado. */
export const OPCIONES_ESTADO = [
  { valor: '', texto: 'Todos los estados' },
  ...Object.entries(ESTADOS).map(([valor, { texto }]) => ({ valor, texto })),
];

export const ENTREGAS = {
  DOMICILIO: { texto: 'Envío a domicilio', Icono: Truck },
  RECOGER: { texto: 'Recoger con el vendedor', Icono: Store },
};
