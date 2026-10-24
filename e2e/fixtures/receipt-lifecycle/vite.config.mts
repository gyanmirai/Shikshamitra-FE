import { readFile, readdir } from 'node:fs/promises';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

async function servePdf(req: any, res: any, next: any) {
  const match = /^\/pdf\/(Provisional|Official)-Receipt-Example\.pdf(?:\?.*)?$/.exec(req.url || '');
  if (!match) return next();
  try {
    const folder = fileURLToPath(new URL('../../../../output/pdf/receipt-lifecycle-e2e/', import.meta.url));
    const name = (await readdir(folder)).find(name => name.startsWith(match[1] + '-Receipt_') && name.endsWith('.pdf'));
    if (!name) throw new Error('PDF sample not generated');
    res.setHeader('Content-Type', 'application/pdf');
    res.end(await readFile(folder + '/' + name));
  } catch { res.statusCode = 404; res.end('Generate receipt API PDF samples first.'); }
}

export default defineConfig({
  root: here,
  plugins: [{ name: 'production-receipt-pdf-examples', configureServer(server) { server.middlewares.use(servePdf); }, configurePreviewServer(server) { server.middlewares.use(servePdf); } }, {
    name: 'fixture-direct-mui-icon-imports',
    enforce: 'pre',
    transform(code, id) {
      if (!/[\\/]src[\\/]/.test(id)) return undefined;
      // Resolve the exact same icons directly, avoiding the library barrel's
      // thousands of unrelated modules during isolated browser QA builds.
      const transformed = code.replace(/import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g, (statement, names: string) => {
        const imports = names.split(',').map((name) => name.trim()).filter(Boolean);
        const matches = imports.map((name) => /^(\w+)(?:\s+as\s+(\w+))?$/.exec(name));
        if (matches.some((match) => !match)) return statement;
        return matches.map((match) => `import ${match![2] ?? match![1]} from '@mui/icons-material/${match![1]}';`).join('\n');
      });
      return transformed === code ? undefined : { code: transformed, map: null };
    },
  }],
  cacheDir: `${repo}/node_modules/.vite/receipt-lifecycle`,
  publicDir: `${repo}/public`,
  resolve: { alias: [
    { find: /^src\/redux\/service$/, replacement: `${here}/mock-service.ts` },
    { find: /^src\/screens\/finance\/FeeStructureAssign\/Components\/StudentFeeStructureAssignmentForm$/, replacement: `${here}/../fee-collection-late-fees/assignment-placeholder.tsx` },
    { find: /^next\/navigation$/, replacement: `${here}/navigation.ts` },
    { find: 'src', replacement: `${repo}/src` },
  ] },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  // Export actions are outside this collection contract scenario. Keep their
  // lazy PDF/Excel bundles out of the first-load optimizer to reduce QA startup cost.
  optimizeDeps: { exclude: ['jspdf', 'jspdf-autotable', 'xlsx', 'html2canvas', 'dompurify'] },
  build: {
    rolldownOptions: {
      onLog(level, log, defaultHandler) {
        // This standalone client fixture has no server-component boundary.
        // MUI's client directives otherwise flood Windows terminal output.
        if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
        defaultHandler(level, log);
      },
    },
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 5187, strictPort: true, fs: { allow: [repo] } },
});
