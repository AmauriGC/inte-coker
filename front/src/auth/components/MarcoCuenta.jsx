import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import Pagina from '../../common/components/Pagina';

/** Marco de las pantallas de acceso: cabecera con el sillón flotando y tarjeta blanca. */
export default function MarcoCuenta({ titulo, subtitulo, children, volverA = '/' }) {
  const navegar = useNavigate();
  return (
    <Pagina className="min-h-dvh bg-crema md:grid md:place-items-center md:py-10">
      <div className="mx-auto w-full max-w-md md:overflow-hidden md:rounded-[34px] md:bg-white md:shadow-[0_30px_60px_-30px_rgba(29,27,24,0.35)]">
        <div className="relative h-[250px] overflow-hidden rounded-b-[34px] bg-[#EADBD0] md:rounded-none">
          <div aria-hidden className="absolute -right-16 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgba(168,70,31,0.25),transparent_70%)]" />
          <button
            type="button"
            onClick={() => navegar(volverA)}
            className="absolute left-4 top-[calc(env(safe-area-inset-top)+14px)] z-10 grid size-10 place-items-center rounded-full bg-white/85 backdrop-blur"
            aria-label="Volver"
          >
            <ArrowLeft className="size-[19px]" />
          </button>
          <div aria-hidden className="absolute bottom-7 left-1/2 h-5 w-44 -translate-x-1/2 animate-sombra rounded-[50%] bg-black/30 blur-md" />
          <motion.img
            src="/sillon.webp"
            alt=""
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-x-0 bottom-9 mx-auto h-44 animate-flotar object-contain"
          />
        </div>
        <div className="bg-white px-5 pb-10 pt-6 md:px-7">
          <h1 className="font-display text-[26px] font-bold tracking-[-0.025em]">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-[14px] text-gris">{subtitulo}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </Pagina>
  );
}
