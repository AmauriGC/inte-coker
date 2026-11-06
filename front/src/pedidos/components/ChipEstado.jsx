import { datosEstado } from '../estados';

/** Píldora con el color e icono del estado del pedido. */
export default function ChipEstado({ estado, tipoEntrega, className = '' }) {
  const { texto, Icono, fondo, color } = datosEstado(estado, tipoEntrega);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${className}`}
      style={{ backgroundColor: fondo, color }}
    >
      <Icono className="size-3.5" aria-hidden />
      {texto}
    </span>
  );
}
