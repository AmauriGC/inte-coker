import { ChevronDown, ChevronUp, ExternalLink, ImagePlus, Images, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { urlArchivo } from '../../app/config';
import { confirmar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import EstadoVacio from '../../common/components/EstadoVacio';
import Hoja from '../../common/components/Hoja';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useEnvio } from '../../common/hooks/useEnvio';
import { pesoArchivo } from '../../common/utils/formato';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { MAXIMO_TRABAJOS, perfilApi } from '../api/perfilApi';
import { LIMITES } from '../api/vendedorApi';
import AvatarVendedor from '../components/AvatarVendedor';

/** Error de formato o peso de una imagen antes de subirla (el back lo valida otra vez). */
function errorImagen(archivo) {
  const { extensiones, maxBytes, texto } = LIMITES.imagen;
  if (!extensiones.some((x) => archivo.name.toLowerCase().endsWith(x))) return `Formato no válido. ${texto}.`;
  if (archivo.size > maxBytes) return `Pesa ${pesoArchivo(archivo.size)}. ${texto}.`;
  return null;
}

/** "Mi perfil": lo que el cliente ve en /vendedor/:slug. */
export default function MiPerfilPage() {
  const { notificar } = useNotificaciones();
  const perfilC = useConsulta((s) => perfilApi.miPerfil(s), []);
  const perfil = perfilC.datos;
  const trabajosC = useConsulta((s) => (perfil?.slug ? perfilApi.trabajos(perfil.slug, s) : Promise.resolve(null)), [perfil?.slug]);
  const trabajos = trabajosC.datos ?? [];
  const [hoja, setHoja] = useState(null); // null | { nuevo: true } | trabajo

  async function cambiarImagen(cual, archivo) {
    const error = errorImagen(archivo);
    if (error) return notificar({ tipo: 'error', titulo: 'No se subió la imagen', texto: error, guardar: false });
    try {
      const nuevo = await perfilApi.subirImagen(cual, archivo);
      perfilC.mutar(() => nuevo);
      notificar({ tipo: 'exito', titulo: cual === 'foto' ? 'Foto guardada' : 'Portada guardada', guardar: false });
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se subió la imagen', texto: e.message, guardar: false });
    }
  }

  async function quitarImagen(cual) {
    try {
      const nuevo = await perfilApi.quitarImagen(cual);
      perfilC.mutar(() => nuevo);
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se pudo quitar', texto: e.message, guardar: false });
    }
  }

  async function mover(indice, paso) {
    const ids = trabajos.map((t) => t.id);
    const destino = indice + paso;
    if (destino < 0 || destino >= ids.length) return;
    [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
    try {
      const lista = await perfilApi.ordenarTrabajos(ids);
      trabajosC.mutar(() => lista);
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se guardó el orden', texto: e.message, guardar: false });
    }
  }

  async function eliminar(trabajo) {
    if (!(await confirmar({ titulo: '¿Borrar este trabajo?', texto: `"${trabajo.titulo}" deja de verse en tu perfil.`, boton: 'Borrar' }))) return;
    try {
      await perfilApi.eliminarTrabajo(trabajo.id);
      trabajosC.mutar((lista) => lista.filter((t) => t.id !== trabajo.id));
      perfilC.mutar((p) => ({ ...p, trabajos: p.trabajos - 1 }));
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se pudo borrar', texto: e.message, guardar: false });
    }
  }

  if (perfilC.error && !perfil) {
    return (
      <Pagina className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
        <EstadoVacio titulo="No pudimos cargar tu perfil" texto={perfilC.error.message}>
          <Boton variante="secundario" onClick={perfilC.recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  return (
    <Pagina className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Mi perfil" texto="Así te conocen tus clientes">
        {perfil && (
          <Boton variante="secundario" icono={ExternalLink} a={`/vendedor/${perfil.slug}`}>
            Ver perfil público
          </Boton>
        )}
      </EncabezadoPanel>

      {!perfil ? (
        <div className="grid gap-3">
          <div className="esqueleto h-48 rounded-[28px]" />
          <div className="esqueleto h-40 rounded-[22px]" />
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-[28px] border border-linea bg-white">
            <div className="relative h-36 bg-gradient-to-br from-[#E9DCCB] via-crema to-[#D9B8A3] md:h-44">
              {perfil.portadaUrl && <img src={urlArchivo(perfil.portadaUrl)} alt="" className="size-full object-cover" />}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <ElegirImagen texto={perfil.portadaUrl ? 'Cambiar portada' : 'Agregar portada'} alElegir={(a) => cambiarImagen('portada', a)} />
                {perfil.portadaUrl && <BotonQuitar etiqueta="Quitar portada" alQuitar={() => quitarImagen('portada')} />}
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3 px-4 pb-4">
              <AvatarVendedor nombre={perfil.nombre} fotoUrl={perfil.fotoUrl} className="-mt-10 size-20 text-[30px] ring-4 ring-white" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[18px] font-bold">{perfil.nombre}</p>
                <p className="text-[12.5px] text-gris">gc-confort/vendedor/{perfil.slug}</p>
              </div>
              <div className="flex gap-2">
                <ElegirImagen texto={perfil.fotoUrl ? 'Cambiar foto' : 'Agregar foto'} alElegir={(a) => cambiarImagen('foto', a)} claro />
                {perfil.fotoUrl && <BotonQuitar etiqueta="Quitar foto" alQuitar={() => quitarImagen('foto')} claro />}
              </div>
            </div>
          </section>

          <FormularioDatos perfil={perfil} alGuardar={(p) => perfilC.mutar(() => p)} />

          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Trabajos</h2>
                <p className="text-[13px] text-gris">
                  {trabajos.length} de {MAXIMO_TRABAJOS}. Fotos de muebles que ya entregaste.
                </p>
              </div>
              <Boton icono={Plus} onClick={() => setHoja({ nuevo: true })} disabled={trabajos.length >= MAXIMO_TRABAJOS}>
                Agregar
              </Boton>
            </div>
            {!trabajosC.datos ? (
              <div className="esqueleto h-24 rounded-[22px]" />
            ) : trabajos.length === 0 ? (
              <EstadoVacio icono={Images} titulo="Tu galería está vacía" texto="Sube fotos de trabajos terminados para que te conozcan mejor." />
            ) : (
              <ul className="grid gap-2.5">
                {trabajos.map((t, i) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-[22px] border border-linea bg-white p-2.5">
                    <img src={urlArchivo(t.imagenUrl)} alt="" className="size-16 shrink-0 rounded-2xl bg-crema object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-semibold">{t.titulo}</p>
                      {t.descripcion && <p className="line-clamp-2 text-[12.5px] text-gris">{t.descripcion}</p>}
                    </div>
                    <div className="flex shrink-0 items-center">
                      <BotonIcono etiqueta="Subir" Icono={ChevronUp} onClick={() => mover(i, -1)} deshabilitado={i === 0} />
                      <BotonIcono etiqueta="Bajar" Icono={ChevronDown} onClick={() => mover(i, 1)} deshabilitado={i === trabajos.length - 1} />
                      <BotonIcono etiqueta="Editar" Icono={Pencil} onClick={() => setHoja(t)} />
                      <BotonIcono etiqueta="Borrar" Icono={Trash2} onClick={() => eliminar(t)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <Hoja
        abierta={Boolean(hoja)}
        alCerrar={() => setHoja(null)}
        titulo={hoja?.nuevo ? 'Agregar trabajo' : 'Editar trabajo'}
        pie={
          <Boton type="submit" form="form-trabajo" icono={Save} bloque className="h-14 text-[16px]">
            {hoja?.nuevo ? 'Agregar a mi galería' : 'Guardar cambios'}
          </Boton>
        }
      >
        {hoja && (
          <FormularioTrabajo
            trabajo={hoja.nuevo ? null : hoja}
            alListo={(t) => {
              if (hoja.nuevo) {
                trabajosC.mutar((lista) => [...(lista ?? []), t]);
                perfilC.mutar((p) => ({ ...p, trabajos: p.trabajos + 1 }));
              } else {
                trabajosC.mutar((lista) => lista.map((x) => (x.id === t.id ? t : x)));
              }
              setHoja(null);
              notificar({ tipo: 'exito', titulo: hoja.nuevo ? 'Trabajo agregado' : 'Trabajo actualizado', guardar: false });
            }}
          />
        )}
      </Hoja>
    </Pagina>
  );
}

function FormularioDatos({ perfil, alGuardar }) {
  const { notificar } = useNotificaciones();
  const [ciudad, setCiudad] = useState(perfil.ciudad ?? '');
  const [bio, setBio] = useState(perfil.bio ?? '');
  const { enviar, enviando, errores, error } = useEnvio((d) => perfilApi.actualizar(d));
  const cambio = ciudad !== (perfil.ciudad ?? '') || bio !== (perfil.bio ?? '');

  async function alEnviar(e) {
    e.preventDefault();
    const r = await enviar({ ciudad: ciudad.trim(), bio: bio.trim() });
    if (r.ok) {
      alGuardar(r.datos);
      notificar({ tipo: 'exito', titulo: 'Perfil guardado', guardar: false });
    }
  }

  return (
    <form onSubmit={alEnviar} noValidate className="mt-4 grid gap-4 rounded-[22px] border border-linea bg-white p-4">
      <Campo etiqueta="Ciudad" maxLength={80} placeholder="Ej. Puebla, Pue." value={ciudad} onChange={(e) => setCiudad(e.target.value)} error={errores.ciudad} />
      <Campo
        etiqueta="Presentación"
        multilinea
        maxLength={280}
        placeholder="Qué haces, con qué maderas trabajas, cuánto tardas en entregar…"
        ayuda={`${bio.length}/280`}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        error={errores.bio ?? (error && !Object.keys(errores).length ? error.message : undefined)}
      />
      <div className="flex justify-end">
        <Boton type="submit" icono={Save} cargando={enviando} disabled={!cambio}>
          Guardar
        </Boton>
      </div>
    </form>
  );
}

function FormularioTrabajo({ trabajo, alListo }) {
  const [titulo, setTitulo] = useState(trabajo?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(trabajo?.descripcion ?? '');
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState(null);
  const { enviar, enviando, errores, error } = useEnvio((d) =>
    trabajo ? perfilApi.editarTrabajo(trabajo.id, d) : perfilApi.agregarTrabajo(d),
  );

  // Libera la vista previa anterior al cambiar de foto y al cerrar la hoja.
  useEffect(() => () => vista && URL.revokeObjectURL(vista), [vista]);

  function elegir(a) {
    const e = errorImagen(a);
    setErrorArchivo(e);
    setArchivo(e ? null : a);
    setVista(e ? null : URL.createObjectURL(a));
  }

  async function alEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    if (!trabajo && !archivo) return setErrorArchivo('Elige la foto del trabajo');
    const r = await enviar({ titulo: titulo.trim(), descripcion: descripcion.trim(), archivo });
    if (r.ok) alListo(r.datos);
  }

  const imagen = vista ?? (trabajo ? urlArchivo(trabajo.imagenUrl) : null);

  return (
    <form id="form-trabajo" onSubmit={alEnviar} noValidate aria-busy={enviando} className="grid gap-4">
      {trabajo ? (
        <img src={imagen} alt="" className="aspect-[4/3] w-full rounded-[22px] bg-crema object-cover" />
      ) : (
        <label className="relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-[22px] border-2 border-dashed border-borde bg-crema/60 text-center hover:border-gris-2">
          {imagen ? (
            <img src={imagen} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="grid justify-items-center gap-1.5 px-4">
              <ImagePlus className="size-7 text-gris" aria-hidden />
              <span className="text-[14px] font-semibold">Elige la foto</span>
              <span className="text-[12.5px] text-gris">{LIMITES.imagen.texto}</span>
            </span>
          )}
          <input type="file" accept={LIMITES.imagen.accept} className="sr-only" onChange={(e) => e.target.files?.[0] && elegir(e.target.files[0])} />
        </label>
      )}
      {errorArchivo && <p className="-mt-2 text-[12.5px] text-[#B3261E]">{errorArchivo}</p>}
      <Campo etiqueta="Título" maxLength={80} placeholder="Ej. Cocina integral en encino" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={errores.titulo} />
      <Campo
        etiqueta="Descripción (opcional)"
        multilinea
        maxLength={280}
        placeholder="Medidas, materiales, para quién fue…"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        error={errores.descripcion ?? (error && !Object.keys(errores).length ? error.message : undefined)}
      />
    </form>
  );
}

function ElegirImagen({ texto, alElegir, claro = false }) {
  const entrada = useRef(null);
  return (
    <label
      className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${
        claro ? 'border border-borde bg-white hover:bg-crema' : 'bg-white/90 shadow-sm backdrop-blur hover:bg-white'
      }`}
    >
      <ImagePlus className="size-4" aria-hidden /> {texto}
      <input
        ref={entrada}
        type="file"
        accept={LIMITES.imagen.accept}
        className="sr-only"
        onChange={(e) => {
          const a = e.target.files?.[0];
          if (a) alElegir(a);
          if (entrada.current) entrada.current.value = '';
        }}
      />
    </label>
  );
}

function BotonQuitar({ etiqueta, alQuitar, claro = false }) {
  return (
    <button
      type="button"
      onClick={alQuitar}
      aria-label={etiqueta}
      title={etiqueta}
      className={`grid size-9 place-items-center rounded-full ${claro ? 'border border-borde bg-white hover:bg-crema' : 'bg-white/90 shadow-sm backdrop-blur hover:bg-white'}`}
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function BotonIcono({ etiqueta, Icono, onClick, deshabilitado = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiqueta}
      title={etiqueta}
      className="grid size-9 place-items-center rounded-full text-texto hover:bg-crema disabled:opacity-30"
    >
      <Icono className="size-4" />
    </button>
  );
}
