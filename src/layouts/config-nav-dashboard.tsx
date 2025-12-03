import { CONFIG } from 'src/config-global';
import hrModule from 'src/constants/hr-menus';
import { SvgColor } from 'src/components/svg-color';
import hostelModule from 'src/constants/hostel-menus';
import studentModule from 'src/constants/student-menu';
import financeModule from 'src/constants/finance-menu';
import libraryModule from 'src/constants/library-menus';
import academicModule from 'src/constants/academic-menu';
import securityModule from 'src/constants/security-menu';
import calendarModule from 'src/constants/calendar-menu';
import transportModule from 'src/constants/transport-menu';
import resourceManagement from 'src/constants/resource-menu';
import instituteSetupModule from 'src/constants/institute-setup';
import classManagementModule from 'src/constants/class-management';
import communicationModule from 'src/constants/comminication-menu';
import securityGuardModule from 'src/constants/security-gaurd-menu';
import {
  hrPath,
  classPath,
  hostelPath,
  financePath,
  studentPath,
  libraryPath,
  securityPath,
  academicPath,
  calendarPath,
  transportPath,
  communicationPath,
  securityGuardPath,
  resourceManagementPath,
} from 'src/routes/paths';

// ----------------------------------------------------------------------

export const icon = (name: string) => (
  <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
);

export const ICONS = {
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
  securityGuard: icon('ic-security-guard'),
  hr: icon('ic-hr'),
  finance: icon('ic-finance'),
  communication: icon('ic-communication'),
  library: icon('ic-library'),
  transport: icon('ic-transport'),
  hostel: icon('ic-hostel'),
  academic: icon('ic-academic'),
  examination: icon('ic-examination'),
  school: icon('ic-school'),
  resource: icon('ic-hostel'),
  class: icon('ic-class'),
};

// ----------------------------------------------------------------------

export const settingMenu = {
  title: 'Institute Setup',
  path: '/setting/basic-information',
  icon: ICONS.school,
  _action: 'setting',
};

export const navData = (isDdvs: boolean) => [
  {
    subheader: 'Management',
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: ICONS.dashboard,
        _action: 'dashboard',
        shortcutKey: 'Alt+D',
        shortcutKeyName: 'Alt+D',
      },
      {
        title: 'Student',
        path: '/student/dashboard/',
        icon: ICONS.student,
        _action: 'student',
        shortcutKey: 'Alt+S',
        shortcutKeyName: 'Alt+S',
        submodule: studentModule(isDdvs)[studentPath].flatMap((list) => list.items),
      },
      {
        title: 'Academics',
        path: '/academic/dashboard',
        icon: ICONS.academic,
        _action: 'academic',
        shortcutKey: 'Alt+A',
        shortcutKeyName: 'Alt+A',
        submodule: academicModule(isDdvs)[academicPath].flatMap((list) => list.items),
      },
      {
        title: 'Class Management',
        path: '/classManagement/dashboard',
        icon: ICONS.class,
        _action: 'classManagement',
        shortcutKey: 'Alt+A',
        shortcutKeyName: 'Alt+A',
        submodule: classManagementModule[classPath].flatMap((list) => list.items),
      },
      {
        title: 'HR/Staff',
        path: '/hr/dashboard',
        icon: ICONS.hr,
        _action: 'hr',
        shortcutKey: 'Alt+H',
        shortcutKeyName: 'Alt+H',
        submodule: hrModule(isDdvs)[hrPath].flatMap((list) => list.items),
      },
      {
        title: 'Finance',
        path: '/finance/dashboard',
        icon: ICONS.finance,
        _action: 'finance',
        shortcutKey: 'Alt+F',
        shortcutKeyName: 'Alt+F',
        submodule: financeModule[financePath].flatMap((list) => list.items),
      },
      {
        title: 'Communication',
        path: '/communication/dashboard',
        icon: ICONS.communication,
        _action: 'communication',
        shortcutKey: 'Alt+C',
        shortcutKeyName: 'Alt+C',
        submodule: communicationModule[communicationPath].flatMap((list) => list.items),
        disabled: !isDdvs,
      },
      {
        title: 'Calendar',
        path: '/calendar/view',
        icon: ICONS.calendar,
        _action: 'calendar',
        shortcutKey: 'Alt+K',
        shortcutKeyName: 'Alt+K',
        submodule: calendarModule[calendarPath].flatMap((list) => list.items),
        disabled: !isDdvs,
      },
      {
        title: 'Library',
        path: '/library/dashboard',
        icon: ICONS.library,
        _action: 'library',
        shortcutKey: 'Alt+L',
        shortcutKeyName: 'Alt+L',
        submodule: libraryModule[libraryPath].flatMap((list) => list.items),
        disabled: !isDdvs,
      },
      {
        title: 'Transport',
        path: '/transport/dashboard',
        icon: ICONS.transport,
        _action: 'transport',
        shortcutKey: 'Alt+T',
        shortcutKeyName: 'Alt+T',
        submodule: transportModule[transportPath].flatMap((list) => list.items),
        disabled: !isDdvs,
      },
      {
        title: 'Resource Management',
        path: '/resourceManagement/dashboard',
        icon: ICONS.resource,
        _action: 'resource',

        submodule: resourceManagement[resourceManagementPath].flatMap((list) => list.items),
        disabled: !isDdvs,
      },
      {
        title: 'Hostel',
        path: '/hostel/dashboard',
        icon: ICONS.hostel,
        _action: 'hostel',
        shortcutKey: 'Alt+O',
        shortcutKeyName: 'Alt+O',
        submodule: hostelModule[hostelPath].flatMap((list) => list.items),
        disabled: !isDdvs,
      },
      {
        title: 'Security',
        path: '/security/role',
        icon: ICONS.security,
        _action: 'security',
        shortcutKey: 'Alt+R',
        shortcutKeyName: 'Alt+R',
        submodule: securityModule[securityPath].flatMap((list) => list.items),
      },
      {
        title: 'Security Guard',
        path: '/security-guard/dashboard',
        icon: ICONS.securityGuard,
        _action: 'security-guard',
        submodule: securityGuardModule[securityGuardPath].flatMap((list) => list.items),
      },
    ],
  },
];

export const navSubData = (isDdvs: boolean) => ({
  ...studentModule(isDdvs),
  ...hrModule(isDdvs),
  ...academicModule(isDdvs),
  ...financeModule,
  ...classManagementModule,
  ...securityModule,
  ...instituteSetupModule,
  ...hostelModule,
  ...transportModule,
  ...communicationModule,
  ...calendarModule,
  ...libraryModule,
  ...resourceManagement,
  ...securityGuardModule,
});
