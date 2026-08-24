import { classPath } from 'src/routes/paths';

import menuIconView from './icon-view';
import { defaultModulePermissionName } from './student-menu';

const defaultClassPermissionName = 'ClassManagement.';

export const classManagementPaths = {
  dashboard: '/classManagement/dashboard',
  electiveAssignment: '/classManagement/assign-elective-subject',
  chapters: '/classManagement/courseProgress',
  teacherAssignment: '/classManagement/teacher',
  classTeacherAssignment: '/classManagement/assignClassTeacher',
  reports: '/classManagement/reports',
  notification: '/classManagement/notification-management',
};

export const classManagementPermissions = {
  root: `${defaultModulePermissionName}ClassManagement`,
  dashboard: `${defaultModulePermissionName}${defaultClassPermissionName}Dashboard`,
  // Keep this key aligned with the backend permission definition.
  // electiveAssignment: `${defaultModulePermissionName}${defaultClassPermissionName}StudentElectiveAssignment`,
  chapters: `${defaultModulePermissionName}${defaultClassPermissionName}Chapters`,
  teacherAssignment: `${defaultModulePermissionName}${defaultClassPermissionName}TeacherAssignment`,
  classTeacherAssignment: `${defaultModulePermissionName}${defaultClassPermissionName}ClassTeacherAssignment`,
  reports: `${defaultModulePermissionName}${defaultClassPermissionName}Reports`,
  notification: `${defaultModulePermissionName}${defaultClassPermissionName}Notification`,
};

const classManagementModule = {
  [classPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: classManagementPaths.dashboard,
          _action: 'dashboard',
          shortcutKey: 'Alt+A+1',
          shortcutKeyName: 'Alt+A+1',
          permissionName: classManagementPermissions.dashboard,
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
        {
          title: 'Student Elective Assignment',
          path: classManagementPaths.electiveAssignment,
          _action: 'assign-elective-subject',
          shortcutKey: 'Alt+A+C+1',
          shortcutKeyName: 'Alt+A+C+1',
          // permissionName: classManagementPermissions.electiveAssignment,
          icon: menuIconView('mdi:book-check-outline'),
        },
        {
          title: 'Chapters Progress',
          path: classManagementPaths.chapters,
          _action: 'course-management-courseProgress',
          shortcutKey: 'Alt+A+S+3',
          shortcutKeyName: 'Alt+A+S+3',
          permissionName: classManagementPermissions.chapters,
          icon: menuIconView('mdi:chart-line'),
        },
        // {
        //   title: 'Teachers Assignment',
        //   path: classManagementPaths.teacherAssignment,
        //   _action: 'teachers-assignment',
        //   shortcutKey: 'Alt+A+C+2',
        //   shortcutKeyName: 'Alt+A+C+2',
        //   permissionName: classManagementPermissions.teacherAssignment,
        //   icon: menuIconView('mdi:account-tie-outline'),
        // },
        {
          title: 'Class Teacher Assignment',
          path: classManagementPaths.classTeacherAssignment,
          _action: 'assign-teacher',
          shortcutKey: 'Alt+A+Z',
          shortcutKeyName: 'Alt+A+Z',
          permissionName: classManagementPermissions.classTeacherAssignment,
          icon: menuIconView('mdi:account-supervisor-outline'),
        },
        {
          title: 'Reports',
          path: classManagementPaths.reports,
          _action: 'reports',
          shortcutKey: 'Alt+A+R',
          shortcutKeyName: 'Alt+A+R',
          permissionName: classManagementPermissions.reports,
          icon: menuIconView('mdi:chart-box-outline'),
        },
        {
          title: 'Notification',
          path: classManagementPaths.notification,
          _action: 'notification-management',
          shortcutKey: 'Alt+A+N',
          shortcutKeyName: 'Alt+A+N',
          permissionName: classManagementPermissions.notification,
          icon: menuIconView('mdi:bell-outline'),
        },
      ],
    },
  ],
};

export default classManagementModule;
