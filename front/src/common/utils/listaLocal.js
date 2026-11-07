import { useSyncExternalStore } from 'react';

/**
 * Lista corta guardada en el dispositivo (localStorage) y compartida por toda la app: los
 * componentes que la usan se actualizan juntos. Cada elemento lleva un id.
 * Si el almacenamiento falla (modo privado), funciona en memoria.
 */
const listas = [];
const CLAVE_DUENO = 'gc.dueno';
/** Datos personales del dispositivo que no deben pasar de una cuenta a otra. */
const OTRAS_CLAVES = ['gc.entrega'];

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

  const lista = {
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
  listas.push(lista);
  return lista;
}

/**
 * Las listas del dispositivo son de quien las llenó. Al cerrar sesión o al entrar con otra
 * cuenta se vacían; si alguien navegaba sin sesión y entra, se quedan con esa cuenta.
 */
export function asignarDueno(usuarioId) {
  let anterior = null;
  try {
    anterior = JSON.parse(localStorage.getItem(CLAVE_DUENO));
  } catch {
    /* sin almacenamiento o valor viejo */
  }
  const actual = usuarioId ?? null;
  if (anterior === actual) return;
  if (anterior !== null) {
    listas.forEach((l) => l.vaciar());
    OTRAS_CLAVES.forEach((c) => {
      try {
        localStorage.removeItem(c);
      } catch {
        /* sin almacenamiento */
      }
    });
  }
  try {
    localStorage.setItem(CLAVE_DUENO, JSON.stringify(actual));
  } catch {
    /* sin almacenamiento */
  }
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
