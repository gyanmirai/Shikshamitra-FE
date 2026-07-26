import { it, expect, describe } from 'vitest';

import {
  getEmployeeOnboardingAssignable,
  isReservedEmployeeOnboardingRoleName,
  normalizeEmployeeOnboardingAssignable,
} from './employee-onboarding-role';

describe('employee onboarding role metadata', () => {
  it('defaults to false unless both employee audience and the explicit marker are present', () => {
    expect(getEmployeeOnboardingAssignable({ name: 'Teacher', roleAudience: 'Employee' })).toBe(
      false
    );
    expect(
      getEmployeeOnboardingAssignable({
        name: 'Teacher',
        employeeOnboardingAssignable: true,
      })
    ).toBe(false);
    expect(
      getEmployeeOnboardingAssignable({
        name: 'Teacher',
        roleAudience: 'Employee',
        employeeOnboardingAssignable: true,
      })
    ).toBe(true);
  });

  it('reads the marker from serialized extra properties', () => {
    expect(
      getEmployeeOnboardingAssignable({
        name: 'Payroll Specialist',
        extraProperties: {
          RoleAudience: 'Employee',
          EmployeeOnboardingAssignable: true,
        },
      })
    ).toBe(true);
  });

  it.each(['admin', ' Admin ', 'super-admin', 'SUPER-ADMIN'])(
    'forces reserved role %s to false',
    (roleName) => {
      expect(isReservedEmployeeOnboardingRoleName(roleName)).toBe(true);
      expect(
        normalizeEmployeeOnboardingAssignable({
          roleName,
          roleAudience: 'Employee',
          requested: true,
        })
      ).toBe(false);
      expect(
        getEmployeeOnboardingAssignable({
          name: roleName,
          roleAudience: 'Employee',
          employeeOnboardingAssignable: true,
        })
      ).toBe(false);
    }
  );

  it('normalizes non-employee roles to false', () => {
    expect(
      normalizeEmployeeOnboardingAssignable({
        roleName: 'Student',
        roleAudience: 'Student',
        requested: true,
      })
    ).toBe(false);
  });
});
