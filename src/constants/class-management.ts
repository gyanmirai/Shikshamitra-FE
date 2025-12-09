import { classPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultClassPermissionName = 'ClassManagement.';

export const classManagementPaths = {
  dashboard: '/classManagement/dashboard',
  electiveAssignment: '/classManagement/assign-elective-subject',
  chapters: '/classManagement/courseProgress',
  teacherAssignment: '/classManagement/teacher',
  classTeacherAssignment: '/classManagement/assignClassTeacher',
  notification: '/classManagement/notification-management',
};

export const classManagementPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultClassPermissionName}Dashboard`,
  electiveAssignment: `${defaultModulePermissionName}${defaultClassPermissionName}ElectiveAssignment`,
  chapters: `${defaultModulePermissionName}${defaultClassPermissionName}Chapters`,
  teacherAssignment: `${defaultModulePermissionName}${defaultClassPermissionName}TeacherAssignment`,
  classTeacherAssignment: `${defaultModulePermissionName}${defaultClassPermissionName}ClassTeacherAssignment`,
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
        },
        {
          title: 'Student Elective Assignment',
          path: classManagementPaths.electiveAssignment,
          _action: 'assign-elective-subject',
          shortcutKey: 'Alt+A+C+1',
          shortcutKeyName: 'Alt+A+C+1',
          permissionName: classManagementPermissions.electiveAssignment,
        },
        {
          title: 'Chapters Progress',
          path: classManagementPaths.chapters,
          _action: 'course-management-courseProgress',
          shortcutKey: 'Alt+A+S+3',
          shortcutKeyName: 'Alt+A+S+3',
          permissionName: classManagementPermissions.chapters,
        },
        {
          title: 'Teachers Assignment',
          path: classManagementPaths.teacherAssignment,
          _action: 'teachers-assignment',
          shortcutKey: 'Alt+A+C+2',
          shortcutKeyName: 'Alt+A+C+2',
          permissionName: classManagementPermissions.teacherAssignment,
        },
        {
          title: 'Class Teacher Assignment',
          path: classManagementPaths.classTeacherAssignment,
          _action: 'assign-teacher',
          shortcutKey: 'Alt+A+Z',
          shortcutKeyName: 'Alt+A+Z',
          permissionName: classManagementPermissions.classTeacherAssignment,
        },
        {
          title: 'Notification',
          path: classManagementPaths.notification,
          _action: 'notification-management',
          shortcutKey: 'Alt+A+N',
          shortcutKeyName: 'Alt+A+N',
          permissionName: classManagementPermissions.notification,
        },
      ],
    },
  ],
};

export default classManagementModule;
