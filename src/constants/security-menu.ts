import { securityPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultSecurityPermissionName = 'Security.';

export const securityPaths = {
  dashboard: '/security/dashboard',
  roleAndPermission: {
    root: '',
    role: '/security/role',
    user: '/security/user',
    department: '/security/department',
  },
};

export const securityPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultSecurityPermissionName}Dashboard`,
  roleAndPermission: {
    root: `${defaultModulePermissionName}${defaultSecurityPermissionName}RoleAndPermission`,
    role: `${defaultSecurityPermissionName}RoleAndPermission.Role`,
    userManagement: `${defaultSecurityPermissionName}RoleAndPermission.UserManagement`,
    department: `${defaultSecurityPermissionName}RoleAndPermission.Department`,
  },
};

const securityModule = {
  [securityPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: securityPaths.dashboard,
          _action: 'dashboard',
          permissionName: securityPermissions.dashboard,
        },
        {
          title: 'Role And Permission',
          path: securityPaths.roleAndPermission.root,
          _action: 'role-and-permission',
          permissionName: securityPermissions.roleAndPermission.root,
          children: [
            {
              title: 'Role Management',
              path: securityPaths.roleAndPermission.role,
              _action: 'role',
              shortcutKey: 'Alt+R+1',
              shortcutKeyName: 'Alt+R+1',
              permissionName: securityPermissions.roleAndPermission.role,
            },
            {
              title: 'User Management',
              path: securityPaths.roleAndPermission.user,
              _action: 'user-management',
              shortcutKey: 'Alt+R+2',
              shortcutKeyName: 'Alt+R+2',
              permissionName: securityPermissions.roleAndPermission.userManagement,
            },
            {
              title: 'Department',
              path: securityPaths.roleAndPermission.department,
              _action: 'department',
              shortcutKey: 'Alt+R+3',
              shortcutKeyName: 'Alt+R+3',
              permissionName: securityPermissions.roleAndPermission.department,
            },
          ],
        },
      ],
    },
  ],
};

export default securityModule;
