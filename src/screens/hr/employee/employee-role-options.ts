export type EmployeeRoleOption = {
  id?: string;
  name?: string | null;
  roleAudience?: string | null;
  RoleAudience?: string | null;
  employeeGroupAudience?: string | null;
  employeeOnboardingAssignable?: boolean | null;
  EmployeeOnboardingAssignable?: boolean | null;
  extraProperties?: {
    roleAudience?: string | null;
    RoleAudience?: string | null;
    employeeGroupAudience?: string | null;
    EmployeeGroupAudience?: string | null;
    employeeOnboardingAssignable?: boolean | null;
    EmployeeOnboardingAssignable?: boolean | null;
    [key: string]: unknown;
  };
};

export type EmployeeGroupSelection = 0 | 1 | null | undefined | '';

const RESERVED_NON_EMPLOYEE_ROLE_NAMES = new Set(['admin', 'super-admin', 'student', 'parent']);
const EMPLOYEE_GROUP_AUDIENCE = {
  teaching: 'teaching',
  nonTeaching: 'nonteaching',
  both: 'both',
} as const;

const getEmployeeGroupAudience = (role: EmployeeRoleOption): string | null =>
  role.employeeGroupAudience ??
  role.extraProperties?.employeeGroupAudience ??
  role.extraProperties?.EmployeeGroupAudience ??
  null;

export const isEmployeeAssignableRole = (role: EmployeeRoleOption): boolean => {
  const normalizedName = role.name?.trim().toLowerCase();
  if (!normalizedName || RESERVED_NON_EMPLOYEE_ROLE_NAMES.has(normalizedName)) {
    return false;
  }

  const audience =
    role.roleAudience ??
    role.RoleAudience ??
    role.extraProperties?.roleAudience ??
    role.extraProperties?.RoleAudience ??
    null;
  const onboardingAssignable =
    role.employeeOnboardingAssignable ??
    role.EmployeeOnboardingAssignable ??
    role.extraProperties?.employeeOnboardingAssignable ??
    role.extraProperties?.EmployeeOnboardingAssignable ??
    null;

  return audience?.trim().toLowerCase() === 'employee' && onboardingAssignable === true;
};

export const isRoleCompatibleWithEmployeeGroup = (
  role: EmployeeRoleOption,
  employeeGroup: EmployeeGroupSelection
): boolean => {
  if (employeeGroup !== 0 && employeeGroup !== 1) {
    return true;
  }

  const audience = getEmployeeGroupAudience(role)?.trim().toLowerCase();
  if (!audience || audience === EMPLOYEE_GROUP_AUDIENCE.both) {
    return true;
  }

  if (employeeGroup === 0) {
    return audience === EMPLOYEE_GROUP_AUDIENCE.teaching;
  }

  return audience === EMPLOYEE_GROUP_AUDIENCE.nonTeaching;
};

export const getEmployeeAssignableRoles = <TRole extends EmployeeRoleOption>(
  roles: readonly TRole[],
  employeeGroup?: EmployeeGroupSelection
): TRole[] =>
  roles.filter(
    (role) =>
      isEmployeeAssignableRole(role) && isRoleCompatibleWithEmployeeGroup(role, employeeGroup)
  );

export const shouldClearEmployeeRoleSelection = (
  roles: readonly EmployeeRoleOption[],
  selectedRoleId: string | null | undefined,
  employeeGroup: EmployeeGroupSelection
): boolean => {
  if (!selectedRoleId) {
    return false;
  }

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  return Boolean(
    selectedRole &&
    (!isEmployeeAssignableRole(selectedRole) ||
      !isRoleCompatibleWithEmployeeGroup(selectedRole, employeeGroup))
  );
};
