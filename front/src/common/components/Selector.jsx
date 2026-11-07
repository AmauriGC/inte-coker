import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ALTO_MAXIMO = 288;
const MARGEN = 8;

/**
 * Desplegable con el estilo de la app (no usa el select nativo). Misma forma de uso que un
 * select: value y onChange(e) con e.target.value como texto. La lista se dibuja en <body>
 * para que una hoja o un contenedor con scroll no la recorte, y se abre hacia arriba si
 * abajo no cabe. Teclado: flechas, Inicio, Fin, Enter, Escape y la primera letra.
 */
export default function Selector({ etiqueta, opciones, error, className = '', compacto = false, value, onChange, disabled = false, name }) {
  const id = useId();
  const boton = useRef(null);
  const lista = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const [posicion, setPosicion] = useState(null);

  const indiceActual = opciones.findIndex((o) => String(o.valor) === String(value ?? ''));
  const elegida = opciones[indiceActual] ?? opciones[0];
  const vacio = elegida && String(elegida.valor) === '';

  const colocar = useCallback(() => {
    const r = boton.current?.getBoundingClientRect();
    if (!r) return;
    const ancho = Math.max(r.width, 200);
    const abajo = window.innerHeight - r.bottom - MARGEN;
    const arriba = r.top - MARGEN;
    const haciaArriba = abajo < Math.min(ALTO_MAXIMO, opciones.length * 44 + 12) && arriba > abajo;
    const izquierda = Math.min(r.left, window.innerWidth - ancho - MARGEN);
    setPosicion({
      left: Math.max(MARGEN, izquierda),
      width: ancho,
      maxHeight: Math.min(ALTO_MAXIMO, (haciaArriba ? arriba : abajo) - 4),
      ...(haciaArriba ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      haciaArriba,
    });
  }, [opciones.length]);

  function abrir() {
    if (disabled) return;
    setActivo(Math.max(0, indiceActual));
    colocar();
    setAbierto(true);
  }

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  }, []);

  function elegir(i) {
    const o = opciones[i];
    if (!o) return;
    if (String(o.valor) !== String(value ?? '')) onChange?.({ target: { value: String(o.valor), name } });
    cerrar();
  }

  // Abierto: la lista toma el foco, sigue al botón si algo se desplaza y se cierra al tocar fuera.
  useLayoutEffect(() => {
    if (abierto) lista.current?.focus({ preventScroll: true });
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;
    const alTocar = (e) => {
      if (!boton.current?.contains(e.target) && !lista.current?.contains(e.target)) cerrar(false);
    };
    const alMover = (e) => {
      if (!lista.current?.contains(e.target)) colocar();
    };
    document.addEventListener('pointerdown', alTocar);
    window.addEventListener('scroll', alMover, true);
    window.addEventListener('resize', colocar);
    return () => {
      document.removeEventListener('pointerdown', alTocar);
      window.removeEventListener('scroll', alMover, true);
      window.removeEventListener('resize', colocar);
    };
  }, [abierto, cerrar, colocar]);

  useEffect(() => {
    if (abierto) lista.current?.querySelector(`[data-indice="${activo}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [abierto, activo]);

  function alTeclearBoton(e) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      abrir();
    }
  }

  function alTeclearLista(e) {
    const ultimo = opciones.length - 1;
    const mover = { ArrowDown: Math.min(ultimo, activo + 1), ArrowUp: Math.max(0, activo - 1), Home: 0, End: ultimo };
    if (e.key in mover) {
      e.preventDefault();
      setActivo(mover[e.key]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elegir(activo);
    } else if (e.key === 'Escape') {
      // Solo cierra la lista, no la hoja donde vive.
      e.preventDefault();
      e.stopPropagation();
      cerrar();
    } else if (e.key === 'Tab') {
      cerrar(false);
    } else if (e.key.length === 1) {
      const letra = e.key.toLowerCase();
      const siguiente = opciones.findIndex((o, i) => i > activo && o.texto.toLowerCase().startsWith(letra));
      const desdeInicio = opciones.findIndex((o) => o.texto.toLowerCase().startsWith(letra));
      const i = siguiente >= 0 ? siguiente : desdeInicio;
      if (i >= 0) setActivo(i);
    }
  }

  return (
    <div className={className}>
      {etiqueta && !compacto && (
        <label id={`${id}-etiqueta`} htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-texto">
          {etiqueta}
        </label>
      )}
      <button
        ref={boton}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? `${id}-lista` : undefined}
        aria-label={compacto ? `${etiqueta}: ${elegida?.texto ?? ''}` : undefined}
        aria-invalid={error ? true : undefined}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={alTeclearBoton}
        className={[
          'relative flex w-full items-center rounded-full border bg-white pl-4 pr-10 text-left font-medium outline-none transition',
          'focus-visible:border-tinta focus-visible:ring-4 focus-visible:ring-tinta/5 disabled:cursor-not-allowed disabled:opacity-50',
          compacto ? 'h-10 text-[13.5px]' : 'h-12 rounded-2xl text-[15px]',
          abierto ? 'border-tinta ring-4 ring-tinta/5' : error ? 'border-[#B3261E]' : 'border-borde hover:border-gris-2',
          vacio ? 'text-gris' : 'text-tinta',
        ].join(' ')}
      >
        <span className="truncate">{elegida?.texto}</span>
        <ChevronDown
          className={`pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-gris transition-transform ${abierto ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {error && <p className="mt-1.5 text-[12.5px] text-[#B3261E]">{error}</p>}

      {createPortal(
        <AnimatePresence>
          {abierto && posicion && (
            <motion.ul
              ref={lista}
              id={`${id}-lista`}
              role="listbox"
              tabIndex={-1}
              aria-label={etiqueta}
              aria-activedescendant={`${id}-op-${activo}`}
              onKeyDown={alTeclearLista}
              initial={{ opacity: 0, y: posicion.haciaArriba ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 36 }}
              style={{ left: posicion.left, width: posicion.width, maxHeight: posicion.maxHeight, top: posicion.top, bottom: posicion.bottom }}
              className={`fixed z-[65] overflow-y-auto overscroll-contain rounded-[20px] border border-linea bg-white p-1.5 shadow-[0_18px_40px_-16px_rgba(29,27,24,0.4)] outline-none ${
                posicion.haciaArriba ? 'origin-bottom' : 'origin-top'
              }`}
            >
              {opciones.map((o, i) => {
                const seleccionada = i === indiceActual;
                return (
                  <li
                    key={o.valor}
                    id={`${id}-op-${i}`}
                    data-indice={i}
                    role="option"
                    aria-selected={seleccionada}
                    onPointerMove={() => setActivo(i)}
                    onClick={() => elegir(i)}
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[14px] px-3 py-2 text-[14px] ${
                      i === activo ? 'bg-crema' : ''
                    } ${seleccionada ? 'font-semibold text-tinta' : 'text-texto'}`}
                  >
                    <span className="flex-1">{o.texto}</span>
                    {seleccionada && <Check className="size-4 shrink-0 text-terracota" aria-hidden />}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
