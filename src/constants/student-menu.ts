import { studentPath } from 'src/routes/paths';

import menuIconView from './icon-view';

const defaultStudentPermissionName = 'Students.';
export const defaultModulePermissionName = 'ShikshaMitra.Module.';

export const studentPaths = {
  dashboard: '/student/dashboard',
  enrollment: {
    root: '/student/admissions',
    inquiries: '/student/admissions/inquiries',
    applications: '/student/admissions/applications',
    settings: {
      root: '/student/admissions/settings/cycles',
      cycles: '/student/admissions/settings/cycles',
      offerings: '/student/admissions/settings/offerings',
      workflows: '/student/admissions/settings/workflows',
      forms: '/student/admissions/settings/forms',
    },
  },
  records: {
    root: '',
    studentList: '/student/profile',
    studentICard: '/student/student-i-card',
    management: '/student/management',
    certificates: '/student/certificates',
    reports: '/student/reports',
    settings: '/student/studentRecords/setting',
  },
  attendance: {
    root: '',
    markAttendance: '/student/attendance/take-attendance',
    leaveAndAbsent: '/student/attendance/leave-absent',
    reports: '/student/attendance/reports',
    settings: {
      root: '',
      leaveType: '/student/attendance/setting',
    },
  },
  notification: '/student/attendance/notification',
};

export const studentPermissions = {
  root: `${defaultModulePermissionName}Students`,
  dashboard: `${defaultModulePermissionName}Students`,
  enrollment: {
    root: `${defaultModulePermissionName}Students`,
    inquiries: `${defaultModulePermissionName}Students`,
    applications: `${defaultModulePermissionName}Students`,
    settings: {
      root: `${defaultModulePermissionName}Students`,
      cycles: `${defaultModulePermissionName}Students`,
      offerings: `${defaultModulePermissionName}Students`,
      workflows: `${defaultModulePermissionName}Students`,
      forms: `${defaultModulePermissionName}Students`,
    },
  },
  records: {
    root: [
      `${defaultStudentPermissionName}Records.StudentList`,
      `${defaultStudentPermissionName}Records.StudentICard`,
      `${defaultStudentPermissionName}Records.StudentManagement`,
      `${defaultStudentPermissionName}Records.Certificates`,
      `${defaultStudentPermissionName}Records.Reports`,
      `${defaultStudentPermissionName}Records.Settings`,
    ],
    studentList: `${defaultStudentPermissionName}Records.StudentList`,
    studentICard: `${defaultStudentPermissionName}Records.StudentICard`,
    studentManagement: `${defaultStudentPermissionName}Records.StudentManagement`,
    certificates: `${defaultStudentPermissionName}Records.Certificates`,
    reports: `${defaultStudentPermissionName}Records.Reports`,
    setting: `${defaultStudentPermissionName}Records.Settings`,
  },
  attendance: {
    root: [
      `${defaultStudentPermissionName}Attendance.MarkAttendance`,
      `${defaultStudentPermissionName}Attendance.LeaveAndAbsent`,
      `${defaultStudentPermissionName}Attendance.Reports`,
      `${defaultStudentPermissionName}Attendance.Setting.LeaveType`,
    ],
    markAttendance: `${defaultStudentPermissionName}Attendance.MarkAttendance`,
    leaveAndAbsent: `${defaultStudentPermissionName}Attendance.LeaveAndAbsent`,
    reports: `${defaultStudentPermissionName}Attendance.Reports`,
    settings: {
      root: `${defaultStudentPermissionName}Attendance.Setting.LeaveType`,
      leaveType: `${defaultStudentPermissionName}Attendance.Setting.LeaveType`,
    },
  },
  notification: `${defaultStudentPermissionName}Notification`,
};

const studentModule = (isDdvs: boolean) => ({
  [studentPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: studentPaths.dashboard,
          _action: 'student-dashboard',
          permissionName: studentPermissions.dashboard,

          shortcutKey: 'Alt+S+1',
          shortcutKeyName: 'Alt+S+1',
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
        {
          title: 'Student Records',
          path: studentPaths.records.root,
          _action: 'student-records',
          shortcutKey: 'Alt+S+R',
          shortcutKeyName: 'Alt+S+R',

          permissionName: studentPermissions.records.root,
          icon: menuIconView('mdi:folder-account-outline'),
          children: [
            {
              title: 'Student Management',
              path: studentPaths.records.management,
              _action: 'student-management',
              shortcutKey: 'Alt+S+R+4',
              shortcutKeyName: 'Alt+S+R+4',
              permissionName: studentPermissions.records.studentManagement,
              icon: menuIconView('mdi:account-cog-outline'),
            },
            {
              title: 'Student List',
              path: studentPaths.records.studentList,
              _action: 'student-profile',
              shortcutKey: 'Alt+S+R+2',
              shortcutKeyName: 'Alt+S+R+2',
              permissionName: studentPermissions.records.studentList,
              icon: menuIconView('mdi:format-list-bulleted'),
            },
            {
              title: 'Student I-Card',
              path: studentPaths.records.studentICard,
              _action: 'student-i-card',
              shortcutKey: 'Alt+S+R+3',
              shortcutKeyName: 'Alt+S+R+3',
              permissionName: studentPermissions.records.studentICard,
              icon: menuIconView('mdi:card-account-details-outline'),
            },
            {
              title: 'Certificates',
              path: studentPaths.records.certificates,
              _action: 'student-certificates',
              shortcutKey: 'Alt+S+R+5',
              shortcutKeyName: 'Alt+S+R+5',
              permissionName: studentPermissions.records.certificates,
              icon: menuIconView('mdi:certificate-outline'),
            },
            {
              title: 'Reports',
              path: studentPaths.records.reports,
              _action: 'student-reports',
              shortcutKey: 'Alt+S+R+6',
              shortcutKeyName: 'Alt+S+R+6',
              permissionName: studentPermissions.records.reports,
              icon: menuIconView('mdi:chart-box-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.records.settings,
              _action: 'student-setting',
              shortcutKey: 'Alt+S+R+6',
              shortcutKeyName: 'Alt+S+R+6',
              permissionName: studentPermissions.records.setting,
              icon: menuIconView('mdi:cog-outline'),
            },
          ],
        },
        {
          title: 'Enrollment',
          path: studentPaths.enrollment.root,
          _action: 'student-enrollment',
          permissionName: studentPermissions.enrollment.root,
          icon: menuIconView('mdi:account-school-outline'),
          children: [
            {
              title: 'Inquiries',
              path: studentPaths.enrollment.inquiries,
              _action: 'student-enrollment-inquiries',
              permissionName: studentPermissions.enrollment.inquiries,
              icon: menuIconView('mdi:account-question-outline'),
            },
            {
              title: 'Applications',
              path: studentPaths.enrollment.applications,
              _action: 'student-enrollment-applications',
              permissionName: studentPermissions.enrollment.applications,
              icon: menuIconView('mdi:application-edit-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.enrollment.settings.root,
              _action: 'student-enrollment-settings',
              permissionName: studentPermissions.enrollment.settings.root,
              icon: menuIconView('mdi:cog-outline'),
              children: [
                {
                  title: 'Admission cycle',
                  path: studentPaths.enrollment.settings.cycles,
                  _action: 'student-enrollment-settings-cycles',
                  permissionName: studentPermissions.enrollment.settings.cycles,
                  icon: menuIconView('mdi:calendar-sync-outline'),
                },
                {
                  title: 'Offerings',
                  path: studentPaths.enrollment.settings.offerings,
                  _action: 'student-enrollment-settings-offerings',
                  permissionName: studentPermissions.enrollment.settings.offerings,
                  icon: menuIconView('mdi:school-outline'),
                },
                {
                  title: 'Workflow builder',
                  path: studentPaths.enrollment.settings.workflows,
                  _action: 'student-enrollment-settings-workflows',
                  permissionName: studentPermissions.enrollment.settings.workflows,
                  icon: menuIconView('mdi:graph-outline'),
                },
                {
                  title: 'Form builder',
                  path: studentPaths.enrollment.settings.forms,
                  _action: 'student-enrollment-settings-forms',
                  permissionName: studentPermissions.enrollment.settings.forms,
                  icon: menuIconView('mdi:form-select'),
                },
              ],
            },
          ],
        },
        {
          title: 'Attendance',
          path: studentPaths.attendance.root,
          _action: 'student-attendance',

          permissionName: studentPermissions.attendance.root,
          icon: menuIconView('mdi:calendar-check-outline'),
          children: [
            {
              title: 'Mark Attendance',
              path: studentPaths.attendance.markAttendance,
              _action: 'student-attendance-take-attendance',
              shortcutKey: 'Alt+S+A+2',
              shortcutKeyName: 'Alt+S+A+2',
              permissionName: studentPermissions.attendance.markAttendance,
              icon: menuIconView('mdi:calendar-check-outline'),
            },
            {
              title: 'Leave & Absent',
              path: studentPaths.attendance.leaveAndAbsent,
              _action: 'student-attendance-leave-absent',
              shortcutKey: 'Alt+S+A+3',
              shortcutKeyName: 'Alt+S+A+3',
              permissionName: studentPermissions.attendance.leaveAndAbsent,
              icon: menuIconView('mdi:calendar-remove-outline'),
            },
            {
              title: 'Reports',
              path: studentPaths.attendance.reports,
              _action: 'student-attendance-reports',
              shortcutKey: 'Alt+S+A+4',
              shortcutKeyName: 'Alt+S+A+4',
              permissionName: studentPermissions.attendance.reports,
              icon: menuIconView('mdi:chart-box-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.attendance.settings.root,
              _action: 'student-attendance-setting',
              shortcutKey: 'Alt+S+A+5',
              shortcutKeyName: 'Alt+S+A+5',
              permissionName: studentPermissions.attendance.settings.root,
              icon: menuIconView('mdi:cog-outline'),
              children: [
                {
                  title: 'Leave Type',
                  path: studentPaths.attendance.settings.leaveType,
                  _action: 'student-attendance-setting-leave-type',
                  shortcutKey: 'Alt+S+A+5+1',
                  shortcutKeyName: 'Alt+S+A+5+1',
                  permissionName: studentPermissions.attendance.settings.leaveType,
                  icon: menuIconView('mdi:format-list-checks'),
                },
              ],
            },
          ],
        },
        {
          title: 'Notification',
          path: studentPaths.notification,
          _action: 'notification',
          shortcutKey: 'Alt+S+N',
          shortcutKeyName: 'Alt+S+N',

          permissionName: studentPermissions.notification,
          icon: menuIconView('mdi:bell-outline'),
        },
      ],
    },
  ],
});

export default studentModule;
