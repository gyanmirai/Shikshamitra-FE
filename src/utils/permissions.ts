export type GrantedPermission = {
  name: string;
  isGranted: boolean;
};

export const hasGrantedPermission = (
  permissions: GrantedPermission[] | undefined,
  permissionName?: string
) => {
  if (!permissionName || !permissions?.length) return false;

  return permissions.some(
    (permission) =>
      permission.isGranted &&
      (permission.name === permissionName || permission.name === `${permissionName}.View`)
  );
};
