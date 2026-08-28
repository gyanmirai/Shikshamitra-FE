export type PermissionGrant = {
  name: string;
  isGranted: boolean;
};

export const getChangedPermissionGrants = (
  current: PermissionGrant[],
  initial: PermissionGrant[]
): PermissionGrant[] => {
  const initialByName = new Map(initial.map((permission) => [permission.name, permission.isGranted]));

  return current.filter(
    (permission) => initialByName.get(permission.name) !== permission.isGranted
  );
};

export const setPermissionGrants = (
  permissions: PermissionGrant[],
  permissionNames: string[],
  isGranted: boolean
): PermissionGrant[] => {
  const targetNames = new Set(permissionNames);

  return permissions.map((permission) =>
    targetNames.has(permission.name) ? { ...permission, isGranted } : permission
  );
};
