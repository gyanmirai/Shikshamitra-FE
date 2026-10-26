import { it, expect } from 'vitest';
import { getNodeActionPermissionNames } from 'src/screens/security/role/account-settings-permissions';

import hrModule, { hrPaths, hrPermissions } from './hr-menus';

it('exposes Payslip & statement settings in Settings while keeping existing payslip grants in their original editor group', () => {
  const payroll = Object.values(hrModule())[0][0].items.find(
    (item) => item.title === 'Payroll Management'
  )!;
  const settings = payroll.children!.find((item) => item.title === 'Settings')!;
  const payslips = payroll.children!.find((item) => item.title === 'Payslips')!;
  if (!('children' in settings)) {
    throw new Error('Expected payroll settings navigation children');
  }
  const documents = settings.children!.find((item) => item.title === 'Payslip & statement settings')!;
  const catalogue = ['View', 'Add'].map((action) => ({
    name: `${hrPermissions.payroll.generateSalarySlip}.${action}`,
    isGranted: true,
  }));
  expect(documents.path).toBe(hrPaths.payroll.settings.payrollDocuments);
  expect(documents.permissionName).toBe(`${hrPermissions.payroll.generateSalarySlip}.View`);
  expect(getNodeActionPermissionNames(payslips, catalogue)).toEqual(
    catalogue.map(({ name }) => name)
  );
  expect(getNodeActionPermissionNames(settings, catalogue)).toEqual([]);
});
