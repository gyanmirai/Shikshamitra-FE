export type EmployeeOnboardingRoleMetadata = {
  name?: string | null;
  roleAudience?: string | null;
  RoleAudience?: string | null;
  employeeOnboardingAssignable?: boolean | null;
  EmployeeOnboardingAssignable?: boolean | null;
  extraProperties?: {
    roleAudience?: string | null;
    RoleAudience?: string | null;
    employeeOnboardingAssignable?: boolean | null;
    EmployeeOnboardingAssignable?: boolean | null;
    [key: string]: unknown;
  };
};

const RESERVED_EMPLOYEE_ONBOARDING_ROLE_NAMES = new Set(['admin', 'super-admin']);

export const isReservedEmployeeOnboardingRoleName = (roleName?: string | null) =>
  RESERVED_EMPLOYEE_ONBOARDING_ROLE_NAMES.has(roleName?.trim().toLowerCase() ?? '');

export const getEmployeeOnboardingAssignable = (
  role?: EmployeeOnboardingRoleMetadata | null
): boolean => {
  if (!role || isReservedEmployeeOnboardingRoleName(role.name)) {
    return false;
  }

  const roleAudience =
    role.roleAudience ??
    role.RoleAudience ??
    role.extraProperties?.roleAudience ??
    role.extraProperties?.RoleAudience ??
    null;
  const marker =
    role.employeeOnboardingAssignable ??
    role.EmployeeOnboardingAssignable ??
    role.extraProperties?.employeeOnboardingAssignable ??
    role.extraProperties?.EmployeeOnboardingAssignable ??
    null;

  return roleAudience?.trim().toLowerCase() === 'employee' && marker === true;
};

export const normalizeEmployeeOnboardingAssignable = ({
  roleName,
  roleAudience,
  requested,
}: {
  roleName?: string | null;
  roleAudience?: string | null;
  requested?: boolean | null;
}) =>
  !isReservedEmployeeOnboardingRoleName(roleName) &&
  roleAudience?.trim().toLowerCase() === 'employee' &&
  requested === true;
