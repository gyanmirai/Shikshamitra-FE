export type GrantedPermission = {
  name: string;
  isGranted: boolean;
};

export type PermissionName = string | string[];

const FEE_ADJUSTMENT_PERMISSION = 'Finance.Fees.Adjustment';
const FEE_ADJUSTMENT_LEGACY_PREFIX = 'Finance.Adjustment';
const ADMISSIONS_PERMISSION_PREFIX = 'Students.Admissions';

// TODO(admissions): Remove this development-only bypass after Admissions permissions are assigned to dev roles.
const isDevelopmentAdmissionsPermission = (permissionName: string) =>
  process.env.NODE_ENV === 'development' &&
  (permissionName === ADMISSIONS_PERMISSION_PREFIX ||
    permissionName.startsWith(`${ADMISSIONS_PERMISSION_PREFIX}.`));

export const hasGrantedPermission = (
  permissions: GrantedPermission[] | undefined,
  permissionName?: PermissionName
): boolean => {
  if (!permissionName) return false;
  if (Array.isArray(permissionName)) {
    return permissionName.some((name) => hasGrantedPermission(permissions, name));
  }

  if (isDevelopmentAdmissionsPermission(permissionName)) {
    return true;
  }

  if (!permissions?.length) return false;

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
