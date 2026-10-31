import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
const mocks = path.join(root, 'mock-hooks.ts').replaceAll('\\', '/');
const mockedImports = [
  'next/navigation',
  'src/routes/hooks',
  './use-salary-editor-prefetch',
  'src/redux/PF/PFApi',
  'src/redux/hr/esi-policy-api',
  'src/redux/hr/salary-template-api',
  'src/redux/hr/compensation-revision-api',
  'src/redux/hr/statutory-profile-api',
  'src/redux/hr/employeeApi',
];
export default defineConfig({
  root,
  resolve: { alias: { src: path.join(repo, 'src') } },
  define: { 'process.env': '{}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 3956, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'salary-setup-synthetic-hooks',
      enforce: 'pre',
      transform(code, id) {
        if (
          ![
            '/SalaryStructureBuilder.tsx',
            '/salary-editor-screen.tsx',
            '/statutory-profile-editor.tsx',
            '/esi-policy-fields.tsx',
            '/salary-template-editor.tsx',
            '/salary-template-configure.tsx',
            '/salary-template-component-picker.tsx',
          ].some((file) => id.endsWith(file))
        )
          return;
        let result = code;
        for (const module of mockedImports) result = result.replaceAll(`'${module}'`, `'${mocks}'`);
        return result;
      },
    },
  ],
});
