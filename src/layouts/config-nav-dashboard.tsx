import {
  hrPath,
  financePath,
  studentPath,
  settingPath,
  libraryPath,
  securityPath,
  academicPath,
  transportPath,
  examinationPath,
  communicationPath,
} from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
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
          permission: 'Permission:StudentEnrollment',
          children: [
            {
              title: 'Dashboard',
              path: '/student/enrollment/dashboard',
              _action: 'student-enrollment-dashboard',
              permission: 'Permission:StudentEnrollment.Dashboard',
            },
            {
              title: 'Inquiry',
              path: '/student/enrollment/inquiry',
              _action: 'student-enrollment-inquiry',
              permission: 'Permission:StudentEnrollment.Inquiry',
            },
            {
              title: 'Registration Form Details',
              path: '/student/enrollment/registration-form',
              _action: 'student-enrollment-registration-form',
              permission: 'Permission:StudentEnrollment.RegistrationForm',
            },
            {
              title: 'Registration',
              path: '/student/enrollment/registration',
              _action: 'student-enrollment-registration',
              permission: 'Permission:StudentEnrollment.Registration',
            },
            {
              title: 'Entrance Exam',
              path: '/student/enrollment/entrance-exam',
              _action: 'student-enrollment-entrance-exam',
              permission: 'Permission:StudentEnrollment.EntranceExam',
            },
            {
              title: 'Follow-up',
              path: '/student/enrollment/follow-up',
              _action: 'student-enrollment-follow-up',
              permission: 'Permission:StudentEnrollment.FollowUp',
            },
            {
              title: 'Admission',
              path: '/student/enrollment/admission',
              _action: 'student-enrollment-admission',
              permission: 'Permission:StudentEnrollment.Admission',
            },
            {
              title: 'Admission Fees',
              path: '/student/enrollment/admission-fees',
              _action: 'student-enrollment-admission-fees',
              permission: 'Permission:StudentEnrollment.AdmissionFees',
            },

            // {
            //   title: 'Enrollment',
            //   path: '/student/enrollment/enroll',
            //   _action: 'student-enrollment-enroll',
            // },
            {
              title: 'Reports',
              path: '/student/enrollment/reports',
              _action: 'student-enrollment-reports',
              permission: 'Permission:StudentEnrollment.Reports',
            },
            {
              title: 'Setting',
              path: '/student/enrollment/setting',
              _action: 'student-enrollment-setting',
              permission: 'Permission:StudentEnrollment.Setting',
            },
          ],
        },
        {
          title: 'Student Records',
          path: '',
          _action: 'student-records',
          children: [
            {
              title: 'Dashboard',
              path: '/student/overview',
              _action: 'student-overview',
            },
            {
              title: 'Student List',
              path: '/student/profile',
              _action: 'student-profile',
            },
            // {
            //   title: 'Upload Student Photo',
            //   path: '/student/upload-student-photo',
            //   _action: 'student-upload-student-photo',
            // },
            // {
            //   title: 'Upload Student Documents',
            //   path: '/student/upload-student-documents',
            //   _action: 'student-upload-student-documents',
            // },
            {
              title: 'Student I-Card',
              path: '/student/student-i-card',
              _action: 'student-i-card',
              disabled: true,
              caption: 'Coming Soon',
            },
            // {
            //   title: 'Student Sibling',
            //   path: '/student/student-sibling',
            //   _action: 'student-sibling',
            // },

            {
              title: 'Student Management',
              path: '/student/management',
              _action: 'student-management',
            },
            {
              title: 'Certificates',
              path: '/student/certificates',
              _action: 'student-certificates',
              // children: [
              //   {
              //     title: 'Bonafied Certificates',
              //     path: '/student/certificates/bonafied',
              //     _action: 'student-certificates-bonafied',
              //     children: [
              //       {
              //         title: 'Individual',
              //         path: '/student/certificates/bonafied/individual',
              //         _action: 'student-certificates-bonafied-individual',
              //       },
              //       {
              //         title: 'Bulk',
              //         path: '/student/certificates/bonafied/bulk',
              //         _action: 'student-certificates-bonafied-bulk',
              //       },
              //     ],
              //   },
              //   {
              //     title: 'First Trial Certificates',
              //     path: '/student/certificates/first-trial',
              //     _action: 'student-certificates-first-trial',
              //     children: [
              //       {
              //         title: 'Individual',
              //         path: '/student/certificates/first-trial/individual',
              //         _action: 'student-certificates-first-trial-individual',
              //       },
              //       {
              //         title: 'Bulk',
              //         path: '/student/certificates/first-trial/bulk',
              //         _action: 'student-certificates-first-trial-bulk',
              //       },
              //     ],
              //   },
              //   {
              //     title: 'Leaving Certificates',
              //     path: '/student/certificates/leaving',
              //     _action: 'student-certificates-leaving',
              //     children: [
              //       {
              //         title: 'Individual',
              //         path: '/student/certificates/leaving/individual',
              //         _action: 'student-certificates-leaving-individual',
              //       },
              //       {
              //         title: 'Bulk',
              //         path: '/student/certificates/leaving/bulk',
              //         _action: 'student-certificates-leaving-bulk',
              //       },
              //     ],
              //   },
              //   {
              //     title: 'Character Certificates',
              //     path: '/student/certificates/character',
              //     _action: 'student-certificates-character',
              //     children: [
              //       {
              //         title: 'Individual',
              //         path: '/student/certificates/character/individual',
              //         _action: 'student-certificates-character-individual',
              //       },
              //       {
              //         title: 'Bulk',
              //         path: '/student/certificates/character/bulk',
              //         _action: 'student-certificates-character-bulk',
              //       },
              //     ],
              //   },
              // ],
            },

            {
              title: 'Reports',
              path: '/student/reports',
              _action: 'student-reports',
            },

            {
              title: 'Setting',
              path: '/student/setting',
              _action: 'student-setting',
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
            },
            {
              title: 'Take Attendance',
              path: '/student/attendance/take-attendance',
              _action: 'student-attendance-take-attendance',
            },
            {
              title: 'Leave & Absence',
              path: '/student/attendance/leave-absent',
              _action: 'student-attendance-leave-absent',
            },
            {
              title: 'Notifications History',
              path: '/student/attendance/notification',
              _action: 'student-attendance-notification',
              disabled: true,
              caption: 'Coming Soon',
            },
            {
              title: 'Reports',
              path: '/student/attendance/reports',
              _action: 'student-attendance-reports',
            },
            {
              title: 'Setting',
              path: '/student/attendance/setting',
              _action: 'student-attendance-setting',
            },
          ],
        },
        {
          title: 'Notification',
          path: '/student/studentNotification',
          _action: 'notification',
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
              title: 'User Management',
              path: '/security/user',
              _action: 'user-management',
            },
            {
              title: 'Department',
              path: '/security/department',
              _action: 'department',
            },
            // {
            //   title: 'Academic Access Control',
            //   path: '/security/access-control',
            //   _action: 'access-control',
            // },
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
          title: 'Shift Management',
          path: '/setting/shift-management',
          _action: 'shift-management',
        },
        // {
        //   title: 'Curriculum Setup',
        //   path: '/setting/curriculum-setup',
        //   _action: 'curriculum-setup',
        // },
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
        },
        // {
        //   title: 'Profile',
        //   path: '/hr/profile',
        //   _action: 'hr-profile',
        // },
        {
          title: 'Employee',
          path: '',
          _action: 'employee',
          children: [
            {
              title: 'Employee List',
              path: '/hr/employee',
              _action: 'employee',
            },
            {
              title: 'I-card',
              path: '/hr/i-card',
              _action: 'i-card',
              disabled: true,
              caption: 'Coming Soon',
            },
            // {
            //   title: 'Personal Information',
            //   path: '/hr/personal-information',
            //   _action: 'personal-information',
            // },
            // {
            //   title: 'Qualifications and Certifications',
            //   path: '/hr/qualifications-and-certifications',
            //   _action: 'qualifications-and-certifications',
            // },
            // {
            //   title: 'Employment History',
            //   path: '/hr/employment-history',
            //   _action: 'employment-history',
            // },
          ],
        },
        {
          title: 'Payroll Management',
          path: '',
          _action: 'payroll-management',
          children: [
            {
              title: 'Dashboard',
              path: '/hr/payroll/dashboard',
              _action: 'payroll-dashboard',
            },
            // {
            //   title: 'Payroll Structure',
            //   path: '/hr/payroll/structure',
            //   _action: 'payroll-structure',
            // },
            // {
            //   title: 'Import Attendance',
            //   path: '/hr/payroll/import-attendance',
            //   _action: 'payroll-import-attendance',
            // },
            {
              title: 'Run Payroll',
              path: '/hr/payroll/run-payroll',
              _action: 'run-payroll',
            },
            {
              title: 'Generate Salary Slip',
              path: '/hr/payroll/generate-salary-slip',
              _action: 'generate-salary-slip',
            },
            // {
            //   title: 'Pay Process',
            //   path: '/hr/payroll/pay-process',
            //   _action: 'pay-process',
            // },
            // {
            //   title: 'Pay Process Preview',
            //   path: '/hr/payroll/pay-process-preview',
            //   _action: 'pay-process-preview',
            // },
            // {
            //   title: 'Payslip Generation',
            //   path: '/hr/payroll/payslip-generation',
            //   _action: 'payslip-generation',
            // },
            {
              title: 'Settings',
              path: '/hr/payroll/setting',
              _action: 'payroll-setting',
            },
          ],
        },
        {
          title: 'Attendance and Leave Management',
          path: '',
          _action: 'attendance-and-leave-management',
          children: [
            {
              title: 'Import Attendance',
              path: '/hr/biometric-integration',
              _action: 'biometric-integration',
            },
            {
              title: 'Leave Requests and Approvals',
              path: '/hr/leave-requests',
              _action: 'leave-requests-and-approvals',
            },
            {
              title: 'Attendance Tracking',
              path: '/hr/attendance-tracking',
              _action: 'attendance-tracking',
            },
            // {
            //   title: 'Notifications History',
            //   path: '/hr/attendance-notification',
            //   _action: 'hr-attendance-notification',
            // },
            {
              title: 'Setting',
              path: '/hr/attendance-setting',
              _action: 'setting',
            },
          ],
        },
        {
          title: 'Professional Management',
          path: '/hr/professional-management',
          _action: 'professional-management',
          disabled: true,
          caption: 'Coming Soon',
        },
        {
          title: 'Reports',
          path: '/hr/reports',
          _action: 'reports',
        },
        {
          title: 'Events & Holidays',
          path: '',
          _action: 'events-holidays',
          children: [
            {
              title: 'Create Events & Holidays',
              path: '/hr/events-holidays',
              _action: 'events-holidays',
            },
            {
              title: 'Requests',
              path: '/hr/events-holidays/request',
              _action: 'events-holidays-request',
            },
          ],
        },
        {
          title: 'Setting',
          path: '/hr/setting',
          _action: 'hr-setting',
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
        },
        {
          title: 'Curriculum',
          path: '',
          _action: 'curriculum-management',
          children: [
            {
              title: 'Dashboard',
              path: '/academic/curriculumDashboard',
              _action: 'curriculum-management-dashboard',
            },
            {
              title: 'Subject',
              path: '/academic/curriculumSubjects',
              _action: 'curriculum-management-subjects',
            },
            {
              title: 'Curriculum Overview',
              path: '/academic/curriculumOverview',
              _action: 'student-enrollment-curriculumOverview',
            },
            {
              title: 'Teacher',
              path: '/academic/teacher',
              _action: 'student-enrollment-teacher',
            },
            {
              title: 'Reports',
              path: '/academic/curriculumReports',
              _action: 'student-enrollment-reports',
            },
            {
              title: 'Settings',
              path: '/academic/curriculumSettings',
              _action: 'student-enrollment-settings',
            },
          ],
        },
        {
          title: 'Course',
          path: '/academic/course-management',
          _action: 'course-management',
          children: [
            {
              title: 'Dashboard',
              path: '/academic/courseDashboard',
              _action: 'course-management-dashboard',
            },
            {
              title: 'Content Management',
              path: '/academic/courseSubjects',
              _action: 'course-management-subjects',
            },
            {
              title: 'Learning Resources',
              path: '/academic/learningResources',
              _action: 'course-management-learningResources',
            },
            {
              title: 'Course Progress',
              path: '/academic/courseProgress',
              _action: 'course-management-courseProgress',
            },
            {
              title: 'Reports',
              path: '/academic/courseReports',
              _action: 'course-management-reports',
            },
            {
              title: 'Settings',
              path: '/academic/courseSettings',
              _action: 'course-management-settings',
            },
          ],
        },
        {
          title: 'Timetable',
          path: '',
          _action: 'timetable-schedule-management',
          children: [
            {
              title: 'Dashboard',
              path: '/academic/timeTableDashboard',
              _action: 'timetable-schedule-management',
            },
            {
              title: 'New Timetable',
              path: '/academic/newTimetable',
              _action: 'timetable-schedule-management',
            },
            {
              title: 'Reports',
              path: '/academic/timetableReports',
              _action: 'timetable-schedule-management',
            },
            {
              title: 'Settings',
              path: '/academic/timetableSettings',
              _action: 'timetable-schedule-management',
            },
          ],
        },
        {
          title: 'Group Management',
          path: '',
          _action: 'group-management',
          disabled: true,
          children: [
            {
              title: 'Dashboard',
              path: '/academic/activityDashboard',
              _action: 'group-management-activityDashboard',
            },
            {
              title: 'Dynamic Group',
              path: '/academic/dynamicGroup',
              _action: 'group-management-dynamicGroup',
            },
            {
              title: 'Activity Management',
              path: '/academic/activityManagement',
              _action: 'group-management-activityManagement',
            },
            {
              title: 'Student Group',
              path: '/academic/studentGroup',
              _action: 'group-management-studentGroup',
            },
          ],
        },
        {
          title: 'Learning Management System (LMS)',
          path: '/academic/learning-management-system',
          _action: 'learning-management-system',
          disabled: true,
          children: [
            {
              title: 'Dashboard',
              path: '/academic/lmsDashboard',
              _action: 'learning-management-system-lmsDashboard',
            },
            {
              title: 'Course',
              path: '/academic/course',
              _action: 'learning-management-system-course',
            },
            {
              title: 'Student Progress Tracking',
              path: '/academic/studentProgressTracking',
              _action: 'learning-management-system-studentProgressTracking',
            },
            {
              title: 'Content Library',
              path: '/academic/contentLibrary',
              _action: 'learning-management-system-contentLibrary',
            },
            {
              title: 'Reports And Analytics',
              path: '/academic/reportsAndAnalytics',
              _action: 'learning-management-system-reportsAndAnalytics',
            },
            {
              title: 'Settings',
              path: '/academic/lmsSettings',
              _action: 'learning-management-system-settings',
            },
          ],
        },
        // {
        //   title: 'Gradebook & Performance Tracking',
        //   path: '',
        //   _action: 'gradebook-performance-tracking',
        //   children: [
        //     {
        //       title: 'Dashboard',
        //       path: '/academic/gradebookDashboard',
        //       _action: 'gradebook-performance-tracking-gradebookDashboard',
        //     },
        //     {
        //       title: 'Gradebook',
        //       path: '/academic/gradebook',
        //       _action: 'gradebook-performance-tracking-gradebook',
        //     },
        //     {
        //       title: 'Performance Analysis',
        //       path: '/academic/performanceAnalysis',
        //       _action: 'gradebook-performance-tracking-performanceAnalysis',
        //     },
        //     {
        //       title: 'Reports',
        //       path: '/academic/gradebookReports',
        //       _action: 'gradebook-performance-tracking-reports',
        //     },
        //     {
        //       title: 'Settings',
        //       path: '/academic/gradebookSettings',
        //       _action: 'gradebook-performance-tracking-settings',
        //     },
        //   ],
        // },
        // {
        //   title: 'Student Progress & Analytics',
        //   path: '',
        //   _action: 'student-progress-analytics',
        //   children: [
        //     {
        //       title: 'Dashboard',
        //       path: '/academic/progressDashboard',
        //       _action: 'student-progress-analytics-progressDashboard',
        //     },
        //     {
        //       title: 'Class Progress',
        //       path: '/academic/classProgress',
        //       _action: 'student-progress-analytics-classProgress',
        //     },
        //     {
        //       title: 'Individual Student Progress',
        //       path: '/academic/individualStudentProgress',
        //       _action: 'student-progress-analytics-individualStudentProgress',
        //     },
        //     {
        //       title: 'Comparative Analytics',
        //       path: '/academic/comparativeAnalytics',
        //       _action: 'student-progress-analytics-comparativeAnalytics',
        //     },
        //     {
        //       title: 'Reports',
        //       path: '/academic/studentProgressReports',
        //       _action: 'student-progress-analytics-reports',
        //     },
        //     {
        //       title: 'Settings',
        //       path: '/academic/studentProgressSettings',
        //       _action: 'student-progress-analytics-settings',
        //     },
        //   ],
        // },
        // {
        //   title: 'Resources/Content Library',
        //   path: '',
        //   _action: 'resources-content-library',
        //   children: [
        //     {
        //       title: 'Dashboard',
        //       path: '/academic/resourceDashboard',
        //       _action: 'resources-content-library-resourceDashboard',
        //     },
        //     {
        //       title: 'All Resources',
        //       path: '/academic/allResources',
        //       _action: 'resources-content-library-allResources',
        //     },
        //     {
        //       title: 'Shared With Me',
        //       path: '/academic/sharedWithMe',
        //       _action: 'resources-content-library-sharedWithMe',
        //     },
        //     {
        //       title: 'Settings',
        //       path: '/academic/resourceSettings',
        //       _action: 'resources-content-library-settings',
        //     },
        //   ],
        // },
        {
          title: 'Homework & Assignment',
          path: '/academic/homework-assignment-management',
          _action: 'homework-assignment-management',
          children: [
            {
              title: 'Dashboard',
              path: '/academic/homeworkDashboard',
              _action: 'homework-assignment-management-homeworkDashboard',
            },
            {
              title: 'Homework & Assignment Creation',
              path: '/academic/homeworkCreation',
              _action: 'homework-assignment-management-homeworkCreation',
            },
            // {
            //   title: 'Student Submissions',
            //   path: '/academic/studentSubmissions',
            //   _action: 'homework-assignment-management-studentSubmissions',
            // },
            {
              title: 'Grading And Feedback',
              path: '/academic/gradingAndFeedback',
              _action: 'homework-assignment-management-gradingAndFeedback',
            },
            {
              title: 'Settings',
              path: '/academic/homeworkSettings',
              _action: 'homework-assignment-management-settings',
            },
          ],
        },
        {
          title: 'Assign ClassTeacher',
          path: '/academic/assignTeacher',
          _action: 'assign-teacher',
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
        },
        {
          title: 'Messages',
          path: '',
          _action: 'messages',
          children: [
            {
              title: 'All Conversation',
              path: '/communication/messages/allConversation',
              _action: 'messages-allConversation',
            },
            {
              title: 'Staff Faculty',
              path: '/communication/messages/staffFaculty',
              _action: 'messages-staffFaculty',
            },
            {
              title: 'Students',
              path: '/communication/messages/students',
              _action: 'messages-students',
            },
            {
              title: 'Parents',
              path: '/communication/messages/parents',
              _action: 'messages-parents',
            },
          ],
        },
        {
          title: 'Announcements',
          path: '/communication/announcement',
          _action: 'announcement',
          children: [
            {
              title: 'School Wise Announsement',
              path: '/communication/announcement/schoolWiseAnnounsement',
              _action: 'announcement-schoolWiseAnnounsement',
            },
            {
              title: 'Class Wise Announcement',
              path: '/communication/announcement/classSpecificAnnouncement',
              _action: 'announcement-classSpecificAnnouncement',
            },
          ],
        },
        {
          title: 'Events',
          path: '/communication/eventsAndCalendar',
          _action: 'eventsAndCalendar',
          children: [
            {
              title: 'All Events',
              path: '/communication/eventsAndCalendar/allEvents',
              _action: 'eventsAndCalendar-allEvents',
            },
            {
              title: 'Upcoming Events',
              path: '/communication/eventsAndCalendar/upcomingEvents',
              _action: 'eventsAndCalendar-upcomingEvents',
            },
            {
              title: 'Event Archieves',
              path: '/communication/eventsAndCalendar/eventArchieves',
              _action: 'eventsAndCalendar-eventArchieves',
            },
          ],
        },
        {
          title: 'Feedback & Survey',
          path: '/communication/feedbackAndSurvey',
          _action: 'feedbackAndSurvey',
          children: [
            {
              title: 'Scheduled Survey',
              path: '/communication/feedbackAndSurvey/scheduledSurvey',
              _action: 'feedbackAndSurvey-scheduledSurvey',
            },
            {
              title: 'Active Survey',
              path: '/communication/feedbackAndSurvey/activeSurvey',
              _action: 'feedbackAndSurvey-activeSurvey',
            },
            {
              title: 'Past Survey',
              path: '/communication/feedbackAndSurvey/pastSurvey',
              _action: 'feedbackAndSurvey-pastSurvey',
            },
          ],
        },
        {
          title: 'Meetings',
          path: '/communication/meetings',
          _action: 'meetings',
          // children: [
          //   {
          //     title: 'All Meetings',
          //     path: '/communication/meetings/allMeetings',
          //     _action: 'meetings-allMeetings',
          //   },
          // ],
        },
        {
          title: 'Notification',
          path: '/communication/notification',
          _action: 'notification',
        },
        {
          title: 'Settings',
          path: '/communication/settings',
          _action: 'settings',
          children: [
            {
              title: 'Notification Setting',
              path: '/communication/settings/notificationSetting',
              _action: 'settings-notificationSetting',
            },
            {
              title: 'User Preferences',
              path: '/communication/settings/userPreferences',
              _action: 'settings-userPreferences',
            },
            {
              title: 'Announcement',
              path: '/communication/settings/announcement',
              _action: 'settings-announcement',
            },
            {
              title: 'Event Type',
              path: '/communication/settings/eventType',
              _action: 'settings-eventType',
            },
          ],
        },
      ],
    },
  ],
};

const examinationModule = {
  [examinationPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Examination',
          path: '',
          _action: 'examination',
          children: [
            {
              title: 'Dashboard',
              path: '/examination/examinationDashboard',
              _action: 'examination-homeworkDashboard',
            },
            {
              title: 'Schedule Exam',
              path: '/examination/scheduleExam',
              _action: 'examination-scheduleExam',
            },
            {
              title: 'Grade Entry',
              path: '/examination/gradeEntry',
              _action: 'examination-gradeEntry',
            },
            {
              title: 'Assessment',
              path: '/examination/assessmentManagement',
              _action: 'examination-assessmentManagement',
            },
            {
              title: 'Quiz Management',
              path: '/examination/quizManagement',
              _action: 'examination-quizManagement',
            },
            {
              title: 'Student Performance And Analytics',
              path: '/examination/studentPerformanceAndAnalytics',
              _action: 'examination-studentPerformanceAndAnalytics',
            },
            {
              title: 'Settings',
              path: '/examination/settings',
              _action: 'examination-settings',
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
          _action: 'examination',
        },
        {
          title: 'Fee Management',
          path: '/finance/fee-management',
          _action: 'fee-management',
        },
        {
          title: 'Fee Collection',
          path: '/finance/fee-collection',
          _action: 'fee-collection',
        },
        {
          title: 'Fee Refund',
          path: '/finance/fee-refund',
          _action: 'fee-refund',
        },
        {
          title: 'Reconciliation',
          path: '/finance/reconciliation',
          _action: 'reconciliation',
        },
        {
          title: 'Income Tracking',
          path: '/finance/income-tracking',
          _action: 'finance-income-tracking',
        },
        {
          title: 'Expense Tracking',
          path: '/finance/expense-tracking',
          _action: 'finance-expense-tracking',
        },

        {
          title: 'Budgeting',
          path: '/finance/budgeting',
          _action: 'finance-budget',
        },
        {
          title: 'Reports',
          path: '/finance/reports',
          _action: 'finance-reports',
        },
        {
          title: 'Setting',
          path: '',
          _action: 'finance-settings',
          children: [
            {
              title: 'General Setting',
              path: '/finance/settings/general',
              _action: 'general-setting',
            },
            {
              title: 'Receipt Book',
              path: '/finance/settings/receipt-book',
              _action: 'receipt-book',
            },
            {
              title: 'Fee Structure',
              path: '/finance/settings/fee-structure',
              _action: 'fee-structure-setting',
            },
            {
              title: 'Create Receipt',
              path: '/finance/settings/create-receipt',
              _action: 'receipt-book',
            },
            // {
            //   title: 'Discount Category',
            //   path: '/finance/settings/discount-category',
            //   _action: 'discount-category-setting',
            // },
            // {
            //   title: 'Expenense',
            //   path: '/finance/settings/expense-category',
            //   _action: 'expenense-category-setting',
            // },

            {
              title: 'Tax Setting',
              path: '/finance/settings/tax-setting',
              _action: 'tax-setting',
            },
            {
              title: 'Payment Method',
              path: '/finance/settings/payment-method-setting',
              _action: 'payment-method-setting',
            },
            {
              title: 'Bounce Cheque Charges',
              path: '/finance/settings/bounce-cheque-charges-setting',
              _action: 'bounce-cheque-charges-setting',
            },
            {
              title: 'Notification',
              path: '/finance/settings/notification-setting',
              _action: 'notification-setting',
            },
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
          _action: 'dashboard',
        },
        {
          title: 'Book Management',
          path: '/library/book-management',
          _action: 'book-management',
        },
        {
          title: 'Member Management',
          path: '/library/member-management',
          _action: 'member-management',
        },
        {
          title: 'Circulation',
          path: '/library/circulation',
          _action: 'circulation',
        },

        {
          title: 'Reports',
          path: '/library/reports',
          _action: 'library-reports',
        },
        {
          title: 'Setting',
          path: '',
          _action: 'library-settings',
          children: [
            {
              title: 'General Setting',
              path: '/library/settings/general-setting',
              _action: 'general-setting',
            },
            {
              title: 'Notification Setting',
              path: '/library/settings/notification-setting',
              _action: 'notification-setting',
            },

            {
              title: 'Permission',
              path: '/library/settings/permission',
              _action: 'permission',
            },
            // {
            //   title: 'Curriculum Templates',
            //   path: '/library/settings/curriculumn-templates',
            //   _action: 'curriculum-templates',
            // },
            // {
            //   title: 'Membership Management',
            //   path: '/library/settings/membership-management',
            //   _action: 'membership-management',
            // },
            {
              title: 'Report Configuration',
              path: '/library/settings/report-configuration',
              _action: 'report-configuration',
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
          _action: 'dashboard',
        },
        {
          title: 'Routes & Schedules',
          path: '/transport/routes-schedules',
          _action: 'routes-schedules',
        },
        {
          title: 'Vehicle Management',
          path: '/transport/vehicle-management',
          _action: 'vehicle-management',
        },
        {
          title: 'Assigned Route',
          path: '/transport/member-transport',
          _action: 'staff-transport',
        },
        {
          title: 'Real-Time Tracking',
          path: '/transport/real-time-tracking',
          _action: 'real-time-tracking',
        },

        {
          title: 'Reports & Analytics',
          path: '/transport/reports-analytics',
          _action: 'reports-analytics',
        },
        {
          title: 'Settings',
          path: '/transport/settings',
          _action: 'settings',
        },
      ],
    },
  ],
};

export const navData = (isDdvs: boolean) => [
  {
    subheader: 'Management',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: ICONS.dashboard, _action: 'dashboard' },
      {
        title: 'Student',
        path: '/student/enrollment/dashboard',
        icon: ICONS.student,
        _action: 'student',
        submodule: studentModule[studentPath].flatMap((list) => list.items),
      },
      {
        title: 'Academic & Assignment',
        path: '/academic/dashboard',
        icon: ICONS.academic,
        _action: 'academic',
        submodule: academicModule[academicPath].flatMap((list) => list.items),
      },
      {
        title: 'Examination & Assessment',
        path: '/examination/examinationDashboard',
        icon: ICONS.examination,
        _action: 'examination',
        submodule: examinationModule[examinationPath].flatMap((list) => list.items),
      },
      {
        title: 'HR/Staff',
        path: '/hr/dashboard',
        icon: ICONS.hr,
        _action: 'hr',
        submodule: hrModule[hrPath].flatMap((list) => list.items),
      },
      {
        title: 'Finance',
        path: '/finance/dashboard',
        icon: ICONS.finance,
        _action: 'finance',
        submodule: financeModule[financePath].flatMap((list) => list.items),
      },
      {
        title: 'Communication',
        path: '/communication/dashboard',
        icon: ICONS.communication,
        _action: 'communication',
        submodule: communicationModule[communicationPath].flatMap((list) => list.items),
        disabled: !isDdvs,
        // caption: 'Coming Soon',
      },
      {
        title: 'Library',
        path: '/library/dashboard',
        icon: ICONS.library,
        _action: 'library',
        submodule: libraryModule[libraryPath].flatMap((list) => list.items),
        disabled: !isDdvs,
        // caption: 'Coming Soon',
      },
      {
        title: 'Transport',
        path: '/transport/dashboard',
        icon: ICONS.transport,
        _action: 'transport',
        submodule: transportModule[transportPath].flatMap((list) => list.items),
        disabled: !isDdvs,
        // caption: 'Coming Soon',
      },
      {
        title: 'Hostel',
        path: '/hostel/dashboard',
        icon: ICONS.hostel,
        _action: 'hostel',
        submodule: [],
        disabled: !isDdvs,
        // caption: 'Coming Soon',
      },
      {
        title: 'Security',
        path: '/security/role',
        icon: ICONS.security,
        _action: 'security',
        submodule: securityModule[securityPath].flatMap((list) => list.items),
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
  ...examinationModule,
  ...financeModule,
  ...transportModule,
  ...communicationModule,
  ...libraryModule,
});
