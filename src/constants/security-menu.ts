import { securityPath } from 'src/routes/paths';

import menuIconView from './icon-view';
import { defaultModulePermissionName } from './student-menu';

const defaultSecurityPermissionName = 'Security.';

const securityModuleName = 'AbpIdentity.';

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
  root: `${defaultModulePermissionName}Security`,
  dashboard: `${defaultModulePermissionName}${defaultSecurityPermissionName}Dashboard`,
  roleAndPermission: {
    root: `${securityModuleName}RolesAndPermissions`,
    role: `${securityModuleName}Roles`,
    userManagement: `${securityModuleName}Users`,
    // department: `${defaultSecurityPermissionName}RoleAndPermission.Department`,
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
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
        {
          title: 'Role And Permission',
          path: securityPaths.roleAndPermission.root,
          _action: 'role-and-permission',
          permissionName: securityPermissions.roleAndPermission.root,
          icon: menuIconView('mdi:shield-account-outline'),
          children: [
            {
              title: 'Role Management',
              path: securityPaths.roleAndPermission.role,
              _action: 'role',
              shortcutKey: 'Alt+R+1',
              shortcutKeyName: 'Alt+R+1',
              permissionName: securityPermissions.roleAndPermission.role,
              icon: menuIconView('mdi:account-key-outline'),
            },
            {
              title: 'User Management',
              path: securityPaths.roleAndPermission.user,
              _action: 'user-management',
              shortcutKey: 'Alt+R+2',
              shortcutKeyName: 'Alt+R+2',
              permissionName: securityPermissions.roleAndPermission.userManagement,
              icon: menuIconView('mdi:account-cog-outline'),
            },
            // {
            //   title: 'Department',
            //   path: securityPaths.roleAndPermission.department,
            //   _action: 'department',
            //   shortcutKey: 'Alt+R+3',
            //   shortcutKeyName: 'Alt+R+3',
            //   permissionName: securityPermissions.roleAndPermission.department,
            //   icon: menuIconView('mdi:domain'),
            // },
          ],
        },
      ],
    },
  ],
};

export default securityModule;
