import {
  hrPath,
  financePath,
  studentPath,
  settingPath,
  securityPath,
  dashboardPath,
  assessmentPath,
} from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
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
      { title: 'Security', path: '/security/role', icon: ICONS.security, _action: 'security' },
      { title: 'Finance', path: financePath, icon: ICONS.dashboard, _action: 'finance' },
      { title: 'Assessment', path: assessmentPath, icon: ICONS.dashboard, _action: 'assessment' },
      { title: 'HR', path: hrPath, icon: ICONS.dashboard, _action: 'hr' },
      // {
      //   title: 'Setting',
      //   path: hrPath,
      //   icon: ICONS.dashboard,
      //   _action: 'setting',
      //   style: {
      //     height: '100%',
      //     justifyContent: 'end',
      //   },
      // },
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

export const settingMenu = {
  title: 'Setting',
  path: '/setting/basic-information',
  icon: (
    <Iconify
      icon="ci:settings"
      sx={{ height: '18px !important', width: '18px !important' }}
      height={18}
      width={18}
    />
  ),
  _action: 'setting',
};

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
      suheader: '',
      items: [
        {
          title: 'Role And Permission',
          path: '',
          _action: 'role-and-permission',
          children: [
            {
              title: 'Role Management',
              path: '/security/role',
              _action: 'role',
            },
            {
              title: 'Role Assignment',
              path: '/security/permission',
              _action: 'permission',
            },
            {
              title: 'Access Control',
              path: '/security/access-control',
              _action: 'access-control',
            },
          ],
        },
      ],
    },
  ],
};

const settingModule = {
  [settingPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Basic Information',
          path: '/setting/basic-information',
          _action: 'basic-information',
        },
        {
          title: 'Academic Setup',
          path: '/setting/academic-setup',
          _action: 'academic-year-setup',
        },
        {
          title: 'Curriculum Setup',
          path: '/setting/curriculum-setup',
          _action: 'curriculum-setup',
        },
      ],
    },
  ],
};

export const navSubData = { ...studentModule, ...securityModule, ...settingModule };
