// Permission actions are server-defined. Keep the common actions explicit in
// callers, but allow newly introduced backend actions to render and persist
// without silently hiding them from the permission matrix.
export type PermissionType = string;
export const PERMISSIONS: PermissionType[] = ['View', 'Add', 'Delete'];

export const getPermissionChildren = (node: any): any[] =>
  node?.permissionChildren ?? node?.children ?? [];

// Collect the full navigation subtree independently of which rows are expanded.
export const getAllChildrenData = (node: any): any[] =>
  getPermissionChildren(node).flatMap((child) =>
    getPermissionChildren(child).length ? getAllChildrenData(child) : [child]
  );
