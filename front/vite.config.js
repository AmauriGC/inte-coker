import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// envDir '..': el front lee el .env de la raíz del repo (Vite solo expone las VITE_*).
export default defineConfig({
  envDir: '..',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    // model-viewer (visor 3D) va en su propio chunk y pesa cerca de 1 MB.
    chunkSizeWarningLimit: 1200,
  },
});
