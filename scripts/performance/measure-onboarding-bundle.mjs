// Build each checkout with `npm run build`, then run this script with its root path.
// Measures unique JS chunks required by the onboarding list's client-module manifest.
// Includes shared dependencies, assumes a cold cache, and excludes layout/root assets,
// HTML, CSS, prefetch, network time and runtime execution. Gzip is computed per chunk.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root = path.resolve(process.argv[2] || '.');
const build = path.resolve(root, process.env.NEXT_DIST_DIR || 'build');
const route =
  'server/app/(auth-route)/hr/(Employee)/employee/onboarding/page_client-reference-manifest.js';
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(build, route), 'utf8'), context);
const manifest = Object.values(context.__RSC_MANIFEST)[0];
const entry = Object.entries(manifest.clientModules).find(([key]) =>
  /employee-onboarding[\\/]index\.tsx$/.test(key)
);
if (!entry) throw new Error('Build manifest has no onboarding list entry.');
const [name, item] = entry;
const files = [...new Set(item.chunks.filter((file) => file.endsWith('.js')))];
const chunks = files.map((file) => {
  const data = fs.readFileSync(path.join(build, decodeURIComponent(file)));
  return {
    file,
    bytes: data.length,
    gzipBytes: zlib.gzipSync(data).length,
    containsFinalizeWizard: data.includes(
      Buffer.from('Salary management and statutory enrollment permissions')
    ),
  };
});
console.log(
  JSON.stringify(
    {
      root,
      name,
      chunkCount: chunks.length,
      bytes: chunks.reduce((total, chunk) => total + chunk.bytes, 0),
      gzipBytes: chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
      chunks,
    },
    null,
    2
  )
);
