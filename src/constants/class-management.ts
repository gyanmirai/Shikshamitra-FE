import { classPath } from 'src/routes/paths';

const classManagementModule = {
  [classPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/classManagement/dashboard',
          _action: 'dashboard',
          shortcutKey: 'Alt+A+1',
          shortcutKeyName: 'Alt+A+1',
        },
        {
          title: 'Student Elective Assignment',
          path: '/classManagement/assign-elective-subject',
          _action: 'assign-elective-subject',
          shortcutKey: 'Alt+A+C+1',
          shortcutKeyName: 'Alt+A+C+1',
        },
        {
          title: 'Chapters Progress',
          path: '/classManagement/courseProgress',
          _action: 'course-management-courseProgress',
          shortcutKey: 'Alt+A+S+3',
          shortcutKeyName: 'Alt+A+S+3',
        },
        {
          title: 'Teachers Assignment',
          path: '/classManagement/teacher',
          _action: 'teachers-assignment',
          shortcutKey: 'Alt+A+C+2',
          shortcutKeyName: 'Alt+A+C+2',
        },
        {
          title: 'Class Teacher Assignment',
          path: '/classManagement/assignClassTeacher',
          _action: 'assign-teacher',
          shortcutKey: 'Alt+A+Z',
          shortcutKeyName: 'Alt+A+Z',
        },
        {
          title: 'Notification',
          path: '/classManagement/notification-management',
          _action: 'notification-management',
          shortcutKey: 'Alt+A+N',
          shortcutKeyName: 'Alt+A+N',
        },
      ],
    },
  ],
};

export default classManagementModule;
