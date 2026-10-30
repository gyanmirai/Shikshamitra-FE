import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/tmp/account-settings-qa-vite`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${here}/mock-navigation.tsx` },
      { find: /^@mui\/icons-material$/, replacement: `${here}/icon-barrel.ts` },
      { find: /^src\/routes\/(components|hooks)$/, replacement: `${here}/mock-navigation.tsx` },
      { find: /^src\/redux\/customQueryAndMutation$/, replacement: `${here}/mock-query.ts` },
      {
        find: /^src\/redux\/finance\/(incomeCategory|expenseCategory|BankAccountManage\/bankAccountApi)$/,
        replacement: `${here}/mock-api.ts`,
      },
      {
        find: /^src\/hooks\/useAccountSettingPermissions$/,
        replacement: `${here}/mock-permissions.ts`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  build: { outDir: `${repo}/tmp/account-settings-qa-dist`, copyPublicDir: false, minify: false },
  optimizeDeps: {
    noDiscovery: false,
    entries: ['main.tsx'],
    include: [
      'react', 'react-is',
      'react-dom/client',
      '@mui/material',
      '@mui/material/styles',
      '@mui/lab',
      '@emotion/react',
      '@emotion/styled',
      '@reduxjs/toolkit',
      'react-redux',
      'formik',
      'lodash',
      'dayjs',
      'sonner',
      'simplebar-react',
      '@iconify/react',
      '@react-pdf/renderer',
      'jspdf',
      'jspdf-autotable',
      'xlsx',
      'framer-motion',
    ],
  },
  server: { host: '127.0.0.1', port: 4186, strictPort: true, fs: { allow: [repo] } },
});
