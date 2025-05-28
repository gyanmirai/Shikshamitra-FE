import {
  hrPath,
  hostelPath,
  financePath,
  studentPath,
  settingPath,
  libraryPath,
  securityPath,
  academicPath,
  transportPath,
  communicationPath,
  securityGuardPath,
  resourceManagementPath,
} from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

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
};

// ----------------------------------------------------------------------

export const settingMenu = {
  title: 'Institute Setup',
  path: '/setting/basic-information',
  icon: ICONS.school,
  _action: 'setting',
};

const studentModule = {
  [studentPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Student Enrollment',
          path: '',
          _action: 'student-enrollment',
          permissionName: 'Student.Enrollment',
          permission: 'Permission:StudentEnrollment',
          children: [
            {
              title: 'Dashboard',
              path: '/student/enrollment/dashboard',
              _action: 'student-enrollment-dashboard',
              permission: 'Permission:StudentEnrollment.Dashboard',
              permissionName: 'Student.Enrollment.Dashboard',
              shortcutKey: 'Alt+S+1',
              shortcutKeyName: 'Alt+S+1',
            },
            {
              title: 'Inquiry',
              path: '/student/enrollment/inquiry',
              _action: 'student-enrollment-inquiry',
              permission: 'Permission:StudentEnrollment.Inquiry',
              permissionName: 'Student.Enrollment.Inquiry',
              shortcutKey: 'Alt+S+2',
              shortcutKeyName: 'Alt+S+2',
            },
            {
              title: 'Issued Registration Form',
              path: '/student/enrollment/registration-form',
              _action: 'student-enrollment-registration-form',
              permission: 'Permission:StudentEnrollment.RegistrationForm',
              permissionName: 'Student.Enrollment.RegistrationForm',
              shortcutKey: 'Alt+S+3',
              shortcutKeyName: 'Alt+S+3',
            },
            {
              title: 'Registration',
              path: '/student/enrollment/registration',
              _action: 'student-enrollment-registration',
              permission: 'Permission:StudentEnrollment.Registration',
              permissionName: 'Student.Enrollment.Registration',
              shortcutKey: 'Alt+S+4',
              shortcutKeyName: 'Alt+S+4',
            },
            {
              title: 'Entrance Exam',
              path: '/student/enrollment/entrance-exam',
              _action: 'student-enrollment-entrance-exam',
              permission: 'Permission:StudentEnrollment.EntranceExam',
              permissionName: 'Student.Enrollment.EntranceExam',
              shortcutKey: 'Alt+S+5',
              shortcutKeyName: 'Alt+S+5',
            },
            {
              title: 'Follow-up',
              path: '/student/enrollment/follow-up',
              _action: 'student-enrollment-follow-up',
              permission: 'Permission:StudentEnrollment.FollowUp',
              permissionName: 'Student.Enrollment.FollowUp',
              shortcutKey: 'Alt+S+6',
              shortcutKeyName: 'Alt+S+6',
            },
            {
              title: 'Admission',
              path: '/student/enrollment/admission',
              _action: 'student-enrollment-admission',
              permission: 'Permission:StudentEnrollment.Admission',
              permissionName: 'Student.Enrollment.Admission',
              shortcutKey: 'Alt+S+7',
              shortcutKeyName: 'Alt+S+7',
            },
            {
              title: 'Reports',
              path: '/student/enrollment/reports',
              _action: 'student-enrollment-reports',
              permission: 'Permission:StudentEnrollment.Reports',
              permissionName: 'Student.Enrollment.Reports',
              shortcutKey: 'Alt+S+8',
              shortcutKeyName: 'Alt+S+8',
            },
            {
              title: 'Setting',
              path: '/student/enrollment/setting',
              _action: 'student-enrollment-setting',
              permission: 'Permission:StudentEnrollment.Setting',
              permissionName: 'Student.Enrollment.Setting',
              shortcutKey: 'Alt+S+9',
              shortcutKeyName: 'Alt+S+9',
            },
          ],
        },
        {
          title: 'Student Records',
          path: '',
          _action: 'student-records',
          shortcutKey: 'Alt+S+R',
          shortcutKeyName: 'Alt+S+R',
          children: [
            {
              title: 'Dashboard',
              path: '/student/overview',
              _action: 'student-overview',
              shortcutKey: 'Alt+S+R+1',
              shortcutKeyName: 'Alt+S+R+1',
            },
            {
              title: 'Student List',
              path: '/student/profile',
              _action: 'student-profile',
              shortcutKey: 'Alt+S+R+2',
              shortcutKeyName: 'Alt+S+R+2',
            },
            {
              title: 'Student I-Card',
              path: '/student/student-i-card',
              _action: 'student-i-card',
              disabled: true,
              caption: 'Coming Soon',
              shortcutKey: 'Alt+S+R+3',
              shortcutKeyName: 'Alt+S+R+3',
            },
            {
              title: 'Student Management',
              path: '/student/management',
              _action: 'student-management',
              shortcutKey: 'Alt+S+R+4',
              shortcutKeyName: 'Alt+S+R+4',
            },
            {
              title: 'Certificates',
              path: '/student/certificates',
              _action: 'student-certificates',
              shortcutKey: 'Alt+S+R+5',
              shortcutKeyName: 'Alt+S+R+5',
            },
            {
              title: 'Reports',
              path: '/student/reports',
              _action: 'student-reports',
              shortcutKey: 'Alt+S+R+6',
              shortcutKeyName: 'Alt+S+R+6',
            },
          ],
        },
        {
          title: 'Attendance',
          path: '',
          _action: 'student-attendance',
          children: [
            {
              title: 'Dashboard',
              path: '/student/attendance/dashboard',
              _action: 'student-attendance-dashboard',
              shortcutKey: 'Alt+S+A+1',
              shortcutKeyName: 'Alt+S+A+1',
            },
            {
              title: 'Take Attendance',
              path: '/student/attendance/take-attendance',
              _action: 'student-attendance-take-attendance',
              shortcutKey: 'Alt+S+A+2',
              shortcutKeyName: 'Alt+S+A+2',
            },
            {
              title: 'Leave & Absent',
              path: '/student/attendance/leave-absent',
              _action: 'student-attendance-leave-absent',
              shortcutKey: 'Alt+S+A+3',
              shortcutKeyName: 'Alt+S+A+3',
            },
            {
              title: 'Reports',
              path: '/student/attendance/reports',
              _action: 'student-attendance-reports',
              shortcutKey: 'Alt+S+A+4',
              shortcutKeyName: 'Alt+S+A+4',
            },
            {
              title: 'Setting',
              path: '/student/attendance/setting',
              _action: 'student-attendance-setting',
              shortcutKey: 'Alt+S+A+5',
              shortcutKeyName: 'Alt+S+A+5',
            },
          ],
        },
        {
          title: 'Notification',
          path: '/student/studentNotification',
          _action: 'notification',
          shortcutKey: 'Alt+S+N',
          shortcutKeyName: 'Alt+S+N',
        },
      ],
    },
  ],
};
const securityModule = {
  [securityPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/security/dashboard',
          _action: 'dashboard',
        },
        {
          title: 'Role And Permission',
          path: '',
          _action: 'role-and-permission',
          children: [
            {
              title: 'Role Management',
              path: '/security/role',
              _action: 'role',
              shortcutKey: 'Alt+R+1',
              shortcutKeyName: 'Alt+R+1',
            },
            {
              title: 'User Management',
              path: '/security/user',
              _action: 'user-management',
              shortcutKey: 'Alt+R+2',
              shortcutKeyName: 'Alt+R+2',
            },
            {
              title: 'Department',
              path: '/security/department',
              _action: 'department',
              shortcutKey: 'Alt+R+3',
              shortcutKeyName: 'Alt+R+3',
            },
          ],
        },
        {
          title: 'Visitor Management',
          path: '',
          _action: 'visitor-management',
          children: [
            {
              title: 'Visitor Checkpoint',
              path: '/security/visitor-management/visitor-check-in',
              _action: 'visitor-check-in',
            },
            {
              title: 'Visitor Pre Approval',
              path: '/security/visitor-management/visitor-pre-approval',
              _action: 'visitor-pre-approval',
            },
          ],
        },
        {
          title: 'Gate Pass Management',
          path: '',
          _action: 'gate-pass-management',
          children: [
            {
              title: 'Gate Pass System',
              path: '/security/gate-pass-management/gate-pass-system',
              _action: 'gate-pass-system',
            },
            {
              title: 'Access Logs Management',
              path: '/security/gate-pass-management/access-logs-management',
              _action: 'access-logs-management',
            },
            {
              title: 'Create Gate Pass',
              path: '/security/gate-pass-management/create-gate-pass',
              _action: 'create-gate-pass',
            },
            {
              title: 'Gate Pass Request',
              path: '/security/gate-pass-management/gate-pass',
              _action: 'gate-pass',
            },
            {
              title: 'Review Gate Pass Request',
              path: '/security/gate-pass-management/review-gate-pass-request',
              _action: 'review-gate-pass-request',
            },
            // {
            //   title: 'Access Logs Management Security',
            //   path: '/security/gate-pass-management/access-logs-management-security',
            //   _action: 'access-logs-management-security',
            // },
            {
              title: 'Gate Pass Request',
              path: '/security/gate-pass-management/gate-pass-staff',
              _action: 'gate-pass-staff',
            },
            {
              title: 'Review Gate Pass Request',
              path: '/security/gate-pass-management/review-gate-pass-staff',
              _action: 'review-gate-pass-staff',
            },
          ],
        },

        {
          title: 'Guard Management',
          path: '',
          _action: 'guard-management',
          children: [
            {
              title: 'Guard Assignment',
              path: '/security/guard-management/guard-assignment',
              _action: 'guard-assignment',
            },
            {
              title: 'My Duty Schedule',
              path: '/security/guard-management/duty-schedule',
              _action: 'duty-schedule',
            },
            {
              title: 'Guard Shift Configuration',
              path: '/security/guard-management/setting-configuration',
              _action: 'setting-configuration',
            },
            {
              title: 'Guard Duty Overview',
              path: '/security/guard-management/hand-over-notes',
              _action: 'hand-over-notes',
            },
          ],
        },

        {
          title: 'Alert',
          path: '',
          _action: 'alert',
          children: [
            {
              title: 'Live Security Alert',
              path: '/security/alert/live-security-alert',
              _action: 'live-security-alerts',
            },
            {
              title: 'Alert Dashboard',
              path: '/security/alert/alert-dashboard',
              _action: 'alert-dashboard',
            },
            {
              title: 'Alert Report',
              path: '/security/alert/alert-report',
              _action: 'alert-report',
            },
          ],
        },
        {
          title: 'Reports',
          path: '/security/reports',
          _action: 'reports',
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
          shortcutKey: 'Ctrl+B',
          shortcutKeyName: 'Ctrl+B',
        },
        {
          title: 'Academic Setup',
          path: '/setting/academic-setup',
          _action: 'academic-year-setup',
          shortcutKey: 'Ctrl+A',
          shortcutKeyName: 'Ctrl+A',
        },
        {
          title: 'Shift Management',
          path: '/setting/shift-management',
          _action: 'shift-management',
          shortcutKey: 'Ctrl+S',
          shortcutKeyName: 'Ctrl+S',
        },
      ],
    },
  ],
};

const hrModule = {
  [hrPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/hr/dashboard',
          _action: 'dashboard',
          shortcutKey: 'Alt+H+1',
          shortcutKeyName: 'Alt+H+1',
        },
        {
          title: 'Employee',
          path: '',
          _action: 'employee',
          shortcutKey: 'Alt+H+E',
          shortcutKeyName: 'Alt+H+E',
          children: [
            {
              title: 'Employee List',
              path: '/hr/employee',
              _action: 'employee',
              shortcutKey: 'Alt+H+E+1',
              shortcutKeyName: 'Alt+H+E+1',
            },
            {
              title: 'I-card',
              path: '/hr/i-card',
              _action: 'i-card',
              disabled: true,
              caption: 'Coming Soon',
              shortcutKey: 'Alt+H+E+2',
              shortcutKeyName: 'Alt+H+E+2',
            },
          ],
        },
        {
          title: 'Payroll Management',
          path: '',
          _action: 'payroll-management',
          shortcutKey: 'Alt+H+P',
          shortcutKeyName: 'Alt+H+P',
          disabled: true,
          caption: 'Coming Soon',
          children: [
            {
              title: 'Dashboard',
              path: '/hr/payroll/dashboard',
              _action: 'payroll-dashboard',
              shortcutKey: 'Alt+H+P+1',
              shortcutKeyName: 'Alt+H+P+1',
            },
            {
              title: 'Run Payroll',
              path: '/hr/payroll/run-payroll',
              _action: 'run-payroll',
              shortcutKey: 'Alt+H+P+2',
              shortcutKeyName: 'Alt+H+P+2',
            },
            {
              title: 'Generate Salary Slip',
              path: '/hr/payroll/generate-salary-slip',
              _action: 'generate-salary-slip',
              shortcutKey: 'Alt+H+P+3',
              shortcutKeyName: 'Alt+H+P+3',
            },
            {
              title: 'Settings',
              path: '/hr/payroll/setting',
              _action: 'payroll-setting',
              shortcutKey: 'Alt+H+P+4',
              shortcutKeyName: 'Alt+H+P+4',
            },
          ],
        },
        {
          title: 'Attendance and Leave Management',
          path: '',
          _action: 'attendance-and-leave-management',
          shortcutKey: 'Alt+H+A',
          shortcutKeyName: 'Alt+H+A',
          children: [
            {
              title: 'Import Attendance',
              path: '/hr/biometric-integration',
              _action: 'biometric-integration',
              shortcutKey: 'Alt+H+A+1',
              shortcutKeyName: 'Alt+H+A+1',
            },
            {
              title: 'Leave Requests and Approvals',
              path: '/hr/leave-requests',
              _action: 'leave-requests-and-approvals',
              shortcutKey: 'Alt+H+A+2',
              shortcutKeyName: 'Alt+H+A+2',
            },
            {
              title: 'Attendance Tracking',
              path: '/hr/attendance-tracking',
              _action: 'attendance-tracking',
              shortcutKey: 'Alt+H+A+3',
              shortcutKeyName: 'Alt+H+A+3',
            },
            {
              title: 'Setting',
              path: '/hr/attendance-setting',
              _action: 'setting',
              shortcutKey: 'Alt+H+A+4',
              shortcutKeyName: 'Alt+H+A+4',
            },
          ],
        },
        {
          title: 'Professional Management',
          path: '/hr/professional-management',
          _action: 'professional-management',
          disabled: true,
          caption: 'Coming Soon',
          shortcutKey: 'Alt+H+M',
          shortcutKeyName: 'Alt+H+M',
        },
        {
          title: 'Reports',
          path: '/hr/reports',
          _action: 'reports',
          shortcutKey: 'Alt+H+R',
          shortcutKeyName: 'Alt+H+R',
        },
        {
          title: 'Events & Holidays',
          _action: 'events-holidays',
          path: '/hr/events-holidays',
          shortcutKey: 'Alt+H+V',
          shortcutKeyName: 'Alt+H+V',
          // children: [
          //   {
          //     title: 'Create Events & Holidays',
          //     path: '/hr/events-holidays',
          //     _action: 'events-holidays',
          //     shortcutKey: 'Alt+H+V+1',
          //     shortcutKeyName: 'Alt+H+V+1',
          //   },
          //   {
          //     title: 'Requests',
          //     path: '/hr/events-holidays/request',
          //     _action: 'events-holidays-request',
          //     shortcutKey: 'Alt+H+V+2',
          //     shortcutKeyName: 'Alt+H+V+2',
          //   },
          // ],
        },
        {
          title: 'Notification',
          path: '/hr/hr-notification',
          _action: 'hr-notification',
        },

        {
          title: 'Setting',
          path: '/hr/setting',
          _action: 'hr-setting',
          shortcutKey: 'Alt+H+S',
          shortcutKeyName: 'Alt+H+S',
        },
      ],
    },
  ],
};

const academicModule = {
  [academicPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/academic/dashboard',
          _action: 'dashboard',
          shortcutKey: 'Alt+A+1',
          shortcutKeyName: 'Alt+A+1',
        },
        {
          title: 'Curriculum Management',
          path: '',
          _action: 'curriculum-management',
          shortcutKey: 'Alt+A+C',
          shortcutKeyName: 'Alt+A+C',
          children: [
            {
              title: 'Allocate Subject',
              path: '/academic/curriculumSubjects',
              _action: 'curriculum-management-subjects',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Allocate Elective Subjects',
              path: '/academic/assign-elective-subject',
              _action: 'assign-elective-subject',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Choose Elective Subjects',
              path: '/academic/choose-elective-subject',
              _action: 'assign-elective-subject',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Teacher-Subject Pairing',
              path: '/academic/teacher',
              _action: 'student-enrollment-teacher',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
            {
              title: 'Syllabus Management',
              path: '/academic/courseSubjects',
              _action: 'course-management-subjects',
              shortcutKey: 'Alt+A+S+1',
              shortcutKeyName: 'Alt+A+S+1',
            },
            {
              title: 'Resources',
              path: '/academic/learningResources',
              _action: 'course-management-learningResources',
              shortcutKey: 'Alt+A+S+2',
              shortcutKeyName: 'Alt+A+S+2',
            },
            {
              title: 'Syllabus Progress',
              path: '/academic/courseProgress',
              _action: 'course-management-courseProgress',
              shortcutKey: 'Alt+A+S+3',
              shortcutKeyName: 'Alt+A+S+3',
            },
            {
              title: 'Reports',
              path: '/academic/curriculumReports',
              _action: 'student-enrollment-reports',
              shortcutKey: 'Alt+A+C+3',
              shortcutKeyName: 'Alt+A+C+3',
            },
            {
              title: 'Setting',
              path: '/academic/curriculumSettings',
              _action: 'student-enrollment-settings',
              shortcutKey: 'Alt+A+C+4',
              shortcutKeyName: 'Alt+A+C+4',
            },
          ],
        },

        {
          title: 'Timetable Management',
          path: '',
          _action: 'timetable-schedule-management',
          shortcutKey: 'Alt+A+T',
          shortcutKeyName: 'Alt+A+T',
          children: [
            {
              title: 'New Timetable',
              path: '/academic/newTimetable',
              _action: 'timetable-schedule-management',
              shortcutKey: 'Alt+A+T+2',
              shortcutKeyName: 'Alt+A+T+2',
            },
            {
              title: 'Reports',
              path: '/academic/timetableReports',
              _action: 'timetable-schedule-management',
              shortcutKey: 'Alt+A+T+3',
              shortcutKeyName: 'Alt+A+T+3',
            },
            {
              title: 'Setting',
              path: '/academic/timetableSettings',
              _action: 'timetable-schedule-management',
              shortcutKey: 'Alt+A+T+4',
              shortcutKeyName: 'Alt+A+T+4',
            },
          ],
        },
        {
          title: 'Group Management',
          path: '',
          _action: 'group-management',
          disabled: true,
          shortcutKey: 'Alt+A+G',
          shortcutKeyName: 'Alt+A+G',
          children: [
            {
              title: 'Dashboard',
              path: '/academic/activityDashboard',
              _action: 'group-management-activityDashboard',
              shortcutKey: 'Alt+A+G+1',
              shortcutKeyName: 'Alt+A+G+1',
            },
            {
              title: 'Dynamic Group',
              path: '/academic/dynamicGroup',
              _action: 'group-management-dynamicGroup',
              shortcutKey: 'Alt+A+G+2',
              shortcutKeyName: 'Alt+A+G+2',
            },
            {
              title: 'Activity Management',
              path: '/academic/activityManagement',
              _action: 'group-management-activityManagement',
              shortcutKey: 'Alt+A+G+3',
              shortcutKeyName: 'Alt+A+G+3',
            },
            {
              title: 'Student Group',
              path: '/academic/studentGroup',
              _action: 'group-management-studentGroup',
              shortcutKey: 'Alt+A+G+4',
              shortcutKeyName: 'Alt+A+G+4',
            },
          ],
        },
        {
          title: 'Learning Management System (LMS)',
          path: '/academic/learning-management-system',
          _action: 'learning-management-system',
          disabled: true,
          shortcutKey: 'Alt+A+L',
          shortcutKeyName: 'Alt+A+L',
          children: [
            {
              title: 'Dashboard',
              path: '/academic/lmsDashboard',
              _action: 'learning-management-system-lmsDashboard',
              shortcutKey: 'Alt+A+L+1',
              shortcutKeyName: 'Alt+A+L+1',
            },
            {
              title: 'Course',
              path: '/academic/course',
              _action: 'learning-management-system-course',
              shortcutKey: 'Alt+A+L+2',
              shortcutKeyName: 'Alt+A+L+2',
            },
            {
              title: 'Student Progress Tracking',
              path: '/academic/studentProgressTracking',
              _action: 'learning-management-system-studentProgressTracking',
              shortcutKey: 'Alt+A+L+3',
              shortcutKeyName: 'Alt+A+L+3',
            },
            {
              title: 'Content Library',
              path: '/academic/contentLibrary',
              _action: 'learning-management-system-contentLibrary',
              shortcutKey: 'Alt+A+L+4',
              shortcutKeyName: 'Alt+A+L+4',
            },
            {
              title: 'Reports And Analytics',
              path: '/academic/reportsAndAnalytics',
              _action: 'learning-management-system-reportsAndAnalytics',
              shortcutKey: 'Alt+A+L+5',
              shortcutKeyName: 'Alt+A+L+5',
            },
            {
              title: 'Settings',
              path: '/academic/lmsSettings',
              _action: 'learning-management-system-settings',
              shortcutKey: 'Alt+A+L+6',
              shortcutKeyName: 'Alt+A+L+6',
            },
          ],
        },
        {
          title: 'Homework & Assignment',
          path: '/academic/homework-assignment-management',
          _action: 'homework-assignment-management',
          shortcutKey: 'Alt+A+H',
          shortcutKeyName: 'Alt+A+H',
          children: [
            {
              title: 'Add Homework/Assignment',
              path: '/academic/homeworkCreation',
              _action: 'homework-assignment-management-homeworkCreation',
              shortcutKey: 'Alt+A+H+2',
              shortcutKeyName: 'Alt+A+H+2',
            },
            {
              title: 'Add Marks/Feedback',
              path: '/academic/gradingAndFeedback',
              _action: 'homework-assignment-management-gradingAndFeedback',
              shortcutKey: 'Alt+A+H+3',
              shortcutKeyName: 'Alt+A+H+3',
            },
            {
              title: 'My Submission',
              path: '/academic/mySubmission',
              _action: 'homework-assignment-management-mySubmission',
              shortcutKey: 'Alt+A+H+4',
              shortcutKeyName: 'Alt+A+H+4',
            },
            {
              title: 'Setting',
              path: '/academic/homeworkSettings',
              _action: 'homework-assignment-management-settings',
              shortcutKey: 'Alt+A+H+4',
              shortcutKeyName: 'Alt+A+H+4',
            },
          ],
        },
        {
          title: 'Assign ClassTeacher',
          path: '/academic/assignTeacher',
          _action: 'assign-teacher',
          shortcutKey: 'Alt+A+Z',
          shortcutKeyName: 'Alt+A+Z',
        },
        {
          title: 'Examination',
          path: '',
          _action: 'examination',
          shortcutKey: 'Alt+E+1',
          shortcutKeyName: 'Alt+E+1',
          children: [
            {
              title: 'Schedule Exam',
              path: '/academic/scheduleExam',
              _action: 'academic-scheduleExam',
              shortcutKey: 'Alt+E+1+2',
              shortcutKeyName: 'Alt+E+1+2',
            },
            {
              title: 'Grade Entry',
              path: '/academic/gradeEntry',
              _action: 'academic-gradeEntry',
              shortcutKey: 'Alt+E+1+3',
              shortcutKeyName: 'Alt+E+1+3',
            },
            {
              title: 'Quiz Management',
              path: '/academic/quizManagement',
              _action: 'academic-quizManagement',
              shortcutKey: 'Alt+E+1+5',
              shortcutKeyName: 'Alt+E+1+5',
            },
            {
              title: 'Settings',
              path: '/academic/settings',
              _action: 'academic-settings',
              shortcutKey: 'Alt+E+1+7',
              shortcutKeyName: 'Alt+E+1+7',
            },
          ],
        },
      ],
    },
  ],
};

const communicationModule = {
  [communicationPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/communication/dashboard',
          _action: 'dashboard',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
        },
        {
          title: 'Conversation',
          path: '/communication/messages',
          _action: 'conversation',
          shortcutKey: 'Alt+C+M',
          shortcutKeyName: 'Alt+C+M',
        },
        {
          title: 'Announcements',
          path: '/communication/announcement',
          _action: 'announcement',
          shortcutKey: 'Alt+C+A',
          shortcutKeyName: 'Alt+C+A',
          children: [
            {
              title: 'School Wise Announsement',
              path: '/communication/announcement/schoolWiseAnnounsement',
              _action: 'announcement-schoolWiseAnnounsement',
              shortcutKey: 'Alt+C+A+1',
              shortcutKeyName: 'Alt+C+A+1',
            },
            {
              title: 'Class Wise Announcement',
              path: '/communication/announcement/classSpecificAnnouncement',
              _action: 'announcement-classSpecificAnnouncement',
              shortcutKey: 'Alt+C+A+2',
              shortcutKeyName: 'Alt+C+A+2',
            },
          ],
        },
        {
          title: 'Events',
          path: '/communication/eventsAndCalendar',
          _action: 'eventsAndCalendar',
          shortcutKey: 'Alt+C+E',
          shortcutKeyName: 'Alt+C+E',
          children: [
            {
              title: 'All Events',
              path: '/communication/eventsAndCalendar/allEvents',
              _action: 'eventsAndCalendar-allEvents',
              shortcutKey: 'Alt+C+E+1',
              shortcutKeyName: 'Alt+C+E+1',
            },
            {
              title: 'Upcoming Events',
              path: '/communication/eventsAndCalendar/upcomingEvents',
              _action: 'eventsAndCalendar-upcomingEvents',
              shortcutKey: 'Alt+C+E+2',
              shortcutKeyName: 'Alt+C+E+2',
            },
            {
              title: 'Event Archieves',
              path: '/communication/eventsAndCalendar/eventArchieves',
              _action: 'eventsAndCalendar-eventArchieves',
              shortcutKey: 'Alt+C+E+3',
              shortcutKeyName: 'Alt+C+E+3',
            },
          ],
        },
        {
          title: 'Feedback & Survey',
          path: '/communication/feedbackAndSurvey',
          _action: 'feedbackAndSurvey',
          shortcutKey: 'Alt+C+F',
          shortcutKeyName: 'Alt+C+F',
          children: [
            {
              title: 'Scheduled Survey',
              path: '/communication/feedbackAndSurvey/scheduledSurvey',
              _action: 'feedbackAndSurvey-scheduledSurvey',
              shortcutKey: 'Alt+C+F+1',
              shortcutKeyName: 'Alt+C+F+1',
            },
            {
              title: 'Active Survey',
              path: '/communication/feedbackAndSurvey/activeSurvey',
              _action: 'feedbackAndSurvey-activeSurvey',
              shortcutKey: 'Alt+C+F+2',
              shortcutKeyName: 'Alt+C+F+2',
            },
            {
              title: 'Past Survey',
              path: '/communication/feedbackAndSurvey/pastSurvey',
              _action: 'feedbackAndSurvey-pastSurvey',
              shortcutKey: 'Alt+C+F+3',
              shortcutKeyName: 'Alt+C+F+3',
            },
          ],
        },
        {
          title: 'Meetings',
          path: '/communication/meetings',
          _action: 'meetings',
          shortcutKey: 'Alt+C+T',
          shortcutKeyName: 'Alt+C+T',
        },
        {
          title: 'Notification',
          path: '/communication/notification',
          _action: 'notification',
          shortcutKey: 'Alt+C+N',
          shortcutKeyName: 'Alt+C+N',
        },
        {
          title: 'Notification History',
          path: '/communication/notification-history',
          _action: 'notification-history',
          shortcutKey: 'Alt+C+H',
          shortcutKeyName: 'Alt+C+H',
        },
        {
          title: 'Settings',
          path: '/communication/settings',
          _action: 'settings',
          shortcutKey: 'Alt+C+S',
          shortcutKeyName: 'Alt+C+S',
          children: [
            {
              title: 'Notification Setting',
              path: '/communication/settings/notificationSetting',
              _action: 'settings-notificationSetting',
              shortcutKey: 'Alt+C+S+1',
              shortcutKeyName: 'Alt+C+S+1',
            },
            {
              title: 'User Preferences',
              path: '/communication/settings/userPreferences',
              _action: 'settings-userPreferences',
              shortcutKey: 'Alt+C+S+2',
              shortcutKeyName: 'Alt+C+S+2',
            },
            {
              title: 'Announcement',
              path: '/communication/settings/announcement',
              _action: 'settings-announcement',
              shortcutKey: 'Alt+C+S+3',
              shortcutKeyName: 'Alt+C+S+3',
            },
            {
              title: 'Event Type',
              path: '/communication/settings/eventType',
              _action: 'settings-eventType',
              shortcutKey: 'Alt+C+S+4',
              shortcutKeyName: 'Alt+C+S+4',
            },
          ],
        },
      ],
    },
  ],
};

const financeModule = {
  [financePath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/finance/dashboard',
          _action: 'finance-dashboard',
          shortcutKey: 'Alt+F+1',
          shortcutKeyName: 'Alt+F+1',
        },
        {
          title: 'Fee Management',
          path: '',
          _action: 'fee-management',
          shortcutKey: 'Alt+F+2',
          shortcutKeyName: 'Alt+F+2',
          children: [
            {
              title: 'Fee Structure Overview',
              path: '/finance/fee-management/fee-structure-overview',
              _action: 'fee-structure-overview',
              shortcutKey: 'Alt+F+3',
              shortcutKeyName: 'Alt+F+3',
            },
            {
              title: 'Student Fee Structure',
              path: '/finance/fee-management/student-fee-strcuture',
              _action: 'student-fee-strcuture',
              shortcutKey: 'Alt+F+4',
              shortcutKeyName: 'Alt+F+4',
            },
          ],
        },
        {
          title: 'Fee Collection',
          path: '/finance/fee-collection',
          _action: 'fee-collection',
          shortcutKey: 'Alt+F+3',
          shortcutKeyName: 'Alt+F+3',
        },
        {
          title: 'Fee Refund',
          path: '/finance/fee-refund',
          _action: 'fee-refund',
          shortcutKey: 'Alt+F+4',
          shortcutKeyName: 'Alt+F+4',
        },
        {
          title: 'Reconciliation',
          path: '',
          _action: 'reconciliation',
          shortcutKey: 'Alt+F+5',
          shortcutKeyName: 'Alt+F+5',
          children: [
            {
              title: 'Cheque Transactions',
              path: '/finance/reconciliation/payment-by-cheque',
              _action: 'payment-by-cheque',
            },
            {
              title: 'Bounced Cheque',
              path: '/finance/reconciliation/bounce-cheque',
              _action: 'bounce-cheque',
              shortcutKey: 'Alt+F+6',
              shortcutKeyName: 'Alt+F+6',
            },
            {
              title: 'Cleared Cheque',
              path: '/finance/reconciliation/cleared-cheque',
              _action: 'payment-by-cheque',
            },
          ],
        },
        {
          title: 'Income Tracking',
          path: '/finance/income-tracking',
          _action: 'finance-income-tracking',
          shortcutKey: 'Alt+F+6',
          shortcutKeyName: 'Alt+F+6',
        },
        {
          title: 'Expense Tracking',
          path: '/finance/expense-tracking',
          _action: 'finance-expense-tracking',
          shortcutKey: 'Alt+F+7',
          shortcutKeyName: 'Alt+F+7',
        },
        {
          title: 'Budgeting',
          path: '/finance/budgeting',
          _action: 'finance-budget',
          shortcutKey: 'Alt+F+8',
          shortcutKeyName: 'Alt+F+8',
        },
        {
          title: 'Reports',
          path: '/finance/reports',
          _action: 'finance-reports',
          shortcutKey: 'Alt+F+9',
          shortcutKeyName: 'Alt+F+9',
        },
        {
          title: 'Notification',
          path: '/finance/finance-notification',
          _action: 'finance-notification',
          shortcutKey: 'Alt+F+N',
          shortcutKeyName: 'Alt+F+N',
        },
        {
          title: 'Setting',
          path: '',
          _action: 'finance-settings',
          shortcutKey: 'Alt+F+S',
          shortcutKeyName: 'Alt+F+S',
          children: [
            {
              title: 'General Setting',
              path: '/finance/settings/general',
              _action: 'general-setting',
              shortcutKey: 'Alt+F+S+1',
              shortcutKeyName: 'Alt+F+S+1',
            },
            {
              title: 'Receipt Book',
              path: '/finance/settings/receipt-book',
              _action: 'receipt-book',
              shortcutKey: 'Alt+F+S+2',
              shortcutKeyName: 'Alt+F+S+2',
            },
            {
              title: 'Create Fee Structure',
              path: '/finance/settings/create-fee-structure',
              _action: 'fee-structure-setting',
              shortcutKey: 'Alt+F+S+3',
              shortcutKeyName: 'Alt+F+S+3',
            },
            {
              title: 'Receipt Templates',
              path: '/finance/settings/create-receipt',
              _action: 'create-receipt',
              shortcutKey: 'Alt+F+S+4',
              shortcutKeyName: 'Alt+F+S+4',
            },
            // {
            //   title: 'Tax Setting',
            //   path: '/finance/settings/tax-setting',
            //   _action: 'tax-setting',
            //   shortcutKey: 'Alt+F+S+5',
            //   shortcutKeyName: 'Alt+F+S+5',
            // },
            // {
            //   title: 'Payment Method',
            //   path: '/finance/settings/payment-method-setting',
            //   _action: 'payment-method-setting',
            //   shortcutKey: 'Alt+F+S+6',
            //   shortcutKeyName: 'Alt+F+S+6',
            // },
            // {
            //   title: 'Bounce Cheque Charges',
            //   path: '/finance/settings/bounce-cheque-charges-setting',
            //   _action: 'bounce-cheque-charges-setting',
            //   shortcutKey: 'Alt+F+S+7',
            //   shortcutKeyName: 'Alt+F+S+7',
            // },
            // {
            //   title: 'Notification',
            //   path: '/finance/settings/notification-setting',
            //   _action: 'notification-setting',
            //   shortcutKey: 'Alt+F+S+8',
            //   shortcutKeyName: 'Alt+F+S+8',
            // },
          ],
        },
      ],
    },
  ],
};
const libraryModule = {
  [libraryPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/library/dashboard',
          _action: 'library-dashboard',
          shortcutKey: 'Alt+L+1',
          shortcutKeyName: 'Alt+L+1',
        },
        {
          title: 'Book Management',
          path: '/library/book-management',
          _action: 'book-management',
          shortcutKey: 'Alt+L+2',
          shortcutKeyName: 'Alt+L+2',
        },
        {
          title: 'Member Management',
          path: '/library/member-management',
          _action: 'member-management',
          shortcutKey: 'Alt+L+3',
          shortcutKeyName: 'Alt+L+3',
        },
        {
          title: 'Circulation',
          path: '',
          _action: 'circulation',
          shortcutKey: 'Alt+L+4',
          shortcutKeyName: 'Alt+L+4',
          children: [
            {
              title: 'Reservations Management',
              path: '/library/circulation/reservation-management',
              _action: 'reservation-management',
              shortcutKey: 'Alt+L+5',
              shortcutKeyName: 'Alt+L+5',
            },
            {
              title: 'Fines Management',
              path: '/library/circulation/fine-management',
              _action: 'reservation-management',
              shortcutKey: 'Alt+L+5',
              shortcutKeyName: 'Alt+L+5',
            },
          ],
        },
        {
          title: 'Reports',
          path: '/library/reports',
          _action: 'library-reports',
          shortcutKey: 'Alt+L+5',
          shortcutKeyName: 'Alt+L+5',
        },
        {
          title: 'Setting',
          path: '',
          _action: 'library-settings',
          shortcutKey: 'Alt+L+S',
          shortcutKeyName: 'Alt+L+S',
          children: [
            {
              title: 'General Setting',
              path: '/library/settings/general-setting',
              _action: 'general-setting',
              shortcutKey: 'Alt+L+S+1',
              shortcutKeyName: 'Alt+L+S+1',
            },
            {
              title: 'Notification Setting',
              path: '/library/settings/notification-setting',
              _action: 'notification-setting',
              shortcutKey: 'Alt+L+S+2',
              shortcutKeyName: 'Alt+L+S+2',
            },
          ],
        },
      ],
    },
  ],
};
const transportModule = {
  [transportPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/transport/dashboard',
          _action: 'transport-dashboard',
          shortcutKey: 'Alt+T+1',
          shortcutKeyName: 'Alt+T+1',
        },
        {
          title: 'Route Management',
          path: '/transport/routes-schedules',
          _action: 'routes-schedules',
          shortcutKey: 'Alt+T+2',
          shortcutKeyName: 'Alt+T+2',
        },
        {
          title: 'Vehicle Management',
          path: '/transport/vehicle-management',
          _action: 'vehicle-management',
          shortcutKey: 'Alt+T+3',
          shortcutKeyName: 'Alt+T+3',
        },
        {
          title: 'Route Allocation',
          path: '/transport/member-transport',
          _action: 'member-transport',
          shortcutKey: 'Alt+T+4',
          shortcutKeyName: 'Alt+T+4',
        },
        // {
        //   title: 'Driver Management',
        //   path: '/transport/driver-management',
        //   _action: 'driver-management',
        //   shortcutKey: 'Alt+T+5',
        //   shortcutKeyName: 'Alt+T+5',
        // },
        {
          title: 'Reports',
          path: '/transport/reports-analytics',
          _action: 'reports-analytics',
          shortcutKey: 'Alt+T+6',
          shortcutKeyName: 'Alt+T+6',
        },
        {
          title: 'Notification',
          path: '/transport/transport-notification',
          _action: 'transport-notification',
        },
        {
          title: 'Settings',
          path: '/transport/settings',
          _action: 'settings',
          shortcutKey: 'Alt+T+S',
          shortcutKeyName: 'Alt+T+S',
        },
      ],
    },
  ],
};

const hostelModule = {
  [hostelPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/hostel/dashboard',
          _action: 'hostel-dashboard',
          shortcutKey: 'Alt+H+1',
          shortcutKeyName: 'Alt+H+1',
        },
        {
          title: 'New Request',
          path: '/hostel/newRequest',
          _action: 'hostel-new-request',
          shortcutKey: 'Alt+H+1',
          shortcutKeyName: 'Alt+H+1',
        },
        {
          title: 'Hostel Management',
          path: '',
          _action: 'hostel-configuration',
          shortcutKey: 'Alt+H+2',
          shortcutKeyName: 'Alt+H+2',
          children: [
            {
              title: 'Hostel Configuration',
              path: '/hostel/hostel-management',
              _action: 'hostel-management',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Room Configuration',
              path: '/hostel/room-configuration',
              _action: 'room-configuration',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Setting',
              path: '/hostel/setting',
              _action: 'hostel-setting',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
          ],
        },
        {
          title: 'Room Allocation to Students',
          path: '/hostel/student-allocation',
          _action: 'hostel-student-allocation',
          shortcutKey: 'Alt+H+3',
          shortcutKeyName: 'Alt+H+3',
        },
        {
          title: 'Fee Management',
          path: '',
          _action: 'hostel-fee-management',
          shortcutKey: 'Alt+H+4',
          shortcutKeyName: 'Alt+H+4',
          children: [
            {
              title: 'Fee Collection',
              path: '/hostel/fee-management',
              _action: 'hostel-fee-collection',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Fee Setting',
              path: '/hostel/fee-setting',
              _action: 'hostel-fee-setting',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
          ],
        },
        {
          title: 'Attendance And Leave Management',
          path: '',
          _action: 'hostel-attendance-leave-management',
          shortcutKey: 'Alt+H+4',
          shortcutKeyName: 'Alt+H+4',
          children: [
            {
              title: 'Attendance',
              path: '/hostel/attendance',
              _action: 'hostel-attendance',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Leave And Approve',
              path: '/hostel/leave-approve',
              _action: 'hostel-leave-approve',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
            {
              title: 'Gate Verification',
              path: '/hostel/gate-verification',
              _action: 'hostel-gate-verification',
              shortcutKey: 'Alt+A+C+3',
              shortcutKeyName: 'Alt+A+C+3',
            },
            {
              title: 'Setting',
              path: '/hostel/attendanceSetting',
              _action: 'hostel-setting',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
          ],
        },
        {
          title: 'Visitor Entry Management',
          path: '',
          _action: 'hostel-visitor-entry-management',
          shortcutKey: 'Alt+H+4',
          shortcutKeyName: 'Alt+H+4',
          children: [
            {
              title: 'Log Visitor',
              path: '/hostel/log-visitor',
              _action: 'hostel-log-visitor',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Pre Register Visitor',
              path: '/hostel/pre-register-visitor',
              _action: 'hostel-pre-register-visitor',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
          ],
        },
        {
          title: 'Disciplinary Actions Tracking & Management',
          path: '',
          _action: 'hostel-disciplinary-actions',
          shortcutKey: 'Alt+H+4',
          shortcutKeyName: 'Alt+H+4',
          children: [
            {
              title: 'Log Disciplinary Incident',
              path: '/hostel/log-disciplinary-incident',
              _action: 'hostel-log-disciplinary-incident',
              shortcutKey: 'Alt+A+C+1',
              shortcutKeyName: 'Alt+A+C+1',
            },
            {
              title: 'Archieved Incident',
              path: '/hostel/archived-incident',
              _action: 'hostel-archived-incident',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
            {
              title: 'Setting',
              path: '/hostel/disciplineSetting',
              _action: 'hostel-discipline-setting',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
          ],
        },
        {
          title: 'Maintenance',
          path: '',
          _action: 'hostel-maintenance',
          shortcutKey: 'Alt+H+5',
          shortcutKeyName: 'Alt+H+5',
          children: [
            {
              title: 'Safety Management',
              path: '/hostel/maintenance/saftey-management',
              _action: 'saftey-management',
              shortcutKey: 'Alt+A+C+3',
              shortcutKeyName: 'Alt+A+C+3',
            },
            {
              title: 'Setting',
              path: '/hostel/maintenance/setting',
              _action: 'hostel-setting',
              shortcutKey: 'Alt+A+C+2',
              shortcutKeyName: 'Alt+A+C+2',
            },
          ],
        },
        {
          title: 'Catering Management',
          path: '',
          _action: 'catering-management',
          children: [
            {
              title: 'Weekly Menu Planning',
              path: '/hostel/catering-management/weekly-menu-planning',
              _action: 'weekly-menu-planning',
            },
            // {
            //   title: 'Feedback Analytics',
            //   path: '/hostel/catering-management/feedback-analytics',
            //   _action: 'feedback-analytics',
            // },
            {
              title: 'Settings',
              path: '/hostel/catering-management/settings',
              _action: 'settings',
            },
          ],
        },
        {
          title: 'Reporting & Analytics',
          path: '/hostel/reporting-analytics',
          _action: 'hostel-reporting-analytics',
          shortcutKey: 'Alt+H+6',
          shortcutKeyName: 'Alt+H+6',
        },
        {
          title: 'Settings',
          path: '/hostel/settings',
          _action: 'hostel-settings',
          shortcutKey: 'Alt+H+7',
          shortcutKeyName: 'Alt+H+7',
        },
        {
          title: 'Notification',
          path: '/hostel/hostel-notification',
          _action: 'notification',
          shortcutKey: 'Alt+S+N',
          shortcutKeyName: 'Alt+S+N',
        },
      ],
    },
  ],
};

const resourceManagement = {
  [resourceManagementPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/resourceManagement/dashboard',
          _action: 'dashboard',
        },
        {
          title: 'Inventory Management',
          path: '/resourceManagement/inventory-management',
          _action: 'inventory-management',
        },
        {
          title: 'My Resources',
          path: '/resourceManagement/my-resources',
          _action: 'my-resources',
        },
        {
          title: 'My Resource Query',
          path: '/resourceManagement/my-resources-request',
          _action: 'my-resources-request',
        },
        {
          title: 'Review Resource Request',
          path: '/resourceManagement/review-resource-request',
          _action: 'review-resource-request',
        },
        {
          title: 'Order Request',
          path: '/resourceManagement/order-management',
          _action: 'order-management',
        },
        {
          title: 'Maintenance Request',
          path: '/resourceManagement/maintenance-request',
          _action: 'maintenance-request',
        },
        {
          title: 'Disposed Resources',
          path: '/resourceManagement/disposed-resource',
          _action: 'disposed-resource',
        },
        {
          title: 'Resource Allocation',
          path: '/resourceManagement/resource-allocation',
          _action: 'resource-allocation',
          children: [
            {
              title: 'Resource Allocation',
              path: '/resourceManagement/resource-allocation/allocation-of-resources',
              _action: 'allocation-of-resources',
            },
            {
              title: 'Assigned Resources',
              path: '/resourceManagement/resource-allocation/assigned-resource',
              _action: 'assigned-resource',
            },
          ],
        },
        // {
        //   title: 'Classroom & Facilities',
        //   path: '/resourceManagement/classroom-facilities',
        //   _action: 'classroom-facilities',
        // },
        // {
        //   title: 'Booking Management',
        //   path: '/resourceManagement/booking-management',
        //   _action: 'classroom-facilities',
        //   children: [
        //     {
        //       title: 'Book Resource',
        //       path: '/resourceManagement/booking-management/booking',
        //       _action: 'booking',
        //     },
        //     {
        //       title: 'Manage Booking',
        //       path: '/resourceManagement/booking-management/manage-request',
        //       _action: 'manage-request',
        //     },
        //   ],
        // },
        {
          title: 'Procurement & Vendors',
          path: '/resourceManagement/procurement-vendors',
          _action: 'procurement-vendors',
          children: [
            {
              title: 'Procurement Request',
              path: '/resourceManagement/procurement-vendors/procurement-request',
              _action: 'allocation-of-resources',
            },
            {
              title: 'Request Review & Approval',
              path: '/resourceManagement/procurement-vendors/manage-request',
              _action: 'allocation-of-resources',
            },
          ],
        },
        {
          title: 'Report Loss / Damage ',
          path: '/resourceManagement/report-loss-damage',
          _action: 'report-loss-damage',
        },

        {
          title: 'Incident Report',
          path: '/resourceManagement/incident-report',
          _action: 'incident-report',
        },
        {
          title: 'Audit & Verification',
          path: '/resourceManagement/audit-verification',
          _action: 'audit-verification',
        },
        // {
        //   title: 'Usage & Maintenance',
        //   path: '/resourceManagement/usage-maintenance',
        //   _action: 'usage-maintenance',
        // },
        {
          title: 'Reports & Analytics',
          path: '/resourceManagement/reports-analytics',
          _action: 'reports-analytics',
        },
        // {
        //   title: 'Documentation',
        //   path: '/resourceManagement/documentation',
        //   _action: 'documentation',
        // },
        {
          title: 'Settings',
          path: '/resourceManagement/settings',
          _action: 'settings',
          children: [
            {
              title: 'Resource Category',
              path: '/resourceManagement/settings/resource-category',
              _action: 'resource-category',
            },
            {
              title: 'Resource Sub Category',
              path: '/resourceManagement/settings/resource-sub-category',
              _action: 'resource-sub-category',
            },
            {
              title: 'Vendor Configuration',
              path: '/resourceManagement/settings/vendor-configuration',
              _action: 'vendor-configuration',
            },
            {
              title: 'Resource Condition Status',
              path: '/resourceManagement/settings/resource-condition-status',
              _action: 'resource-condition-status',
            },
            {
              title: 'Resource Status',
              path: '/resourceManagement/settings/resource-status',
              _action: 'resource-status',
            },
            {
              title: 'Measurement Unit',
              path: '/resourceManagement/settings/measurement-unit',
              _action: 'measurement-unit',
            },
          ],
        },
      ],
    },
  ],
};

const securityGuardModule = {
  [securityGuardPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/security-guard/dashboard',
          _action: 'dashboard',
        },

        {
          title: 'Visitor Management',
          path: '',
          _action: 'visitor-management',
          children: [
            {
              title: 'Visitor Checkpoint',
              path: '/security-guard/visitor-management/visitor-check-in',
              _action: 'visitor-check-in',
            },
            {
              title: 'Visitor Pre Approval',
              path: '/security-guard/visitor-management/visitor-pre-approval',
              _action: 'visitor-pre-approval',
            },
          ],
        },
        {
          title: 'Gate Pass Management',
          path: '',
          _action: 'gate-pass-management',
          children: [
            // {
            //   title: 'Gate Pass System',
            //   path: '/security-guard/gate-pass-management/gate-pass-system',
            //   _action: 'gate-pass-system',
            // },
            {
              title: 'Access Logs',
              path: '/security-guard/gate-pass-management/access-logs-management',
              _action: 'access-logs-management',
            },
            {
              title: 'Create Gate Pass',
              path: '/security-guard/gate-pass-management/create-gate-pass',
              _action: 'create-gate-pass',
            },
            {
              title: 'Gate Pass Request',
              path: '/security-guard/gate-pass-management/gate-pass',
              _action: 'gate-pass',
            },
            {
              title: 'Review Gate Pass Request',
              path: '/security-guard/gate-pass-management/review-gate-pass-request',
              _action: 'review-gate-pass-request',
            },
            // {
            //   title: 'Access Logs Management security-guard',
            //   path: '/security-guard/gate-pass-management/access-logs-management-security-guard',
            //   _action: 'access-logs-management-security-guard',
            // },
            {
              title: 'Gate Pass Request',
              path: '/security-guard/gate-pass-management/gate-pass-staff',
              _action: 'gate-pass-staff',
            },
            {
              title: 'Review Gate Pass Request',
              path: '/security-guard/gate-pass-management/review-gate-pass-staff',
              _action: 'review-gate-pass-staff',
            },
          ],
        },

        {
          title: 'Guard Management',
          path: '',
          _action: 'guard-management',
          children: [
            {
              title: 'Guard Assignment',
              path: '/security-guard/guard-management/guard-assignment',
              _action: 'guard-assignment',
            },
            {
              title: 'My Duty Schedule',
              path: '/security-guard/guard-management/duty-schedule',
              _action: 'duty-schedule',
            },
            {
              title: 'Guard Shift Configuration',
              path: '/security-guard/guard-management/setting-configuration',
              _action: 'setting-configuration',
            },
            {
              title: 'Guard Duty Overview',
              path: '/security-guard/guard-management/hand-over-notes',
              _action: 'hand-over-notes',
            },
          ],
        },

        {
          title: 'Alert',
          path: '',
          _action: 'alert',
          children: [
            {
              title: 'Live Security Alert',
              path: '/security-guard/alert/live-security-alert',
              _action: 'live-security-alerts',
            },
            {
              title: 'Alert Dashboard',
              path: '/security-guard/alert/alert-dashboard',
              _action: 'alert-dashboard',
            },
            {
              title: 'Alert Report',
              path: '/security-guard/alert/alert-report',
              _action: 'alert-report',
            },
          ],
        },
        {
          title: 'Reports',
          path: '/security-guard/reports',
          _action: 'reports',
        },
      ],
    },
  ],
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
        path: '/student/enrollment/dashboard',
        icon: ICONS.student,
        _action: 'student',
        shortcutKey: 'Alt+S',
        shortcutKeyName: 'Alt+S',
        submodule: studentModule[studentPath].flatMap((list) => list.items),
      },
      {
        title: 'Academic & Assignment',
        path: '/academic/dashboard',
        icon: ICONS.academic,
        _action: 'academic',
        shortcutKey: 'Alt+A',
        shortcutKeyName: 'Alt+A',
        submodule: academicModule[academicPath].flatMap((list) => list.items),
      },
      {
        title: 'HR/Staff',
        path: '/hr/dashboard',
        icon: ICONS.hr,
        _action: 'hr',
        shortcutKey: 'Alt+H',
        shortcutKeyName: 'Alt+H',
        submodule: hrModule[hrPath].flatMap((list) => list.items),
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
        title: 'Security Gaurd',
        path: '/security-guard/dashboard',
        icon: ICONS.security,
        _action: 'security-guard',

        submodule: securityGuardModule[securityGuardPath].flatMap((list) => list.items),
      },
    ],
  },
];
export const navSubData = (isDdvs: boolean) => ({
  ...studentModule,
  ...securityModule,
  ...settingModule,
  ...hrModule,
  ...academicModule,
  ...hostelModule,
  ...financeModule,
  ...transportModule,
  ...communicationModule,
  ...libraryModule,
  ...resourceManagement,
  ...securityGuardModule,
});
