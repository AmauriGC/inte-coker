import { createContext, useContext } from 'react';

export const PedidosContext = createContext(null);

/** { resumen: { comprasSinLeer, ventasSinLeer, ventasPorAtender }, refrescar() } */
export function usePedidos() {
  const contexto = useContext(PedidosContext);
  if (!contexto) throw new Error('usePedidos debe usarse dentro de PedidosProvider');
  return contexto;
}
