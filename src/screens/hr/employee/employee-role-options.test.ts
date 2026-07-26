import { it, expect, describe } from 'vitest';

import {
  isEmployeeAssignableRole,
  getEmployeeAssignableRoles,
  shouldClearEmployeeRoleSelection,
  isRoleCompatibleWithEmployeeGroup,
} from './employee-role-options';

const employeeRole = <T extends Record<string, unknown>>(role: T) => ({
  roleAudience: 'Employee',
  employeeOnboardingAssignable: true,
  ...role,
});

describe('employee role options', () => {
  it.each(['Admin', 'super-admin', 'Student', ' Parent '])(
    'excludes the reserved %s role even when its marker is enabled',
    (name) => {
      expect(isEmployeeAssignableRole(employeeRole({ name }))).toBe(false);
    }
  );

  it('keeps explicitly assignable employee roles and preserves their original objects', () => {
    const teacher = employeeRole({ id: 'teacher-role', name: 'Teacher' });
    const clerk = employeeRole({ id: 'clerk-role', name: 'Clerk' });
    const roles = getEmployeeAssignableRoles([
      teacher,
      employeeRole({ id: 'student-role', name: 'Student' }),
      employeeRole({ id: 'parent-role', name: 'Parent' }),
      clerk,
    ]);

    expect(roles).toEqual([teacher, clerk]);
  });

  it('fails closed when audience or onboarding metadata is absent or false', () => {
    expect(
      isEmployeeAssignableRole({
        name: 'Legacy Custom Role',
        roleAudience: 'Employee',
      })
    ).toBe(false);
    expect(
      isEmployeeAssignableRole({
        name: 'Unscoped Role',
        employeeOnboardingAssignable: true,
      })
    ).toBe(false);
    expect(
      isEmployeeAssignableRole({
        name: 'Disabled Role',
        roleAudience: 'Employee',
        employeeOnboardingAssignable: false,
      })
    ).toBe(false);
  });

  it('reads explicit audience and onboarding markers from extra properties', () => {
    expect(
      isEmployeeAssignableRole({
        name: 'Learner Support',
        extraProperties: {
          roleAudience: 'Student',
          employeeOnboardingAssignable: true,
        },
      })
    ).toBe(false);
    expect(
      isEmployeeAssignableRole({
        name: 'Payroll Specialist',
        extraProperties: {
          RoleAudience: 'Employee',
          EmployeeOnboardingAssignable: true,
        },
      })
    ).toBe(true);
  });

  it('filters teaching and non-teaching roles by explicit group metadata', () => {
    const teachingRole = employeeRole({
      id: 'teaching-role',
      name: 'Learning Facilitator',
      extraProperties: { employeeGroupAudience: 'Teaching' },
    });
    const nonTeachingRole = employeeRole({
      id: 'non-teaching-role',
      name: 'Operations Specialist',
      extraProperties: { employeeGroupAudience: 'NonTeaching' },
    });
    const sharedRole = employeeRole({
      id: 'shared-role',
      name: 'Shared Staff Role',
      extraProperties: { employeeGroupAudience: 'Both' },
    });

    expect(getEmployeeAssignableRoles([teachingRole, nonTeachingRole, sharedRole], 0)).toEqual([
      teachingRole,
      sharedRole,
    ]);
    expect(getEmployeeAssignableRoles([teachingRole, nonTeachingRole, sharedRole], 1)).toEqual([
      nonTeachingRole,
      sharedRole,
    ]);
  });

  it('treats missing group metadata as compatible with both employee groups', () => {
    const role = employeeRole({ id: 'shared-role', name: 'Shared Custom Role' });

    expect(isRoleCompatibleWithEmployeeGroup(role, 0)).toBe(true);
    expect(isRoleCompatibleWithEmployeeGroup(role, 1)).toBe(true);
  });

  it('clears a selected role when it becomes incompatible or unassignable', () => {
    const teachingRole = employeeRole({
      id: 'teacher-role',
      name: 'Teacher',
      employeeGroupAudience: 'Teaching',
    });
    const unmarkedRole = {
      id: 'legacy-role',
      name: 'Legacy Role',
      roleAudience: 'Employee',
    };
    const roles = [teachingRole, unmarkedRole];

    expect(shouldClearEmployeeRoleSelection(roles, 'teacher-role', 1)).toBe(true);
    expect(shouldClearEmployeeRoleSelection(roles, 'teacher-role', 0)).toBe(false);
    expect(shouldClearEmployeeRoleSelection(roles, 'legacy-role', 0)).toBe(true);
    expect(shouldClearEmployeeRoleSelection(roles, null, 1)).toBe(false);
  });
});
