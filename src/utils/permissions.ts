export type GrantedPermission = {
  name: string;
  isGranted: boolean;
};

export type PermissionName = string | string[];

const FEE_ADJUSTMENT_PERMISSION = 'Finance.Fees.Adjustment';
const FEE_ADJUSTMENT_LEGACY_PREFIX = 'Finance.Adjustment';

// TODO: Remove this development-only bypass after Admissions permissions are seeded for dev roles.
const isDevelopmentAdmissionsPermission = (permissionName: string) =>
  process.env.NODE_ENV === 'development' && permissionName.startsWith('Students.Admission');

export const hasGrantedPermission = (
  permissions: GrantedPermission[] | undefined,
  permissionName?: PermissionName
): boolean => {
  if (!permissionName || !permissions?.length) return false;
  if (Array.isArray(permissionName)) {
    return permissionName.some((name) => hasGrantedPermission(permissions, name));
  }

  if (isDevelopmentAdmissionsPermission(permissionName)) {
    return true;
  }

  const matches = (name: string) =>
    permissions.some(
      (permission) =>
        permission.isGranted && (permission.name === name || permission.name === `${name}.View`)
    );

  if (matches(permissionName)) {
    return true;
  }

  // Roles seeded before the Fees.Adjustment namespace fix may still hold Finance.Adjustment.* grants.
  if (
    permissionName === FEE_ADJUSTMENT_PERMISSION ||
    permissionName.startsWith(`${FEE_ADJUSTMENT_PERMISSION}.`)
  ) {
    return permissions.some(
      (permission) =>
        permission.isGranted &&
        (permission.name === FEE_ADJUSTMENT_LEGACY_PREFIX ||
          permission.name.startsWith(`${FEE_ADJUSTMENT_LEGACY_PREFIX}.`))
    );
  }

  return false;
};
