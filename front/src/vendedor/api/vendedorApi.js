import { obtener, peticion, subirArchivo } from '../../common/api/cliente';

/** Gestión de muebles (vendedor: los suyos; admin: todos). */
export const vendedorApi = {
  listar: ({ buscar, page = 0, size = 50 } = {}, signal) => obtener('/muebles/gestion', { consulta: { buscar, page, size }, signal }),
  crear: (datos) => obtener('/muebles', { metodo: 'POST', cuerpo: datos }),
  actualizar: (id, datos) => obtener(`/muebles/${id}`, { metodo: 'PUT', cuerpo: datos }),
  publicar: (id, publicado) => obtener(`/muebles/${id}/publicacion`, { metodo: 'PATCH', cuerpo: { publicado } }),
  eliminar: (id) => peticion(`/muebles/${id}`, { metodo: 'DELETE' }),
  subirModelo: (id, archivo, alProgreso) => subirArchivo(`/muebles/${id}/modelo`, archivo, { alProgreso }).then((r) => r.datos),
  subirImagen: (id, archivo, alProgreso) => subirArchivo(`/muebles/${id}/imagen`, archivo, { alProgreso }).then((r) => r.datos),
};

/** Límites que también valida el back (TipoArchivo y AlmacenamientoService). */
export const LIMITES = {
  modelo: { extensiones: ['.glb'], accept: '.glb,model/gltf-binary', maxBytes: 30 * 1024 * 1024, texto: 'Archivo .glb de hasta 30 MB' },
  imagen: { extensiones: ['.png', '.jpg', '.jpeg', '.webp'], accept: 'image/png,image/jpeg,image/webp', maxBytes: 5 * 1024 * 1024, texto: 'PNG, JPG o WEBP de hasta 5 MB' },
};
