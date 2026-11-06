import { motion } from 'motion/react';

/** Envoltorio de cada pantalla: entra con un desliz corto y sale con un fundido. */
export default function Pagina({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      className={className}
    >
      {children}
    </motion.main>
  );
}
