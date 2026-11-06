import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import pluginSw from './pwa/pluginSw.js';

// El .env vive en la raíz del repositorio (junto al del back).
const ENV_DIR = '..';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, 'VITE_');
  const apiUrl = env.VITE_API_URL ?? 'http://localhost:8080/api';
  // Con una URL relativa (build de Docker) el proxy de desarrollo apunta al back local.
  const origenBack = apiUrl.startsWith('/') ? 'http://localhost:8080' : new URL(apiUrl).origin;

  // En desarrollo el front llama a /api y /uploads de su propia dirección y Vite los reenvía al back.
  // Se quita la cabecera Origin para que el back no lo trate como petición CORS de otra IP.
  const alBack = {
    target: origenBack,
    changeOrigin: true,
    configure: (proxy) => proxy.on('proxyReq', (peticion) => peticion.removeHeader('origin')),
  };

  return {
    envDir: ENV_DIR,
    plugins: [react(), tailwindcss(), pluginSw({ apiUrl })],
    server: { port: 5173, proxy: { '/api': alBack, '/uploads': alBack } },
    preview: { port: 5173 },
    build: { chunkSizeWarningLimit: 1200 },
  };
});
