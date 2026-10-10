import { studentPath } from 'src/routes/paths';

import menuIconView from './icon-view';

const defaultStudentPermissionName = 'Students.';
export const defaultModulePermissionName = 'ShikshaMitra.Module.';

export const studentVisibilityPermissions = {
  dashboard: `${defaultModulePermissionName}Students.Dashboard`,
  records: `${defaultModulePermissionName}Students.Records`,
  admissions: `${defaultModulePermissionName}Students.Enrollment`,
  onboarding: `${defaultModulePermissionName}Students.Onboarding`,
  attendance: `${defaultModulePermissionName}Students.Attendance`,
  notification: `${defaultModulePermissionName}Students.Notification`,
} as const;

export const studentPaths = {
  dashboard: '/student/dashboard',
  enrollment: {
    root: '/student/admissions',
    inquiries: '/student/admissions/inquiries',
    inquiryNew: '/student/admissions/inquiries/new',
    inquiryEdit: (id: string) => `/student/admissions/inquiries/${encodeURIComponent(id)}/edit`,
    pipeline: '/student/admissions/pipeline',
    applicantWorkspace: (id: string) =>
      `/student/admissions/pipeline/applications/${encodeURIComponent(id)}`,
    applications: '/student/admissions/applications',
    decisionWorkspace: (id: string) =>
      `/student/admissions/applications/${encodeURIComponent(id)}`,
    assessments: '/student/admissions/assessments',
    settings: {
      root: '/student/admissions/settings/cycles',
      cycles: '/student/admissions/settings/cycles',
      offerings: '/student/admissions/settings/offerings',
      intakeAssignment: '/student/admissions/settings/intake-assignment',
      workflows: '/student/admissions/settings/workflows',
      forms: '/student/admissions/settings/forms',
    },
  },
  onboarding: {
    root: '/student/onboarding',
    setup: '/student/onboarding/setup',
    settings: '/student/onboarding/settings',
    settingsSections: {
      readinessAccess: '/student/onboarding/settings/readiness-access',
      numberingPlacement: '/student/onboarding/settings/numbering-placement',
      operationalPolicies: '/student/onboarding/settings/operational-policies',
      rules: '/student/onboarding/settings/rules',
      grNumber: '/student/onboarding/settings/gr-number',
      rollNumber: '/student/onboarding/settings/roll-number',
      accountsAccess: '/student/onboarding/settings/accounts-access',
    },
  },
  records: {
    root: '/student/records/directory',
    directory: '/student/records/directory',
    changes: '/student/records/changes',
    documents: '/student/records/documents',
    transitions: '/student/records/transitions',
    reportWorkspace: '/student/records/reports',
    settingsWorkspace: '/student/records/settings',
    settingsSections: {
      changes: '/student/records/settings/changes',
      documents: '/student/records/settings/documents',
      transitions: '/student/records/settings/transitions',
      access: '/student/records/settings/access',
    },
    studentList: '/student/profile',
    studentICard: '/student/student-i-card',
    management: '/student/management',
    certificates: '/student/certificates',
    reports: '/student/reports',
    settings: '/student/studentRecords/setting',
  },
  attendance: {
    root: '/student/attendance/take-attendance',
    markAttendance: '/student/attendance/take-attendance',
    leaveAndAbsent: '/student/attendance/leave-absent',
    reports: '/student/attendance/reports',
    settings: {
      root: '/student/attendance/setting',
      leaveType: '/student/attendance/setting',
    },
  },
  notification: '/student/attendance/notification',
};

export const studentPermissions = {
  root: `${defaultModulePermissionName}Students`,
  dashboard: `${defaultStudentPermissionName}Dashboard.View`,
  enrollment: {
    root: [
      `${defaultStudentPermissionName}Admissions.View`,
      `${defaultStudentPermissionName}Admissions.Inquiries.View`,
      `${defaultStudentPermissionName}Admissions.Applications.View`,
      `${defaultStudentPermissionName}Admissions.Assessments.View`,
      `${defaultStudentPermissionName}Admissions.Reviews.View`,
      `${defaultStudentPermissionName}Admissions.Offerings.View`,
      `${defaultStudentPermissionName}Admissions.Workflows.View`,
      `${defaultStudentPermissionName}Admissions.Forms.View`,
    ],
    inquiries: `${defaultStudentPermissionName}Admissions.Inquiries.View`,
    applications: `${defaultStudentPermissionName}Admissions.Applications.View`,
    assessments: `${defaultStudentPermissionName}Admissions.Assessments.View`,
    settings: {
      root: [
        `${defaultStudentPermissionName}Admissions.View`,
        `${defaultStudentPermissionName}Admissions.Offerings.View`,
        `${defaultStudentPermissionName}Admissions.Workflows.View`,
        `${defaultStudentPermissionName}Admissions.Forms.View`,
      ],
      cycles: `${defaultStudentPermissionName}Admissions.View`,
      offerings: `${defaultStudentPermissionName}Admissions.Offerings.View`,
      intakeAssignment: `${defaultStudentPermissionName}Admissions.Offerings.View`,
      workflows: `${defaultStudentPermissionName}Admissions.Workflows.View`,
      forms: `${defaultStudentPermissionName}Admissions.Forms.View`,
    },
  },
  onboarding: {
    root: [
      `${defaultStudentPermissionName}Onboarding.View`,
      `${defaultStudentPermissionName}Onboarding.Add`,
    ],
    setup: `${defaultStudentPermissionName}Onboarding.View`,
    settings: `${defaultStudentPermissionName}Onboarding.Add`,
  },
  records: {
    root: [
      `${defaultStudentPermissionName}Records.StudentList`,
      `${defaultStudentPermissionName}Records.StudentICard`,
      `${defaultStudentPermissionName}Records.StudentManagement`,
      `${defaultStudentPermissionName}Records.Certificates`,
      `${defaultStudentPermissionName}Records.Reports`,
      `${defaultStudentPermissionName}Records.Settings`,
      `${defaultStudentPermissionName}Records.Changes.View`,
      `${defaultStudentPermissionName}Records.Transitions.View`,
    ],
    studentList: `${defaultStudentPermissionName}Records.StudentList`,
    studentICard: `${defaultStudentPermissionName}Records.StudentICard`,
    studentManagement: `${defaultStudentPermissionName}Records.StudentManagement`,
    certificates: `${defaultStudentPermissionName}Records.Certificates`,
    reports: `${defaultStudentPermissionName}Records.Reports`,
    setting: `${defaultStudentPermissionName}Records.Settings`,
    changes: `${defaultStudentPermissionName}Records.Changes.View`,
    transitions: `${defaultStudentPermissionName}Records.Transitions.View`,
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
  notification: [
    `${defaultStudentPermissionName}Notification.InquiryManagement.View`,
    `${defaultStudentPermissionName}Notification.RegistrationManagement.View`,
    `${defaultStudentPermissionName}Notification.AdmissionManagement.View`,
    `${defaultStudentPermissionName}Notification.StudentRecordManagement.View`,
    `${defaultStudentPermissionName}Notification.AttendanceManagement.View`,
  ],
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
          visibilityPermissionName: studentVisibilityPermissions.dashboard,

          shortcutKey: 'Alt+S+1',
          shortcutKeyName: 'Alt+S+1',
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
        {
          title: 'Admissions',
          path: studentPaths.enrollment.root,
          _action: 'student-admissions',
          permissionName: studentPermissions.enrollment.root,
          visibilityPermissionName: studentVisibilityPermissions.admissions,
          icon: menuIconView('mdi:account-school-outline'),
          children: [
            {
              title: 'Inquiries',
              path: studentPaths.enrollment.inquiries,
              _action: 'student-admissions-crm-inquiries',
              permissionName: studentPermissions.enrollment.inquiries,
              icon: menuIconView('mdi:account-question-outline'),
            },
            {
              title: 'Pipeline',
              path: studentPaths.enrollment.pipeline,
              _action: 'student-admissions-crm-pipeline',
              permissionName: studentPermissions.enrollment.applications,
              icon: menuIconView('mdi:chart-timeline-variant'),
            },
            {
              title: 'Assessments',
              path: studentPaths.enrollment.assessments,
              _action: 'student-admissions-assessments',
              permissionName: studentPermissions.enrollment.assessments,
              icon: menuIconView('mdi:clipboard-clock-outline'),
            },
            {
              title: 'Applications',
              path: studentPaths.enrollment.applications,
              _action: 'student-admissions-applications-all',
              permissionName: studentPermissions.enrollment.applications,
              icon: menuIconView('mdi:application-edit-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.enrollment.settings.root,
              _action: 'student-admissions-settings',
              permissionName: studentPermissions.enrollment.settings.root,
              icon: menuIconView('mdi:cog-outline'),
              children: [
                {
                  title: 'Admission Periods',
                  path: studentPaths.enrollment.settings.cycles,
                  _action: 'student-admissions-settings-cycles',
                  permissionName: studentPermissions.enrollment.settings.cycles,
                  icon: menuIconView('mdi:calendar-sync-outline'),
                },
                {
                  title: 'Admission Form',
                  path: studentPaths.enrollment.settings.forms,
                  _action: 'student-admissions-settings-forms',
                  permissionName: studentPermissions.enrollment.settings.forms,
                  icon: menuIconView('mdi:form-select'),
                },
                {
                  title: 'Admission Stage',
                  path: studentPaths.enrollment.settings.workflows,
                  _action: 'student-admissions-settings-workflows',
                  permissionName: studentPermissions.enrollment.settings.workflows,
                  icon: menuIconView('mdi:graph-outline'),
                },
                {
                  title: 'Intake & Assignment',
                  path: studentPaths.enrollment.settings.intakeAssignment,
                  _action: 'student-admissions-settings-intake-assignment',
                  permissionName: studentPermissions.enrollment.settings.intakeAssignment,
                  icon: menuIconView('mdi:account-arrow-right-outline'),
                },
                {
                  title: 'Admission Offering',
                  path: studentPaths.enrollment.settings.offerings,
                  _action: 'student-admissions-settings-offerings',
                  permissionName: studentPermissions.enrollment.settings.offerings,
                  icon: menuIconView('mdi:school-outline'),
                },
              ],
            },
          ],
        },
        {
          title: 'Onboarding',
          path: studentPaths.onboarding.root,
          _action: 'student-onboarding',
          permissionName: studentPermissions.onboarding.root,
          visibilityPermissionName: studentVisibilityPermissions.onboarding,
          icon: menuIconView('mdi:account-arrow-right-outline'),
          children: [
            {
              title: 'Student Setup',
              path: studentPaths.onboarding.setup,
              _action: 'student-onboarding-setup',
              permissionName: studentPermissions.onboarding.setup,
              icon: menuIconView('mdi:account-cog-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.onboarding.settings,
              _action: 'student-onboarding-settings',
              permissionName: studentPermissions.onboarding.settings,
              icon: menuIconView('mdi:cog-outline'),
              children: [
                {
                  title: 'Readiness & Access',
                  path: studentPaths.onboarding.settingsSections.readinessAccess,
                  _action: 'student-onboarding-settings-readiness-access',
                  permissionName: studentPermissions.onboarding.settings,
                  icon: menuIconView('mdi:account-check-outline'),
                },
                {
                  title: 'Numbering & Placement',
                  path: studentPaths.onboarding.settingsSections.numberingPlacement,
                  _action: 'student-onboarding-settings-numbering-placement',
                  permissionName: studentPermissions.onboarding.settings,
                  icon: menuIconView('mdi:identifier'),
                },
              ],
            },
          ],
        },
        {
          title: 'Student Records',
          path: studentPaths.records.root,
          _action: 'student-records',
          shortcutKey: 'Alt+S+R',
          shortcutKeyName: 'Alt+S+R',

          permissionName: studentPermissions.records.root,
          visibilityPermissionName: studentVisibilityPermissions.records,
          icon: menuIconView('mdi:folder-account-outline'),
          children: [
            {
              title: 'Student Directory',
              path: studentPaths.records.directory,
              _action: 'student-record-directory',
              permissionName: studentPermissions.records.studentList,
              permissionChildren: [
                {
                  title: 'Directory & profiles',
                  permissionName: studentPermissions.records.studentList,
                },
                {
                  title: 'Historical entry requests',
                  permissionName: [`${defaultStudentPermissionName}Records.Overrides.Request`],
                },
                {
                  title: 'Historical entry approvals',
                  permissionName: [`${defaultStudentPermissionName}Records.Overrides.Approve`],
                },
                {
                  title: 'Guardian portal access',
                  permissionName: `${defaultStudentPermissionName}Records.GuardianAccess.View`,
                },
              ],
              icon: menuIconView('mdi:account-search-outline'),
            },
            {
              title: 'Changes & Approvals',
              path: studentPaths.records.changes,
              _action: 'student-record-changes',
              permissionName: studentPermissions.records.changes,
              icon: menuIconView('mdi:account-edit-outline'),
            },
            {
              title: 'Documents & IDs',
              path: studentPaths.records.documents,
              _action: 'student-record-documents',
              permissionName: [
                studentPermissions.records.certificates,
                studentPermissions.records.studentICard,
              ],
              permissionChildren: [
                {
                  title: 'Certificates',
                  permissionName: studentPermissions.records.certificates,
                },
                {
                  title: 'Identity cards',
                  permissionName: studentPermissions.records.studentICard,
                },
              ],
              icon: menuIconView('mdi:card-account-details-outline'),
            },
            {
              title: 'Year-End & Transitions',
              path: studentPaths.records.transitions,
              _action: 'student-record-transitions',
              permissionName: studentPermissions.records.transitions,
              icon: menuIconView('mdi:school-outline'),
            },
            {
              title: 'Reports',
              path: studentPaths.records.reportWorkspace,
              _action: 'student-record-reports',
              permissionName: studentPermissions.records.reports,
              icon: menuIconView('mdi:chart-box-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.records.settingsWorkspace,
              _action: 'student-record-settings',
              permissionName: studentPermissions.records.setting,
              icon: menuIconView('mdi:cog-outline'),
            },
          ],
        },
        {
          title: 'Attendance',
          path: studentPaths.attendance.root,
          _action: 'student-attendance',

          permissionName: studentPermissions.attendance.root,
          visibilityPermissionName: studentVisibilityPermissions.attendance,
          icon: menuIconView('mdi:calendar-check-outline'),
          children: [
            {
              title: 'Daily Attendance',
              path: studentPaths.attendance.markAttendance,
              _action: 'student-attendance-take-attendance',
              shortcutKey: 'Alt+S+A+2',
              shortcutKeyName: 'Alt+S+A+2',
              permissionName: studentPermissions.attendance.markAttendance,
              icon: menuIconView('mdi:calendar-check-outline'),
            },
            {
              title: 'Leave & Corrections',
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
          visibilityPermissionName: studentVisibilityPermissions.notification,
          permissionChildren: [
            {
              title: 'Inquiry Management',
              permissionName: `${defaultStudentPermissionName}Notification.InquiryManagement`,
            },
            {
              title: 'Registration Management',
              permissionName: `${defaultStudentPermissionName}Notification.RegistrationManagement`,
            },
            {
              title: 'Admission Management',
              permissionName: `${defaultStudentPermissionName}Notification.AdmissionManagement`,
            },
            {
              title: 'Student Record Management',
              permissionName: `${defaultStudentPermissionName}Notification.StudentRecordManagement`,
            },
            {
              title: 'Attendance Management',
              permissionName: `${defaultStudentPermissionName}Notification.AttendanceManagement`,
            },
          ],
          icon: menuIconView('mdi:bell-outline'),
        },
      ],
    },
  ],
});

export default studentModule;
