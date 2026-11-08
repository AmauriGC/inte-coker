import { BarChart3, Bell, Columns3, Heart, House, LayoutGrid, MessageSquareText, Package, ReceiptText, Shield, Store, Tags, Truck, User, UserPlus, Users } from 'lucide-react';
import { useSesion } from '../auth/context/SesionContext';
import { useAvisos } from '../notificaciones/context/AvisosContext';
import { usePedidos } from '../pedidos/context/PedidosContext';

/**
 * Secciones del panel, en el orden del menú lateral. Cada una aparece si el rol activo tiene
 * alguno de sus `permisos` (y ninguno de `excepto`). `pestana`: permisos con los que además
 * va en la bottom bar; `prioridad` ordena cuáles caben ahí (máximo 3).
 */
const SECCIONES = [
  { a: '/panel/muebles', texto: 'Mis muebles', Icono: Package, permisos: ['MUEBLE_CREAR'], pestana: ['MUEBLE_CREAR'], prioridad: 1, corto: 'Muebles' },
  { a: '/panel/pedidos', texto: 'Pedidos', Icono: ReceiptText, permisos: ['PEDIDO_ATENDER'], pestana: ['PEDIDO_ATENDER'], prioridad: 2, contador: true },
  { a: '/panel/metricas', texto: 'Métricas', Icono: BarChart3, permisos: ['METRICA_VER', 'METRICA_GLOBAL'], pestana: ['METRICA_VER', 'METRICA_GLOBAL'], prioridad: 3 },
  { a: '/panel/transportistas', texto: 'Transportistas', Icono: Truck, permisos: ['TRANSPORTISTA_GESTIONAR'] },
  { a: '/panel/perfil', texto: 'Mi perfil', Icono: Store, permisos: ['PERFIL_VENDEDOR_EDITAR'] },
  { a: '/panel/solicitudes', texto: 'Solicitudes', Icono: UserPlus, permisos: ['USUARIO_GESTIONAR'], pestana: ['USUARIO_GESTIONAR'], prioridad: 4 },
  { a: '/panel/usuarios', texto: 'Usuarios', Icono: Users, permisos: ['USUARIO_GESTIONAR'], pestana: ['USUARIO_GESTIONAR'], prioridad: 5 },
  { a: '/panel/roles', texto: 'Roles y permisos', Icono: Shield, permisos: ['ROL_GESTIONAR'] },
  { a: '/panel/categorias', texto: 'Categorías', Icono: Tags, permisos: ['CATEGORIA_GESTIONAR'] },
  { a: '/panel/resenas', texto: 'Reseñas', Icono: MessageSquareText, permisos: ['RESENA_MODERAR'] },
  // Supervisión (solo verlos y cancelar por moderación); quien atiende ya tiene "Pedidos" arriba.
  { a: '/panel/pedidos', texto: 'Pedidos', Icono: ReceiptText, permisos: ['PEDIDO_SUPERVISAR'], excepto: ['PEDIDO_ATENDER'] },
];

/** La parte pública, en el menú lateral de quien tiene panel. */
export const TIENDA = [
  { a: '/', texto: 'Inicio', Icono: House, fin: true },
  { a: '/catalogo', texto: 'Catálogo', Icono: LayoutGrid },
  { a: '/favoritos', texto: 'Favoritos', Icono: Heart },
  { a: '/comparar', texto: 'Comparar', Icono: Columns3 },
];

export const AVISOS = { a: '/avisos', texto: 'Avisos', Icono: Bell, cuenta: 'avisos' };
export const CUENTA = { a: '/cuenta', texto: 'Mi cuenta', Icono: User };

const PUBLICAS = [
  { a: '/', texto: 'Inicio', Icono: House, fin: true },
  { a: '/catalogo', texto: 'Catálogo', Icono: LayoutGrid },
  { a: '/favoritos', texto: 'Favoritos', Icono: Heart },
  AVISOS,
  { a: '/cuenta', texto: 'Cuenta', Icono: User, cuenta: 'pedidos' },
];

const DE_TRANSPORTISTA = [{ a: '/entregas', texto: 'Entregas', Icono: Truck }, AVISOS, { a: '/cuenta', texto: 'Cuenta', Icono: User }];

/** Lo que hay en la bottom bar y el menú lateral según el rol activo y sus permisos. */
export function useNavegacion() {
  const { tienePermiso } = useSesion();
  const { resumen } = usePedidos();
  const { sinLeer } = useAvisos();
  const secciones = SECCIONES.filter((s) => tienePermiso(...s.permisos) && !(s.excepto && tienePermiso(...s.excepto)));
  const conMenu = secciones.length > 0;

  let pestanas;
  if (conMenu) {
    const fijas = secciones
      .filter((s) => s.pestana && tienePermiso(...s.pestana))
      .sort((x, y) => x.prioridad - y.prioridad)
      .slice(0, 3)
      .map((s) => ({ ...s, texto: s.corto ?? s.texto, cuenta: s.contador ? 'ventas' : undefined }));
    pestanas = [...fijas, AVISOS];
  } else if (tienePermiso('ENTREGA_REALIZAR') && !tienePermiso('PEDIDO_CREAR')) {
    pestanas = DE_TRANSPORTISTA;
  } else {
    pestanas = PUBLICAS;
  }

  return {
    secciones,
    pestanas,
    conMenu,
    etiqueta: tienePermiso('USUARIO_GESTIONAR') ? 'Administración' : 'Mi negocio',
    cuentas: { avisos: sinLeer, ventas: resumen.ventasPorAtender + resumen.ventasSinLeer, pedidos: resumen.comprasSinLeer },
  };
}
