import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Lista los archivos de public/ como rutas absolutas del sitio ("/iconos/icono-192.png"). */
function archivosPublicos(carpeta, base = carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) return archivosPublicos(ruta, base);
    return ['/' + relative(base, ruta).replaceAll('\\', '/')];
  });
}

/** Expresión del origen del back dentro del SW; con URL relativa es el mismo de la página. */
function origenApi(apiUrl) {
  return apiUrl.startsWith('/') ? 'self.location.origin' : JSON.stringify(new URL(apiUrl).origin);
}

/**
 * Genera /sw.js a partir de pwa/sw.js al compilar:
 * - __PRECACHE__: index.html, el JS que carga al inicio, el CSS y los archivos de public/.
 *   Los chunks diferidos (panel, model-viewer) no se precargan: se guardan cuando se usan.
 * - __VERSION__: hash de la lista, para que cada build tenga su caché estática.
 * - __API_ORIGEN__: origen de VITE_API_URL (para reconocer /api y /uploads). Si la URL es
 *   relativa ("/api", nginx en Docker), el back está en el mismo origen que la página.
 */
export default function pluginSw({ apiUrl }) {
  let raiz;
  return {
    name: 'gc-service-worker',
    apply: 'build',
    configResolved(config) {
      raiz = config.root;
    },
    generateBundle(_, bundle) {
      const entrada = Object.values(bundle)
        .filter((b) => (b.type === 'chunk' ? !b.isDynamicEntry : b.fileName.endsWith('.css')))
        .map((b) => '/' + b.fileName);
      const publicos = archivosPublicos(join(raiz, 'public'));
      const precache = [...new Set(['/index.html', ...entrada, ...publicos])].sort();
      const version = createHash('sha256').update(precache.join('|')).digest('hex').slice(0, 10);
      const plantilla = readFileSync(join(raiz, 'pwa', 'sw.js'), 'utf8');

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: plantilla
          .replace("'__VERSION__'", JSON.stringify(version))
          .replace('__PRECACHE__;', JSON.stringify(precache, null, 2) + ';')
          .replace("'__API_ORIGEN__'", origenApi(apiUrl)),
      });
    },
  };
}
