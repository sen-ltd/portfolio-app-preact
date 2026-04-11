import { defineConfig, type PluginOption } from 'vite';
import preact from '@preact/preset-vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function localDataPlugin(): PluginOption {
  return {
    name: 'sen-local-portfolio-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/data.json' || req.url === '/portfolio/data.json') {
          const dataPath = resolve(__dirname, '../../data/entries.json');
          if (existsSync(dataPath)) {
            const body = readFileSync(dataPath, 'utf8');
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.end(body);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [preact(), localDataPlugin()],
  base: '/portfolio/portfolio-app-preact/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
