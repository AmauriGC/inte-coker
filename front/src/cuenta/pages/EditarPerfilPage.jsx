import { BadgeCheck, Camera, ChevronRight, ImagePlus, Lock, Mail, Store, Trash2 } from 'lucide-react';
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

const TIPOS = ['image/png', 'image/jpeg', 'image/webp'];
const MAXIMO_MB = 5;
const mesYAnio = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });

/** Anillo de progreso sobre la foto mientras sube. */
function Progreso({ valor }) {
  return (
    <span className="absolute inset-0 grid place-items-center rounded-[34px] bg-tinta/55 backdrop-blur-[1px]" role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100} aria-label="Subiendo foto">
      <svg viewBox="0 0 36 36" className="absolute size-16 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(valor / 100) * 97.4} 97.4`} />
      </svg>
      <span className="relative text-[13px] font-bold text-white">{valor}%</span>
    </span>
  );
}

/** Perfil de la cuenta: foto (tocar o soltar una imagen), nombre y correo. */
export default function EditarPerfilPage() {
  const { usuario, roles, cuentaTienePermiso, refrescarUsuario } = useSesion();
  const { notificar } = useNotificaciones();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [subiendo, setSubiendo] = useState(null);
  const [encima, setEncima] = useState(false);
  const entrada = useRef(null);
  const { enviar, enviando, errores, error } = useEnvio((n) => cuentaApi.actualizarPerfil(n));

  if (!usuario) return null;

  const cambiado = nombre.trim() !== usuario.nombre;
  const ocupado = subiendo !== null;

  async function guardar(e) {
    e.preventDefault();
    if (enviando || !cambiado) return;
    const r = await enviar(nombre.trim());
    if (r.ok) {
      await refrescarUsuario();
      notificar({ tipo: 'exito', titulo: 'Perfil actualizado', guardar: false });
    }
  }

  async function cambiarFoto(archivo, quitar = false) {
    if (!quitar) {
      if (!TIPOS.includes(archivo.type)) {
        notificar({ tipo: 'error', titulo: 'Ese archivo no es una foto', texto: 'Usa una imagen PNG, JPG o WEBP.', guardar: false });
        return;
      }
      if (archivo.size > MAXIMO_MB * 1024 * 1024) {
        notificar({ tipo: 'error', titulo: 'La foto pesa demasiado', texto: `Elige una de hasta ${MAXIMO_MB} MB.`, guardar: false });
        return;
      }
    }
    setSubiendo(quitar ? 'quitar' : 0);
    try {
      if (quitar) await cuentaApi.quitarFoto();
      else await cuentaApi.subirFoto(archivo, (p) => setSubiendo(p));
      await refrescarUsuario();
      notificar({ tipo: 'exito', titulo: quitar ? 'Foto quitada' : 'Foto actualizada', guardar: false });
    } catch (err) {
      notificar({ tipo: 'error', titulo: 'No se pudo cambiar la foto', texto: err.message, guardar: false });
    } finally {
      setSubiendo(null);
    }
  }

  const soltar = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!ocupado) setEncima(true);
    },
    onDragLeave: () => setEncima(false),
    onDrop: (e) => {
      e.preventDefault();
      setEncima(false);
      const archivo = e.dataTransfer.files?.[0];
      if (archivo && !ocupado) cambiarFoto(archivo);
    },
  };

  return (
    <Pagina className="mx-auto max-w-md px-4 pb-32">
      <Encabezado volver titulo="Tu perfil" />

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[30px] border border-linea bg-white" {...soltar}>
        <div className="relative h-28 overflow-hidden bg-tinta">
          <div aria-hidden className="absolute -right-10 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(168,70,31,0.6),transparent_70%)]" />
          <div aria-hidden className="absolute -bottom-24 -left-10 size-56 rounded-full bg-[radial-gradient(circle,rgba(143,161,132,0.35),transparent_70%)]" />
        </div>

        <div className="relative -mt-14 flex flex-col items-center px-5 pb-5 text-center">
          <button
            type="button"
            onClick={() => entrada.current?.click()}
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
            {typeof subiendo === 'number' && <Progreso valor={subiendo} />}
            <span className="absolute -bottom-1.5 -right-1.5 grid size-10 place-items-center rounded-full bg-tinta text-crema ring-4 ring-white" aria-hidden>
              <Camera className="size-[18px]" />
            </span>
          </button>
          <input
            ref={entrada}
            type="file"
            accept={TIPOS.join(',')}
            hidden
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              e.target.value = '';
              if (archivo) cambiarFoto(archivo);
            }}
          />

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
              onClick={() => entrada.current?.click()}
              disabled={ocupado}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-terracota transition-colors hover:bg-terracota-suave disabled:opacity-50"
            >
              <Camera className="size-4" aria-hidden /> {usuario.fotoUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {usuario.fotoUrl && (
              <button
                type="button"
                onClick={() => cambiarFoto(null, true)}
                disabled={ocupado}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-gris transition-colors hover:bg-crema hover:text-tinta disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden /> {subiendo === 'quitar' ? 'Quitando…' : 'Quitar'}
              </button>
            )}
          </div>
          <p className="mt-1 text-[12px] text-gris-2">PNG, JPG o WEBP de hasta {MAXIMO_MB} MB. También puedes soltarla aquí.</p>
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

      {cuentaTienePermiso('PERFIL_VENDEDOR_EDITAR') && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}>
          <Link to="/panel/perfil" className="mt-4 flex items-center gap-3.5 rounded-[24px] border border-linea bg-white p-4 transition-colors hover:bg-crema">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-crema text-tinta">
              <Store className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">Tu perfil de vendedor</span>
              <span className="block text-[12.5px] text-gris">Portada, presentación y trabajos que ven tus clientes</span>
            </span>
            <ChevronRight className="size-[18px] text-gris-2" aria-hidden />
          </Link>
        </motion.div>
      )}
    </Pagina>
  );
}
