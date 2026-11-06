import { obtener } from '../../common/api/cliente';

/** Catálogo público: muebles publicados y categorías. */
export const catalogoApi = {
  muebles: ({ categoriaId, buscar, precioMin, precioMax, page = 0, size = 20, sort } = {}, signal) =>
    obtener('/muebles', { consulta: { categoriaId, buscar, precioMin, precioMax, page, size, sort }, signal }),
  mueble: (slug, signal) => obtener(`/muebles/${encodeURIComponent(slug)}`, { signal }),
  categorias: (signal) => obtener('/categorias', { consulta: { size: 100 }, signal }),
};

/** Opciones de orden de la pantalla Catálogo (valor = parámetro sort del back). */
export const ORDENES = [
  { valor: 'creadoEn,desc', texto: 'Más recientes' },
  { valor: 'precio,asc', texto: 'Menor precio' },
  { valor: 'precio,desc', texto: 'Mayor precio' },
  { valor: 'nombre,asc', texto: 'Nombre (A-Z)' },
];
