import { it, expect, describe } from 'vitest';

import {
  salaryEditorHref,
  salaryStructureHref,
  resolveSalaryReturnHref,
} from './salary-editor-navigation';
import {
  staffPayrollEditHref,
  staffSalaryEditorHref,
  staffPayrollProfileHref,
} from '../../employee/payroll-profile-utils';

const origin = 'https://school.example';

describe('salary editor navigation', () => {
  it('encodes employee IDs and the complete return URL', () => {
    const returnTo = '/hr/employee?search=HR+Manager&page=2#staff';
    const destination = new URL(salaryEditorHref('employee/1', returnTo), origin);
    expect(destination.pathname).toBe('/hr/payroll/structure/employee%2F1/edit');
    expect(destination.searchParams.get('returnTo')).toBe(returnTo);
  });

  it.each([
    '/hr/employee?mode=form&editEmployee=staff&step=payroll',
    '/hr/payroll/structure?employeeId=staff&month=2026-10#salary',
  ])('preserves allowed return destinations: %s', (returnTo) => {
    expect(resolveSalaryReturnHref('staff', returnTo, origin)).toBe(returnTo);
    expect(resolveSalaryReturnHref('staff', `${origin}${returnTo}`, origin)).toBe(returnTo);
  });

  it.each([
    null,
    '',
    'https://attacker.example/hr/employee',
    '//attacker.example/hr/employee',
    // eslint-disable-next-line no-script-url -- Untrusted return URL must be rejected.
    'javascript:alert(1)',
    'https://user:password@school.example/hr/employee',
    '/hr/payroll/run-payroll',
    '/hr/employee/other',
    '/hr/payroll/structure/staff/edit',
    'https://school.example.attacker.example/hr/employee',
    'http://[invalid',
  ])('rejects unsafe or unrelated return destinations: %s', (returnTo) => {
    expect(resolveSalaryReturnHref('staff', returnTo, origin)).toBe(salaryStructureHref('staff'));
  });

  it('normalizes trailing slashes and prevents legacy setup redirect loops', () => {
    expect(
      resolveSalaryReturnHref(
        'staff',
        '/hr/payroll/structure/?employeeId=staff&setup=salary&from=staff-edit',
        origin
      )
    ).toBe('/hr/payroll/structure?employeeId=staff&from=staff-edit');
  });

  it('routes profile and staff-edit entry links directly to the page with their return context', () => {
    expect(new URL(staffSalaryEditorHref('staff'), origin).searchParams.get('returnTo')).toBe(
      staffPayrollProfileHref('staff')
    );
    expect(
      new URL(staffSalaryEditorHref('staff', 'staff-edit'), origin).searchParams.get('returnTo')
    ).toBe(staffPayrollEditHref('staff'));
  });
});
