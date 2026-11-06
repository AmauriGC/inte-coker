import { Check, Cuboid, Image, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useId, useRef, useState } from 'react';
import { pesoArchivo } from '../../common/utils/formato';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { LIMITES } from '../api/vendedorApi';

/**
 * Zona punteada para soltar o elegir el archivo, con barra de progreso real (XHR).
 * tipo = 'modelo' | 'imagen'; subir(archivo, alProgreso) devuelve el mueble actualizado.
 */
export default function SubidaArchivo({ tipo, listo, subir, alSubir, deshabilitado = false }) {
  const id = useId();
  const entrada = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState(null);
  const { notificar } = useNotificaciones();
  const limite = LIMITES[tipo];
  const Icono = tipo === 'modelo' ? Cuboid : Image;
  const titulo = tipo === 'modelo' ? 'Modelo 3D (.glb)' : 'Foto del mueble';

  async function procesar(archivo) {
    if (!archivo) return;
    const nombre = archivo.name.toLowerCase();
    if (!limite.extensiones.some((x) => nombre.endsWith(x))) return setError(`Formato no válido. ${limite.texto}.`);
    if (archivo.size > limite.maxBytes) return setError(`Pesa ${pesoArchivo(archivo.size)}. ${limite.texto}.`);
    setError(null);
    setProgreso(0);
    try {
      const mueble = await subir(archivo, setProgreso);
      alSubir(mueble);
      notificar({ tipo: 'exito', titulo: tipo === 'modelo' ? 'Modelo 3D guardado' : 'Imagen guardada', texto: archivo.name, guardar: false });
    } catch (e) {
      setError(e.message);
    } finally {
      setProgreso(null);
      if (entrada.current) entrada.current.value = '';
    }
  }

  const subiendo = progreso !== null;

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          if (!deshabilitado && !subiendo) procesar(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-[20px] border-2 border-dashed p-4 transition-colors ${
          deshabilitado ? 'pointer-events-none opacity-50' : ''
        } ${arrastrando ? 'border-terracota bg-terracota-suave' : listo ? 'border-salvia/40 bg-salvia-suave/50' : 'border-borde bg-crema/60 hover:border-gris-2'}`}
      >
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${listo ? 'bg-salvia text-white' : 'bg-white text-tinta'}`}>
          {listo && !subiendo ? <Check className="size-5" strokeWidth={2.6} /> : <Icono className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold">{titulo}</span>
          <span className="block text-[12.5px] text-gris">
            {subiendo ? `Subiendo… ${progreso}%` : listo ? 'Cargado. Suelta otro para reemplazarlo.' : `Arrastra aquí o toca para elegir. ${limite.texto}.`}
          </span>
        </span>
        {!subiendo && <Upload className="size-[18px] shrink-0 text-gris" aria-hidden />}
        {subiendo && (
          <motion.span className="absolute inset-x-0 bottom-0 h-1 origin-left bg-terracota" initial={{ scaleX: 0 }} animate={{ scaleX: progreso / 100 }} />
        )}
        <input
          ref={entrada}
          id={id}
          type="file"
          accept={limite.accept}
          className="sr-only"
          disabled={deshabilitado || subiendo}
          onChange={(e) => procesar(e.target.files?.[0])}
        />
      </label>
      {error && <p className="mt-1.5 text-[12.5px] text-[#B3261E]">{error}</p>}
    </div>
  );
}
