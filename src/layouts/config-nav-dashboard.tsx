import {
  hrPath,
  financePath,
  studentPath,
  securityPath,
  dashboardPath,
  assessmentPath,
  studentListPath,
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
        path: '/student/dashboard',
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
      title: 'Student Dashboard',
      _action: 'student-dashboard',
      items: [
        {
          title: 'dashboard',
          _action: 'dashboard',
          path: '/student/dashboard',
        },
        { title: 'Add/EnrollMent', path: studentListPath },
        { title: 'Student/Dashboard', path: '/student/no-of-student' },
        { title: 'Transport/Heat-Map', path: '/student/no-of-student' },
        { title: 'Bulk-Update', path: '/student/no-of-student' },
        { title: 'Reports', path: '/student/no-of-student' },
      ],
    },
    {
      title: 'Student Profile',
      _action: 'student-Profile',
      items: [
        { title: 'Add', _action: 'add', path: '/student/add' },
        { title: 'View / Edit', path: '/student/view-edit' },
      ],
    },

    {
      title: 'Announcement',
      _action: 'announcement',

      items: [
        { title: 'SMS Notification', path: '/student/certificate' },
        { title: 'Email', path: '/student/certificate' },
        { title: 'Voice Notes', path: '/student/certificate' },
        { title: 'Reports', path: '/student/change-class' },
      ],
    },
    {
      title: 'Performance',
      _action: 'performance',
      items: [
        { title: 'Academic View', path: '/student/hello' },
        { title: 'Other Activity', path: '/student/hello' },
        { title: 'General Overview / Relationship', path: '/student/hello' },
        { title: 'Reports', path: '/student/hello' },
      ],
    },
    {
      title: 'Certificates',
      _action: 'certificates',
      items: [{ title: '', path: '/student/hello' }],
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
