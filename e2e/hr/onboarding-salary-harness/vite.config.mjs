import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
const mocks = path.join(root, 'mock-hooks.ts').replaceAll('\\', '/');
const mockedImports = [
  'src/routes/hooks',
  'src/redux/role/roleApi',
  'src/redux/shiftManagement/shift-management-api',
  'src/screens/hr/hooks/useAcademicOrganizationOptions',
  'src/redux/hr/employeeOnboardingApi',
  'src/redux/PF/PFApi',
  'src/redux/hr/esi-policy-api',
  'src/redux/hr/salary-template-api',
  'src/redux/hr/compensation-revision-api',
];
export default defineConfig({
  root,
  resolve: { alias: { src: path.join(repo, 'src') } },
  define: { 'process.env': '{}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 3955, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-onboarding-hooks',
      enforce: 'pre',
      transform(code, id) {
        if (
          !id.includes('/src/screens/hr/employee-onboarding/') &&
          !id.endsWith('/src/screens/hr/payroll/structure/SalaryStructureBuilder.tsx') &&
          !id.endsWith('/src/screens/hr/payroll/setting/esi-policy-fields.tsx')
        )
          return;
        let result = code;
        for (const module of mockedImports) result = result.replaceAll(`'${module}'`, `'${mocks}'`);
        return result;
      },
    },
  ],
});
