import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { it, expect, describe } from 'vitest';

import { hrPaths } from './hr-menus';

describe('HR policy route links', () => {
  it('uses concrete HR policy route constants instead of the legacy tab route', () => {
    expect(hrPaths.policies.payroll).toBe('/hr/payrollPolicies');
    expect(hrPaths.policies.attendance).toBe('/hr/attendance');

    const files = [
      'src/app/(auth-route)/hr/(Payroll-Management)/payroll/setting/layout.tsx',
      'src/app/(auth-route)/hr/(Attendance-Leave-Management)/attendance-setting/layout.tsx',
      'src/screens/hr/attendance-setting/index.tsx',
    ];

    files.forEach((file) => {
      expect(readFileSync(join(process.cwd(), file), 'utf8')).not.toContain('/hr/policies?tab=');
    });
  });
});
