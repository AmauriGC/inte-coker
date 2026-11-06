import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import pluginSw from './pwa/pluginSw.js';

// El .env vive en la raíz del repositorio (junto al del back).
const ENV_DIR = '..';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, 'VITE_');
  return {
    envDir: ENV_DIR,
    plugins: [react(), tailwindcss(), pluginSw({ apiUrl: env.VITE_API_URL ?? 'http://localhost:8080/api' })],
    server: { port: 5173 },
    preview: { port: 5173 },
    build: { chunkSizeWarningLimit: 1200 },
  };
});
