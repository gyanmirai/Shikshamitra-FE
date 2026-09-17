export type PermissionType = 'View' | 'Add' | 'Edit' | 'ChangeStatus' | 'Delete';
export const PERMISSIONS: PermissionType[] = ['View', 'Add', 'Delete'];

export const getPermissionChildren = (node: any): any[] =>
  node?.permissionChildren ?? node?.children ?? [];

// Collect the full navigation subtree independently of which rows are expanded.
export const getAllChildrenData = (node: any): any[] =>
  getPermissionChildren(node).flatMap((child) =>
    getPermissionChildren(child).length ? getAllChildrenData(child) : [child]
  );
