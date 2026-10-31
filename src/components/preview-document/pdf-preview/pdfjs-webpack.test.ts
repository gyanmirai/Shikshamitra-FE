// @vitest-environment node
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { it, expect } from 'vitest';

it('initializes the PDF library and worker in Next development Webpack eval modules', async () => {
  const require = createRequire(import.meta.url);
  const { webpack } = require('next/dist/compiled/webpack/webpack');
  const output = await mkdtemp(path.join(os.tmpdir(), 'shikshamitra-pdf-webpack-'));
  try {
    const compiler = webpack({
      mode: 'development',
      devtool: 'eval-source-map',
      target: 'node',
      entry: {
        library: path.resolve('src/components/preview-document/pdf-preview/pdfjs.ts'),
        worker: require.resolve('pdfjs-dist/build/pdf.worker.min.mjs'),
      },
      output: { path: output, filename: '[name].cjs', library: { type: 'commonjs2' } },
    });
    await new Promise<void>((resolve, reject) => {
      compiler.run((error: Error | null, stats: any) => {
        compiler.close(() => {
          if (error || stats?.hasErrors()) reject(error ?? new Error(stats.toString()));
          else resolve();
        });
      });
    });
    for (const [name, exported] of [
      ['library', 'getDocument'],
      ['worker', 'WorkerMessageHandler'],
    ]) {
      const module = { exports: {} as Record<string, unknown> };
      const script = await readFile(path.join(output, `${name}.cjs`), 'utf8');
      expect(() =>
        vm.runInNewContext(script, {
          module,
          exports: module.exports,
          require,
          process,
          console,
          __dirname: output,
          __filename: path.join(output, `${name}.cjs`),
          DOMMatrix: class {},
          URL,
        })
      ).not.toThrow();
      expect(module.exports[exported]).toBeTypeOf('function');
    }
  } finally {
    if (
      path.dirname(output) !== path.resolve(os.tmpdir()) ||
      !path.basename(output).startsWith('shikshamitra-pdf-webpack-')
    )
      throw new Error('Unexpected PDF test output directory.');
    await rm(output, { recursive: true, force: true });
  }
}, 120000);
