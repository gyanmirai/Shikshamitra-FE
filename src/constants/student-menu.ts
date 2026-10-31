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
    decisionWorkspace: (id: string) => `/student/admissions/applications/${encodeURIComponent(id)}`,
    assessments: '/student/admissions/assessments',
    settings: {
      root: '/student/admissions/settings/cycles',
      cycles: '/student/admissions/settings/cycles',
      offerings: '/student/admissions/settings/offerings',
      publicInquiryLinks: '/student/admissions/settings/public-inquiry-links',
      intakeAssignment: '/student/admissions/settings/public-inquiry-links',
      workflows: '/student/admissions/settings/workflows',
      forms: '/student/admissions/settings/forms',
    },
  },
  onboarding: {
    root: '/student/onboarding',
    setup: '/student/onboarding/setup',
    settings: '/student/onboarding/settings',
    settingsSections: {
      portalAccess: '/student/onboarding/settings?tab=portal-access',
      grNumber: '/student/onboarding/settings?tab=gr-number',
      rollNumber: '/student/onboarding/settings?tab=roll-number',
      // Retain existing callers while old bookmarked routes redirect to this workspace.
      readinessAccess: '/student/onboarding/settings?tab=portal-access',
      numberingPlacement: '/student/onboarding/settings?tab=gr-number',
      operationalPolicies: '/student/onboarding/settings?tab=portal-access',
      rules: '/student/onboarding/settings?tab=portal-access',
      accountsAccess: '/student/onboarding/settings?tab=portal-access',
    },
  },
  records: {
    root: '/student/profile',
    directory: '/student/records/directory',
    houseManagement: '/student/records/houses',
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
      `${defaultStudentPermissionName}Admissions.Applicants.View`,
    ],
    inquiries: `${defaultStudentPermissionName}Admissions.Inquiries.View`,
    applications: `${defaultStudentPermissionName}Admissions.Applications.View`,
    assessments: `${defaultStudentPermissionName}Admissions.Assessments.View`,
    applicants: `${defaultStudentPermissionName}Admissions.Applicants.View`,
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
    root: [`${defaultStudentPermissionName}Onboarding.View`],
    setup: `${defaultStudentPermissionName}Onboarding.View`,
    settings: `${defaultStudentPermissionName}Onboarding.View`,
    configure: `${defaultStudentPermissionName}Onboarding.Add`,
    delete: `${defaultStudentPermissionName}Onboarding.Delete`,
  },
  records: {
    root: [
      `${defaultStudentPermissionName}Records.StudentList.View`,
      `${defaultStudentPermissionName}Records.HouseManagement.View`,
      `${defaultStudentPermissionName}Records.StudentICard.View`,
      `${defaultStudentPermissionName}Records.Certificates.View`,
      `${defaultStudentPermissionName}Records.Reports.View`,
      `${defaultStudentPermissionName}Records.Settings.View`,
    ],
    studentList: `${defaultStudentPermissionName}Records.StudentList.View`,
    manageStudent: `${defaultStudentPermissionName}Records.StudentList.Add`,
    houseManagement: `${defaultStudentPermissionName}Records.HouseManagement.View`,
    manageHouseManagement: `${defaultStudentPermissionName}Records.HouseManagement.Add`,
    deleteHouseManagement: `${defaultStudentPermissionName}Records.HouseManagement.Delete`,
    studentICard: `${defaultStudentPermissionName}Records.StudentICard.View`,
    certificates: `${defaultStudentPermissionName}Records.Certificates.View`,
    reports: `${defaultStudentPermissionName}Records.Reports.View`,
    setting: `${defaultStudentPermissionName}Records.Settings.View`,
    changes: `${defaultStudentPermissionName}Records.Changes.View`,
    transitions: `${defaultStudentPermissionName}Records.Transitions.View`,
    overrides: `${defaultStudentPermissionName}Records.Overrides.View`,
    guardianAccess: `${defaultStudentPermissionName}Records.GuardianAccess.View`,
    identityCompliance: `${defaultStudentPermissionName}IdentityCompliance.View`,
  },
  attendance: {
    root: [
      `${defaultStudentPermissionName}Attendance.MarkAttendance.View`,
      `${defaultStudentPermissionName}Attendance.LeaveAndAbsent.View`,
      `${defaultStudentPermissionName}Attendance.Reports.View`,
      `${defaultStudentPermissionName}Attendance.Setting.LeaveType.View`,
    ],
    markAttendance: `${defaultStudentPermissionName}Attendance.MarkAttendance.View`,
    leaveAndAbsent: `${defaultStudentPermissionName}Attendance.LeaveAndAbsent.View`,
    reports: `${defaultStudentPermissionName}Attendance.Reports.View`,
    settings: {
      root: `${defaultStudentPermissionName}Attendance.Setting.LeaveType.View`,
      leaveType: `${defaultStudentPermissionName}Attendance.Setting.LeaveType.View`,
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

// Permission-editor bundle only. Navigation and workflow guards keep their exact IDs.
// Keep aligned with the backend Student List submodule registration.
export const studentProfilePermissionViews = [
  studentPermissions.records.studentList,
  studentPermissions.records.changes,
  studentPermissions.records.transitions,
  studentPermissions.records.overrides,
  studentPermissions.records.guardianAccess,
  studentPermissions.records.identityCompliance,
];

const studentModule = () => ({
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
              permissionChildren: [
                {
                  title: 'Applications',
                  permissionName: studentPermissions.enrollment.applications,
                },
                {
                  title: 'Applicant profiles',
                  permissionName: studentPermissions.enrollment.applicants,
                },
                { title: 'Payment workflow', permissionName: 'Students.Admissions.Payments.View' },
                { title: 'Offers', permissionName: 'Students.Admissions.Offers.View' },
                { title: 'Seats', permissionName: 'Students.Admissions.Seats.View' },
                { title: 'Documents', permissionName: 'Students.Admissions.Documents.View' },
                { title: 'Eligibility', permissionName: 'Students.Admissions.Eligibility.View' },
                { title: 'Reviews', permissionName: 'Students.Admissions.Reviews.View' },
              ],
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
                  title: 'Public Inquiry Links',
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
              title: 'Onboarding Settings',
              path: studentPaths.onboarding.settings,
              _action: 'student-onboarding-settings',
              permissionName: studentPermissions.onboarding.settings,
              icon: menuIconView('mdi:cog-outline'),
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
              title: 'Student List',
              path: studentPaths.records.studentList,
              _action: 'student-profile',
              shortcutKey: 'Alt+S+R+2',
              shortcutKeyName: 'Alt+S+R+2',
              permissionName: studentPermissions.records.studentList,
              icon: menuIconView('mdi:format-list-bulleted'),
            },
            {
              title: 'House Management',
              path: studentPaths.records.houseManagement,
              _action: 'student-house-management',
              permissionName: studentPermissions.records.houseManagement,
              icon: menuIconView('mdi:home-group'),
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
              permissionChildren: [
                { title: 'Records reports', permissionName: studentPermissions.records.reports },
                { title: 'Student reports', permissionName: 'Students.Reports.View' },
              ],
              icon: menuIconView('mdi:chart-box-outline'),
            },
            {
              title: 'Settings',
              path: studentPaths.records.settings,
              _action: 'student-setting',
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
              title: 'Leave Requests',
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
