const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function precio(valor) {
  return valor === null || valor === undefined ? '' : moneda.format(Number(valor));
}

/** "210 × 92 × 89 cm" (ancho × fondo × alto). */
export function medidas({ anchoCm, fondoCm, altoCm }) {
  return `${anchoCm} × ${fondoCm} × ${altoCm} cm`;
}

export function pesoArchivo(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "hace 5 minutos", "ayer"... */
export function haceCuanto(fecha) {
  const segundos = Math.round((new Date(fecha).getTime() - Date.now()) / 1000);
  const tramos = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unidad, tamano] of tramos) {
    if (Math.abs(segundos) >= tamano) return relativo.format(Math.round(segundos / tamano), unidad);
  }
  return 'justo ahora';
}

/** Primer nombre para saludar. */
export function primerNombre(nombre) {
  return (nombre ?? '').trim().split(/\s+/)[0] ?? '';
}
