export type GrantedPermission = {
  name: string;
  isGranted: boolean;
};

export type PermissionName = string | string[];

// Action checks are exact in every environment. No aliases, role shortcuts, or implied grants.
export const hasGrantedPermission = (
  permissions: GrantedPermission[] | undefined,
  permissionName?: PermissionName
): boolean => {
  if (!permissionName) return false;
  if (Array.isArray(permissionName)) {
    return permissionName.some((name) => hasGrantedPermission(permissions, name));
  }
  return permissions?.some((permission) => permission.isGranted && permission.name === permissionName) ?? false;
};

// Existing route metadata may name a catalogue parent rather than its View child.
// This navigation-only convention must never be used to authorize a mutation.
export const hasNavigationPermission = (
  permissions: GrantedPermission[] | undefined,
  permissionName?: PermissionName
): boolean => {
  if (!permissionName) return false;
  if (Array.isArray(permissionName)) return permissionName.some((name) => hasNavigationPermission(permissions, name));
  return hasGrantedPermission(permissions, permissionName) ||
    hasGrantedPermission(permissions, `${permissionName}.View`);
};
