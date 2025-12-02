import { securityPath } from 'src/routes/paths';

const securityModule = {
  [securityPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/security/dashboard',
          _action: 'dashboard',
        },
        {
          title: 'Role And Permission',
          path: '',
          _action: 'role-and-permission',
          children: [
            {
              title: 'Role Management',
              path: '/security/role',
              _action: 'role',
              shortcutKey: 'Alt+R+1',
              shortcutKeyName: 'Alt+R+1',
            },
            {
              title: 'User Management',
              path: '/security/user',
              _action: 'user-management',
              shortcutKey: 'Alt+R+2',
              shortcutKeyName: 'Alt+R+2',
            },
            {
              title: 'Department',
              path: '/security/department',
              _action: 'department',
              shortcutKey: 'Alt+R+3',
              shortcutKeyName: 'Alt+R+3',
            },
          ],
        },
      ],
    },
  ],
};

export default securityModule;
