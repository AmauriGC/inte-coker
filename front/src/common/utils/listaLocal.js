import { useSyncExternalStore } from 'react';

/**
 * Lista corta guardada en el dispositivo (localStorage) y compartida por toda la app: los
 * componentes que la usan se actualizan juntos. Cada elemento lleva un id.
 * Si el almacenamiento falla (modo privado), funciona en memoria.
 */
export function crearListaLocal(clave, maximo) {
  const oyentes = new Set();
  let cache = leer();

  function leer() {
    try {
      const valor = JSON.parse(localStorage.getItem(clave) ?? '[]');
      return Array.isArray(valor) ? valor : [];
    } catch {
      return [];
    }
  }

  function guardar(lista) {
    cache = lista;
    try {
      localStorage.setItem(clave, JSON.stringify(lista));
    } catch {
      /* sin almacenamiento disponible */
    }
    oyentes.forEach((avisar) => avisar());
  }

  return {
    maximo,
    leer: () => cache,
    suscribir(avisar) {
      oyentes.add(avisar);
      return () => oyentes.delete(avisar);
    },
    /** Lo pone al frente sin repetirlo; lo más viejo sale si ya está llena. */
    alFrente: (item) => guardar([item, ...cache.filter((x) => x.id !== item.id)].slice(0, maximo)),
    /** Lo agrega al final; devuelve false si ya está llena. */
    agregar(item) {
      if (cache.some((x) => x.id === item.id)) return true;
      if (cache.length >= maximo) return false;
      guardar([...cache, item]);
      return true;
    },
    quitar: (id) => guardar(cache.filter((x) => x.id !== id)),
    vaciar: () => guardar([]),
  };
}

/** La lista actual; se vuelve a pintar cuando cambia desde cualquier parte. */
export function useListaLocal(lista) {
  return useSyncExternalStore(lista.suscribir, lista.leer);
}

/** Datos mínimos de un mueble para listas del dispositivo (vistos, comparar). */
export function resumenMueble(m) {
  return { id: m.id, slug: m.slug, nombre: m.nombre, precio: m.precio, imagenUrl: m.imagenUrl, categoria: m.categoria };
}

export const vistosRecientes = crearListaLocal('gc.vistos', 12);
export const comparacion = crearListaLocal('gc.comparar', 3);
