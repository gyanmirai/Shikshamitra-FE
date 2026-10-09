import type { PermissionGrant } from './permission-grants';

export type PermissionNavigationNode = {
  title: string;
  permissionName?: string | string[];
  permissionChildren?: PermissionNavigationNode[];
  children?: PermissionNavigationNode[];
};

export interface PermissionNodeProps {
  node: PermissionNavigationNode;
  moduleTitle: string;
  submoduleTitle: string;
  permissions: PermissionGrant[];
  onToggle: (node: PermissionNavigationNode, action: string, currentValue: boolean) => void;
  onSelectAll: (node: PermissionNavigationNode, value: boolean, hasChildren: boolean) => void;
  depth?: number;
  disabled?: boolean;
  inherited?: Map<string, string[]>;
  manageableNames?: Set<string>;
  setPermission: (data: PermissionGrant[]) => void;
}
