import { BadgeCheck, Camera, ChevronRight, ImagePlus, KeyRound, Lock, Mail, Store, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import { datosRol } from '../../auth/roles';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Pagina from '../../common/components/Pagina';
import { useEnvio } from '../../common/hooks/useEnvio';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { cuentaApi } from '../api/cuentaApi';
import HojaPassword from '../components/HojaPassword';

const TIPOS = ['image/png', 'image/jpeg', 'image/webp'];
const MAXIMO_MB = 5;
const mesYAnio = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });
const NOMBRE = { foto: 'Foto', portada: 'Portada' };

/** Anillo de progreso mientras sube una imagen. */
function Progreso({ valor, className = '' }) {
  return (
    <span
      className={`absolute inset-0 grid place-items-center bg-tinta/55 backdrop-blur-[1px] ${className}`}
      role="progressbar"
      aria-valuenow={valor}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Subiendo imagen"
    >
      <svg viewBox="0 0 36 36" className="absolute size-16 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(valor / 100) * 97.4} 97.4`} />
      </svg>
      <span className="relative text-[13px] font-bold text-white">{valor}%</span>
    </span>
  );
}

/** Botón redondo sobre la portada. */
function BotonPortada({ icono: Icono, children, ...resto }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black/35 px-3 text-[12.5px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/50 disabled:opacity-50"
      {...resto}
    >
      <Icono className="size-4" aria-hidden /> {children}
    </button>
  );
}

/** Perfil de la cuenta: portada, foto (tocar o soltar una imagen), nombre, correo y contraseña. */
export default function EditarPerfilPage() {
  const { usuario, roles, cuentaTienePermiso, refrescarUsuario } = useSesion();
  const { notificar } = useNotificaciones();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  // { cual: 'foto' | 'portada', valor: 0-100 | 'quitar' }
  const [subiendo, setSubiendo] = useState(null);
  const [encima, setEncima] = useState(false);
  const [password, setPassword] = useState(false);
  const entradaFoto = useRef(null);
  const entradaPortada = useRef(null);
  const { enviar, enviando, errores, error } = useEnvio((n) => cuentaApi.actualizarPerfil(n));

  if (!usuario) return null;

  const cambiado = nombre.trim() !== usuario.nombre;
  const ocupado = subiendo !== null;
  const progreso = (cual) => (subiendo?.cual === cual && typeof subiendo.valor === 'number' ? subiendo.valor : null);

  async function guardar(e) {
    e.preventDefault();
    if (enviando || !cambiado) return;
    const r = await enviar(nombre.trim());
    if (r.ok) {
      await refrescarUsuario();
      notificar({ tipo: 'exito', titulo: 'Perfil actualizado', guardar: false });
    }
  }

  async function cambiarImagen(cual, archivo) {
    const quitar = archivo === null;
    if (!quitar) {
      if (!TIPOS.includes(archivo.type)) {
        notificar({ tipo: 'error', titulo: 'Ese archivo no es una imagen', texto: 'Usa una imagen PNG, JPG o WEBP.', guardar: false });
        return;
      }
      if (archivo.size > MAXIMO_MB * 1024 * 1024) {
        notificar({ tipo: 'error', titulo: 'La imagen pesa demasiado', texto: `Elige una de hasta ${MAXIMO_MB} MB.`, guardar: false });
        return;
      }
    }
    setSubiendo({ cual, valor: quitar ? 'quitar' : 0 });
    try {
      const alProgreso = (p) => setSubiendo({ cual, valor: p });
      if (cual === 'foto') await (quitar ? cuentaApi.quitarFoto() : cuentaApi.subirFoto(archivo, alProgreso));
      else await (quitar ? cuentaApi.quitarPortada() : cuentaApi.subirPortada(archivo, alProgreso));
      await refrescarUsuario();
      notificar({ tipo: 'exito', titulo: `${NOMBRE[cual]} ${quitar ? 'quitada' : 'actualizada'}`, guardar: false });
    } catch (err) {
      notificar({ tipo: 'error', titulo: `No se pudo cambiar la ${NOMBRE[cual].toLowerCase()}`, texto: err.message, guardar: false });
    } finally {
      setSubiendo(null);
    }
  }

  const soltarFoto = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!ocupado) setEncima(true);
    },
    onDragLeave: () => setEncima(false),
    onDrop: (e) => {
      e.preventDefault();
      setEncima(false);
      const archivo = e.dataTransfer.files?.[0];
      if (archivo && !ocupado) cambiarImagen('foto', archivo);
    },
  };

  const entrada = (ref, cual) => (
    <input
      ref={ref}
      type="file"
      accept={TIPOS.join(',')}
      hidden
      onChange={(e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (archivo) cambiarImagen(cual, archivo);
      }}
    />
  );

  return (
    <Pagina className="mx-auto max-w-md px-4 pb-32">
      <Encabezado volver titulo="Tu perfil" />

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[30px] border border-linea bg-white">
        <div className="relative h-36 overflow-hidden bg-tinta">
          {usuario.portadaUrl ? (
            <img src={usuario.portadaUrl} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <>
              <div aria-hidden className="absolute -right-10 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(168,70,31,0.6),transparent_70%)]" />
              <div aria-hidden className="absolute -bottom-24 -left-10 size-56 rounded-full bg-[radial-gradient(circle,rgba(143,161,132,0.35),transparent_70%)]" />
            </>
          )}
          {progreso('portada') !== null && <Progreso valor={progreso('portada')} />}
          <div className="absolute right-3 top-3 flex gap-1.5">
            <BotonPortada icono={ImagePlus} onClick={() => entradaPortada.current?.click()} disabled={ocupado}>
              {usuario.portadaUrl ? 'Cambiar portada' : 'Poner portada'}
            </BotonPortada>
            {usuario.portadaUrl && (
              <BotonPortada icono={Trash2} onClick={() => cambiarImagen('portada', null)} disabled={ocupado} aria-label="Quitar portada">
                <span className="sr-only">Quitar portada</span>
              </BotonPortada>
            )}
          </div>
          {entrada(entradaPortada, 'portada')}
        </div>

        <div className="relative -mt-14 flex flex-col items-center px-5 pb-5 text-center" {...soltarFoto}>
          <button
            type="button"
            onClick={() => entradaFoto.current?.click()}
            disabled={ocupado}
            aria-label={usuario.fotoUrl ? 'Cambiar foto' : 'Subir foto'}
            className={`group relative size-28 rounded-[34px] ring-[5px] transition-[box-shadow,transform] focus-visible:outline-none focus-visible:ring-terracota/40 ${
              encima ? 'scale-105 ring-terracota' : 'ring-white'
            }`}
          >
            {usuario.fotoUrl ? (
              <img src={usuario.fotoUrl} alt="" className="size-full rounded-[34px] object-cover" />
            ) : (
              <span className="grid size-full place-items-center rounded-[34px] bg-terracota font-display text-5xl font-bold text-crema">{usuario.nombre?.[0]?.toUpperCase()}</span>
            )}
            <span className="absolute inset-0 grid place-items-center rounded-[34px] bg-tinta/0 text-white opacity-0 transition group-hover:bg-tinta/40 group-hover:opacity-100">
              <ImagePlus className="size-7" aria-hidden />
            </span>
            {progreso('foto') !== null && <Progreso valor={progreso('foto')} className="rounded-[34px]" />}
            <span className="absolute -bottom-1.5 -right-1.5 grid size-10 place-items-center rounded-full bg-tinta text-crema ring-4 ring-white" aria-hidden>
              <Camera className="size-[18px]" />
            </span>
          </button>
          {entrada(entradaFoto, 'foto')}

          <h2 className="mt-4 font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">{usuario.nombre}</h2>
          <p className="mt-0.5 text-[13.5px] text-gris">{usuario.creadoEn ? `En GC-Confort desde ${mesYAnio.format(new Date(usuario.creadoEn))}` : usuario.email}</p>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {roles.map((r) => (
              <span key={r} className="rounded-full bg-crema px-3 py-1 text-[12px] font-semibold text-tinta">
                {datosRol(r).nombre}
              </span>
            ))}
            {usuario.verificado && (
              <span className="inline-flex items-center gap-1 rounded-full bg-salvia-suave px-3 py-1 text-[12px] font-semibold text-salvia">
                <BadgeCheck className="size-3.5" aria-hidden /> Verificado
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-1">
            <button
              type="button"
              onClick={() => entradaFoto.current?.click()}
              disabled={ocupado}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-terracota transition-colors hover:bg-terracota-suave disabled:opacity-50"
            >
              <Camera className="size-4" aria-hidden /> {usuario.fotoUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {usuario.fotoUrl && (
              <button
                type="button"
                onClick={() => cambiarImagen('foto', null)}
                disabled={ocupado}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-gris transition-colors hover:bg-crema hover:text-tinta disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden /> {subiendo?.cual === 'foto' && subiendo.valor === 'quitar' ? 'Quitando…' : 'Quitar'}
              </button>
            )}
          </div>
          <p className="mt-1 text-[12px] text-gris-2">PNG, JPG o WEBP de hasta {MAXIMO_MB} MB. También puedes soltar la foto aquí.</p>
        </div>
      </motion.section>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.06 } }}
        onSubmit={guardar}
        noValidate
        aria-busy={enviando}
        className="mt-4 rounded-[28px] border border-linea bg-white p-5"
      >
        <h2 className="font-display text-[17px] font-semibold">Datos personales</h2>
        <p className="mb-4 text-[13px] text-gris">Así te ven los demás en GC-Confort.</p>

        {error && !Object.keys(errores).length && (
          <p role="alert" className="mb-4 rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
        )}
        <Campo etiqueta="Nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} maxLength={100} />

        <div className="mt-4">
          <p className="mb-1.5 text-[13px] font-semibold text-texto">Correo</p>
          <div className="flex h-12 items-center gap-3 rounded-2xl bg-crema px-4 text-[15px] text-texto">
            <Mail className="size-[18px] shrink-0 text-gris-2" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{usuario.email}</span>
            <Lock className="size-4 shrink-0 text-gris-2" aria-label="No se puede cambiar" />
          </div>
          <p className="mt-1.5 text-[12px] text-gris">Es con el que entras; no se cambia aquí.</p>
        </div>

        <AnimatePresence initial={false}>
          {cambiado && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex gap-2 pt-5">
                <Boton type="button" variante="secundario" onClick={() => setNombre(usuario.nombre)} disabled={enviando} className="flex-1">
                  Descartar
                </Boton>
                <Boton type="submit" cargando={enviando} className="flex-1">
                  Guardar
                </Boton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        aria-labelledby="titulo-seguridad"
        className="mt-4 rounded-[28px] border border-linea bg-white p-1.5"
      >
        <h2 id="titulo-seguridad" className="sr-only">
          Seguridad
        </h2>
        <button type="button" onClick={() => setPassword(true)} className="flex w-full items-center gap-3.5 rounded-[22px] px-3 py-3 text-left transition-colors hover:bg-crema">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-crema text-tinta">
            <KeyRound className="size-[19px]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">Cambiar contraseña</span>
            <span className="block text-[12.5px] text-gris">Con tu contraseña actual</span>
          </span>
          <ChevronRight className="size-[18px] text-gris-2" aria-hidden />
        </button>
        {cuentaTienePermiso('PERFIL_VENDEDOR_EDITAR') && (
          <Link to="/panel/perfil" className="flex items-center gap-3.5 rounded-[22px] px-3 py-3 transition-colors hover:bg-crema">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-crema text-tinta">
              <Store className="size-[19px]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">Tu perfil de vendedor</span>
              <span className="block text-[12.5px] text-gris">Presentación, ciudad y trabajos que ven tus clientes</span>
            </span>
            <ChevronRight className="size-[18px] text-gris-2" aria-hidden />
          </Link>
        )}
      </motion.section>

      <HojaPassword
        abierta={password}
        alCerrar={() => setPassword(false)}
        alListo={() => {
          setPassword(false);
          notificar({ tipo: 'exito', titulo: 'Contraseña actualizada', texto: 'Te mandamos un correo para avisarte del cambio.', guardar: false });
        }}
      />
    </Pagina>
  );
}
