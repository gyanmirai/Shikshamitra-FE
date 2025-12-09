import { studentPath } from 'src/routes/paths';

const defaultStudentPermissionName = 'Students.';
export const defaultModulePermissionName = 'ShikshaMitra.Module.';

export const studentPaths = {
  dashboard: '/student/dashboard',
  enrollment: {
    root: '',
    inquiry: '/student/enrollment/inquiry',
    registrationForm: '/student/enrollment/registration-form',
    registration: '/student/enrollment/registration',
    entranceExam: '/student/enrollment/entrance-exam',
    admission: '/student/enrollment/admission',
    reports: '/student/enrollment/reports',
    settings: {
      root: '',
      documentTypes: '/student/enrollment/setting/documentTypes',
      inquiryPreference: '/student/enrollment/setting/inquiryPrefrence',
      entranceExamSlots: '/student/enrollment/setting/entranceExamSlots',
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
  notification: '/student/studentNotification',
};

export const studentPermissions = {
  root: `${defaultModulePermissionName}Students`,
  dashboard: `${defaultModulePermissionName}${defaultStudentPermissionName}Dashboard`,
  enrollment: {
    root: `${defaultModulePermissionName}${defaultStudentPermissionName}Enrollment`,
    inquiry: `${defaultStudentPermissionName}Enrollment.Inquiry`,
    registrationFormIssued: `${defaultStudentPermissionName}Enrollment.RegistrationFormIssued`,
    // Note: registration uses same permission as registrationFormIssued in original file
    registration: `${defaultStudentPermissionName}Enrollment.RegistrationFormIssued`,
    entranceExam: `${defaultStudentPermissionName}Enrollment.EntranceExam`,
    admission: `${defaultStudentPermissionName}Enrollment.Admission`,
    reports: `${defaultStudentPermissionName}Enrollment.Reports`,
    settings: {
      root: `${defaultModulePermissionName}${defaultStudentPermissionName}Enrollment.Settings`,
      documentTypes: `${defaultStudentPermissionName}Enrollment.Settings.DocumentTypes`,
      inquiryPreference: `${defaultStudentPermissionName}Enrollment.Settings.InquiryPreference`,
      entranceExamSlots: `${defaultStudentPermissionName}Enrollment.Settings.EntranceExamSlots`,
    },
  },
  records: {
    root: `${defaultModulePermissionName}${defaultStudentPermissionName}Records`,
    studentList: `${defaultStudentPermissionName}Records.StudentList`,
    studentICard: `${defaultStudentPermissionName}Records.StudentICard`,
    studentManagement: `${defaultStudentPermissionName}Records.StudentManagement`,
    certificates: `${defaultStudentPermissionName}Records.Certificates`,
    reports: `${defaultStudentPermissionName}Records.Reports`,
    setting: `${defaultModulePermissionName}${defaultStudentPermissionName}Records.Setting`,
  },
  attendance: {
    root: `${defaultModulePermissionName}${defaultStudentPermissionName}Attendance`,
    markAttendance: `${defaultStudentPermissionName}Attendance.MarkAttendance`,
    leaveAndAbsent: `${defaultStudentPermissionName}Attendance.LeaveAndAbsent`,
    reports: `${defaultStudentPermissionName}Attendance.Reports`,
    settings: {
      root: `${defaultModulePermissionName}${defaultStudentPermissionName}Attendance.Setting`,
      leaveType: `${defaultStudentPermissionName}Attendance.Setting.LeaveType`,
    },
  },
  notification: `${defaultModulePermissionName}${defaultStudentPermissionName}Notification`,
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
        },
        {
          title: 'Student Enrollment',
          path: studentPaths.enrollment.root,
          _action: 'student-enrollment',
          permissionName: studentPermissions.enrollment.root,

          children: [
            {
              title: 'Inquiry',
              path: studentPaths.enrollment.inquiry,
              _action: 'student-enrollment-inquiry',
              shortcutKey: 'Alt+S+2',
              shortcutKeyName: 'Alt+S+2',
              permissionName: studentPermissions.enrollment.inquiry,
            },
            {
              title: 'Registration Form Issued',
              path: studentPaths.enrollment.registrationForm,
              _action: 'student-enrollment-registration-form',

              permissionName: studentPermissions.enrollment.registrationFormIssued,
              shortcutKey: 'Alt+S+3',
              shortcutKeyName: 'Alt+S+3',
            },
            {
              title: 'Registration',
              path: studentPaths.enrollment.registration,
              _action: 'student-enrollment-registration',

              permissionName: studentPermissions.enrollment.registration,
              shortcutKey: 'Alt+S+4',
              shortcutKeyName: 'Alt+S+4',
            },
            {
              title: 'Entrance Exam',
              path: studentPaths.enrollment.entranceExam,
              _action: 'student-enrollment-entrance-exam',

              permissionName: studentPermissions.enrollment.entranceExam,
              shortcutKey: 'Alt+S+5',
              shortcutKeyName: 'Alt+S+5',
            },

            {
              title: 'Admission',
              path: studentPaths.enrollment.admission,
              _action: 'student-enrollment-admission',

              permissionName: studentPermissions.enrollment.admission,
              shortcutKey: 'Alt+S+7',
              shortcutKeyName: 'Alt+S+7',
            },
            {
              title: 'Reports',
              disabled: !isDdvs,
              caption: 'Coming Soon',
              path: studentPaths.enrollment.reports,
              _action: 'student-enrollment-reports',

              permissionName: studentPermissions.enrollment.reports,
              shortcutKey: 'Alt+S+8',
              shortcutKeyName: 'Alt+S+8',
            },
            {
              title: 'Settings',
              path: studentPaths.enrollment.settings.root,
              _action: 'student-enrollment-setting',

              permissionName: studentPermissions.enrollment.settings.root,
              shortcutKey: 'Alt+S+9',
              shortcutKeyName: 'Alt+S+9',
              children: [
                {
                  title: 'Document Types',
                  path: studentPaths.enrollment.settings.documentTypes,
                  _action: 'student-enrollment-setting-document-types',
                  shortcutKey: 'Alt+S+9+1',
                  shortcutKeyName: 'Alt+S+9+1',
                  permissionName: studentPermissions.enrollment.settings.documentTypes,
                },
                {
                  title: 'Inquiry Preference',
                  path: studentPaths.enrollment.settings.inquiryPreference,
                  _action: 'student-enrollment-setting-inquiry-preference',
                  shortcutKey: 'Alt+S+9+2',
                  shortcutKeyName: 'Alt+S+9+2',
                  permissionName: studentPermissions.enrollment.settings.inquiryPreference,
                },
                {
                  title: 'Entrance Exam Slots',
                  path: studentPaths.enrollment.settings.entranceExamSlots,
                  _action: 'student-enrollment-setting-entrance-exam-slots',
                  shortcutKey: 'Alt+S+9+3',
                  shortcutKeyName: 'Alt+S+9+3',
                  permissionName: studentPermissions.enrollment.settings.entranceExamSlots,
                },
                // {
                //   title: 'Registration Form Amount',
                //   path: '/student/enrollment/setting/registrationFormAmount',
                //   _action: 'student-enrollment-setting-registration-form-amount',
                //   shortcutKey: 'Alt+S+9+4',
                //   shortcutKeyName: 'Alt+S+9+4',
                // },
                // {
                //   title: 'Form Number Series',
                //   path: '/student/enrollment/setting/formNumberSeries',
                //   _action: 'student-enrollment-setting-form-number-series',
                //   shortcutKey: 'Alt+S+9+5',
                //   shortcutKeyName: 'Alt+S+9+5',
                // },
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
          children: [
            {
              title: 'Student List',
              path: studentPaths.records.studentList,
              _action: 'student-profile',
              shortcutKey: 'Alt+S+R+2',
              shortcutKeyName: 'Alt+S+R+2',
              permissionName: studentPermissions.records.studentList,
            },
            {
              title: 'Student I-Card',
              path: studentPaths.records.studentICard,
              _action: 'student-i-card',
              disabled: !isDdvs,
              caption: 'Coming Soon',
              shortcutKey: 'Alt+S+R+3',
              shortcutKeyName: 'Alt+S+R+3',
              permissionName: studentPermissions.records.studentICard,
            },
            {
              title: 'Student Management',
              path: studentPaths.records.management,
              _action: 'student-management',
              shortcutKey: 'Alt+S+R+4',
              shortcutKeyName: 'Alt+S+R+4',
              permissionName: studentPermissions.records.studentManagement,
            },
            {
              title: 'Certificates',
              path: studentPaths.records.certificates,
              _action: 'student-certificates',
              shortcutKey: 'Alt+S+R+5',
              shortcutKeyName: 'Alt+S+R+5',
              permissionName: studentPermissions.records.certificates,
            },
            {
              title: 'Reports',
              disabled: !isDdvs,
              path: studentPaths.records.reports,
              _action: 'student-reports',
              shortcutKey: 'Alt+S+R+6',
              shortcutKeyName: 'Alt+S+R+6',
              permissionName: studentPermissions.records.reports,
            },
            {
              title: 'Setting',
              path: studentPaths.records.settings,
              _action: 'student-setting',
              shortcutKey: 'Alt+S+R+6',
              shortcutKeyName: 'Alt+S+R+6',
              permissionName: studentPermissions.records.setting,
            },
          ],
        },
        {
          title: 'Attendance',
          path: studentPaths.attendance.root,
          _action: 'student-attendance',
          permissionName: studentPermissions.attendance.root,
          children: [
            {
              title: 'Mark Attendance',
              path: studentPaths.attendance.markAttendance,
              _action: 'student-attendance-take-attendance',
              shortcutKey: 'Alt+S+A+2',
              shortcutKeyName: 'Alt+S+A+2',
              permissionName: studentPermissions.attendance.markAttendance,
            },
            {
              title: 'Leave & Absent',
              path: studentPaths.attendance.leaveAndAbsent,
              _action: 'student-attendance-leave-absent',
              shortcutKey: 'Alt+S+A+3',
              shortcutKeyName: 'Alt+S+A+3',
              permissionName: studentPermissions.attendance.leaveAndAbsent,
            },
            {
              title: 'Reports',
              disabled: !isDdvs,
              caption: 'Coming Soon',
              path: studentPaths.attendance.reports,
              _action: 'student-attendance-reports',
              shortcutKey: 'Alt+S+A+4',
              shortcutKeyName: 'Alt+S+A+4',
              permissionName: studentPermissions.attendance.reports,
            },
            {
              title: 'Setting',
              path: studentPaths.attendance.settings.root,
              _action: 'student-attendance-setting',
              shortcutKey: 'Alt+S+A+5',
              shortcutKeyName: 'Alt+S+A+5',
              permissionName: studentPermissions.attendance.settings.root,
              children: [
                {
                  title: 'Leave Type',
                  path: studentPaths.attendance.settings.leaveType,
                  _action: 'student-attendance-setting-leave-type',
                  shortcutKey: 'Alt+S+A+5+1',
                  shortcutKeyName: 'Alt+S+A+5+1',
                  permissionName: studentPermissions.attendance.settings.leaveType,
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
        },
      ],
    },
  ],
});

export default studentModule;
