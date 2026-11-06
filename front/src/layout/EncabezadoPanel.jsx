/** Encabezado común de las pantallas del panel: título, texto y acciones a la derecha. */
export default function EncabezadoPanel({ titulo, texto, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.025em]">{titulo}</h1>
        {texto && <p className="mt-0.5 text-[14px] text-gris">{texto}</p>}
      </div>
      {children}
    </header>
  );
}
