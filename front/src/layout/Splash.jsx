import { motion } from 'motion/react';
import Logo from '../common/components/Logo';

const sube = (retraso) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: retraso, ease: [0.2, 0.8, 0.2, 1] } },
});

/** Pantalla de arranque (tablero "09 · Splash animado"). App la quita con AnimatePresence. */
export default function Splash() {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center overflow-hidden bg-tinta text-white"
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.45, ease: 'easeInOut' } }}
      role="status"
      aria-label="Cargando GC-Confort"
    >
      <div aria-hidden className="absolute -left-32 -top-40 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,70,31,0.45),transparent_70%)]" />
      <div aria-hidden className="absolute -right-40 bottom-20 size-[380px] rounded-full bg-[radial-gradient(circle,rgba(46,74,59,0.55),transparent_70%)]" />

      <div className="relative mt-[24dvh] flex flex-col items-center gap-[18px]">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="grid size-[88px] place-items-center rounded-[26px] bg-crema text-tinta"
        >
          <Logo animado className="size-12" grosor={1.6} />
        </motion.span>
        <motion.h1 {...sube(0.5)} className="font-display text-[38px] font-bold tracking-[-0.03em]">
          GC-Confort
        </motion.h1>
        <motion.p {...sube(0.7)} className="text-[15px] text-[#D9D3C8]">
          Muebles en 3D, a la medida de tu casa
        </motion.p>
      </div>

      <motion.div {...sube(0.9)} className="relative mt-14 h-[190px] w-[300px] max-w-[80vw]">
        <div aria-hidden className="absolute inset-x-[50px] bottom-1.5 h-[22px] animate-sombra rounded-[50%] bg-black/60 blur-[10px]" />
        <img src="/sofa.webp" alt="" className="absolute inset-x-0 bottom-[18px] h-40 w-full animate-flotar object-contain" />
      </motion.div>

      <div className="absolute inset-x-[60px] bottom-[92px] mx-auto flex max-w-xs flex-col items-center gap-2.5">
        <div className="h-1 w-full overflow-hidden rounded-sm bg-white/15">
          <motion.div
            className="h-full origin-left bg-terracota"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <span className="text-xs text-[#A9A196]">Preparando el catálogo…</span>
      </div>
    </motion.div>
  );
}
