import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const documents = process.env.RECEIPT_QA_DIRECTORY ?? fileURLToPath(new URL('../../../../output/pdf/classic-receipts-qa/', import.meta.url));
export default defineConfig({ root: here, publicDir: `${repo}/public`,
  cacheDir: process.env.RECEIPT_VITE_CACHE ?? `${repo}/node_modules/.vite/classic-receipts`,
  resolve: { alias: [{ find: /^src\/redux\/service$/, replacement: `${here}/mock-service.ts` }, { find: 'src', replacement: `${repo}/src` }] },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' }, esbuild: { jsx: 'automatic' },
  plugins: [{ name: 'actual-receipt-documents', configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const match = /^\/documents\/(classic-[A-Za-z-]+\.pdf)$/.exec(req.url ?? '');
      if (!match) return next();
      try { res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="${match[1]}"`);
        res.end(await readFile(`${documents}/${match[1]}`));
      } catch { res.statusCode = 404; res.end('Generate backend receipt PDFs first.'); }
    });
  } }], server: { host: '127.0.0.1', port: 5197, strictPort: true, fs: { allow: [repo] } } });
