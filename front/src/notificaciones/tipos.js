import { BadgeCheck, CircleAlert, Heart, Info, MessageCircle, Package, RefreshCw, ShoppingBag, Sparkles, WifiOff } from 'lucide-react';

/** Icono y colores de cada tipo de aviso (mismos tonos que el tablero "Avisos" del diseño). */
export const TIPOS = {
  exito: { Icono: BadgeCheck, fondo: '#DCE3D9', color: '#2E4A3B' },
  favorito: { Icono: Heart, fondo: '#F3DED3', color: '#A8461F' },
  mueble: { Icono: Package, fondo: '#E6DDCF', color: '#1D1B18' },
  pedido: { Icono: ShoppingBag, fondo: '#F3DED3', color: '#7E3316' },
  mensaje: { Icono: MessageCircle, fondo: '#E7E1D6', color: '#1D1B18' },
  novedad: { Icono: Sparkles, fondo: '#EADBD0', color: '#7E3316' },
  conexion: { Icono: WifiOff, fondo: '#E4E2DE', color: '#4A443C' },
  version: { Icono: RefreshCw, fondo: '#DCE3D9', color: '#2E4A3B' },
  error: { Icono: CircleAlert, fondo: '#F6DAD7', color: '#B3261E' },
  info: { Icono: Info, fondo: '#E7E1D6', color: '#4A443C' },
};

export function tipoAviso(tipo) {
  return TIPOS[tipo] ?? TIPOS.info;
}
