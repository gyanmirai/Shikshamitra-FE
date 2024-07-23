import {
  hrPath,
  financePath,
  studentPath,
  securityPath,
  dashboardPath,
  assessmentPath,
} from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  student: icon('ic-student'),
  security: icon('ic-security'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Management',
    items: [
      { title: 'Dashboard', path: dashboardPath, icon: ICONS.dashboard, _action: 'dashboard' },
      {
        title: 'Student',
        path: '/student/profile',
        icon: ICONS.student,
        _action: 'student',
      },
      { title: 'Security', path: securityPath, icon: ICONS.security, _action: 'security' },
      { title: 'Finance', path: financePath, icon: ICONS.dashboard, _action: 'finance' },
      { title: 'Assessment', path: assessmentPath, icon: ICONS.dashboard, _action: 'assessment' },
      { title: 'HR', path: hrPath, icon: ICONS.dashboard, _action: 'hr' },
    ],
  },
  /**
   * Management
   */
  // {
  //   subheader: 'Management',
  //   items: [
  //     {
  //       title: 'Group',
  //       path: paths.dashboard.group.root,
  //       icon: ICONS.user,
  //       children: [
  //         { title: 'Four', path: paths.dashboard.group.root },
  //         { title: 'Five', path: paths.dashboard.group.five },
  //         { title: 'Six', path: paths.dashboard.group.six },
  //       ],
  //     },
  //   ],
  // },
];

const studentModule = {
  [studentPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Student Dashboard',
          _action: 'student-dashboard',
          path: '',
          children: [
            {
              title: 'Over View',
              _action: 'overView',
              path: '/student/overview',
            },
            {
              title: 'Student profile',
              _action: 'profile',
              path: '/student/profile',
              // items: [
              //   {
              //     title: 'View / Edit',
              //     _action: 'view-edit',
              //     path: '/student/view',
              //   },
              // ],
            },
            // { title: 'Records', path: studentListPath },
            // { title: 'Student/Dashboard', path: '/student/no-of-student' },
            // { title: 'Transport/Heat-Map', path: '/student/no-of-student' },
            // { title: 'Bulk-Update', path: '/student/no-of-student' },
            // { title: 'Reports', path: '/student/no-of-student' },
          ],
        },
      ],
    },
  ],
};

const securityModule = {
  [securityPath]: [
    {
      title: 'Security Dashboard',
      _action: 'security-dashboard',
      items: [
        { title: 'User', path: '/security/user' },
        { title: 'Role', path: '/security/role' },
        { title: 'Permission', path: '/security/permission' },
        { title: 'Group', path: '/security/group' },
        { title: 'User Role', path: '/security/user-role' },
        { title: 'User Permission', path: '/security/user-permission' },
        { title: 'User Group', path: '/security/user-group' },
      ],
    },
    {
      title: 'User Module Access',
      _action: 'user-module-access',
      items: [{ title: 'User', path: '/security/user' }],
    },
    {
      title: 'Permission Management',
      _action: 'permission-management',
      items: [{ title: 'User', path: '/security/user' }],
    },
    {
      title: 'Role Management',
      _action: 'role-management',
      items: [{ title: 'User', path: '/security/user' }],
    },
    {
      title: 'Employee/Student Login Management',
      _action: 'login-management',
      items: [{ title: 'User', path: '/security/user' }],
    },
  ],
};

export const navSubData = { ...studentModule, ...securityModule };
