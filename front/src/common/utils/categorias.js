import { Armchair, Box, LampFloor, Sofa, Table } from 'lucide-react';

/** Color de fondo e icono por categoría (por slug); el resto usa el neutro. */
const ESTILOS = {
  sofas: { tinte: '#E6DDCF', Icono: Sofa },
  sillones: { tinte: '#EADBD0', Icono: Armchair },
  mesas: { tinte: '#DCE3D9', Icono: Table },
  iluminacion: { tinte: '#E4E2DE', Icono: LampFloor },
};

const NEUTRO = { tinte: '#E7E1D6', Icono: Box };

export function estiloCategoria(slug) {
  return ESTILOS[slug] ?? NEUTRO;
}
