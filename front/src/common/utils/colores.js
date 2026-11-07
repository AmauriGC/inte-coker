/** Colores en existencia de un mueble (variantes). */

export const MAXIMO_COLORES = 8;

/** El color elegido o, si no hay, el primero con existencias (o el primero). */
export function colorInicial(variantes, elegido) {
  if (!variantes?.length) return null;
  if (elegido && variantes.some((v) => v.id === elegido)) return elegido;
  return (variantes.find((v) => v.existencias > 0) ?? variantes[0]).id;
}

let siguiente = 0;

/** Fila nueva del editor de colores; clave solo sirve como key de React. */
export function colorNuevo(base) {
  siguiente += 1;
  return { clave: `n${siguiente}`, id: null, nombre: '', hex: '#D9C4A0', existencias: '1', ...base };
}
