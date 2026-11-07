import { Camera, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Pagina from '../../common/components/Pagina';
import { useEnvio } from '../../common/hooks/useEnvio';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { cuentaApi } from '../api/cuentaApi';

/** Nombre y foto de la cuenta. El correo no se cambia aquí. */
export default function EditarPerfilPage() {
  const { usuario, refrescarUsuario } = useSesion();
  const { notificar } = useNotificaciones();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [subiendo, setSubiendo] = useState(null);
  const entrada = useRef(null);
  const { enviar, enviando, errores, error } = useEnvio((n) => cuentaApi.actualizarPerfil(n));

  async function guardar(e) {
    e.preventDefault();
    if (enviando) return;
    const r = await enviar(nombre.trim());
    if (r.ok) {
      await refrescarUsuario();
      notificar({ tipo: 'exito', titulo: 'Perfil actualizado', guardar: false });
    }
  }

  async function cambiarFoto(archivo, quitar = false) {
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

  if (!usuario) return null;

  return (
    <Pagina className="mx-auto max-w-md px-4 pb-32">
      <Encabezado volver titulo="Tu perfil" subtitulo={usuario.email} />

      <section className="flex flex-col items-center gap-3 rounded-[28px] border border-linea bg-white p-5">
        <div className="relative">
          {usuario.fotoUrl ? (
            <img src={usuario.fotoUrl} alt="" className="size-28 rounded-[32px] object-cover" />
          ) : (
            <span className="grid size-28 place-items-center rounded-[32px] bg-terracota font-display text-5xl font-bold text-crema">
              {usuario.nombre?.[0]?.toUpperCase()}
            </span>
          )}
          {typeof subiendo === 'number' && (
            <span className="absolute inset-0 grid place-items-center rounded-[32px] bg-tinta/60 text-[14px] font-bold text-crema">{subiendo}%</span>
          )}
        </div>
        <input
          ref={entrada}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            e.target.value = '';
            if (archivo) cambiarFoto(archivo);
          }}
        />
        <div className="flex gap-2">
          <Boton variante="secundario" icono={Camera} cargando={typeof subiendo === 'number'} disabled={subiendo !== null} onClick={() => entrada.current?.click()}>
            {usuario.fotoUrl ? 'Cambiar foto' : 'Subir foto'}
          </Boton>
          {usuario.fotoUrl && (
            <Boton variante="fantasma" icono={Trash2} cargando={subiendo === 'quitar'} disabled={subiendo !== null} onClick={() => cambiarFoto(null, true)}>
              Quitar
            </Boton>
          )}
        </div>
        <p className="text-center text-[12.5px] text-gris">PNG, JPG o WEBP de hasta 5 MB. Si vendes, también sale en tu perfil público.</p>
      </section>

      <form onSubmit={guardar} noValidate className="mt-4 grid gap-4 rounded-[28px] border border-linea bg-white p-5">
        {error && !Object.keys(errores).length && (
          <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
        )}
        <Campo etiqueta="Nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} maxLength={100} />
        <Boton type="submit" bloque cargando={enviando} disabled={nombre.trim() === usuario.nombre}>
          Guardar cambios
        </Boton>
      </form>
    </Pagina>
  );
}
