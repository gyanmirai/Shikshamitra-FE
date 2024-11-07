import {
  hrPath,
  financePath,
  studentPath,
  settingPath,
  securityPath,
  academicPath,
  dashboardPath,
  transportPath,
  examinationPath,
  communicationPath,
} from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
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
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Management',
    items: [
      { title: 'Dashboard', path: dashboardPath, icon: ICONS.dashboard, _action: 'dashboard' },
      {
        title: 'Student',
        path: '/student/enrollment/dashboard',
        icon: ICONS.student,
        _action: 'student',
      },
      {
        title: 'Academic & Assignment',
        path: '/academic/dashboard',
        icon: ICONS.dashboard,
        _action: 'academic',
      },
      {
        title: 'Examination & Assessment',
        path: '/examination',
        icon: ICONS.dashboard,
        _action: 'examination',
      },
      { title: 'HR/Staff', path: '/hr/dashboard', icon: ICONS.hr, _action: 'hr' },
      { title: 'Finance', path: '/finance/dashboard', icon: ICONS.finance, _action: 'finance' },
      {
        title: 'Communication',
        path: '/communication/dashboard',
        icon: ICONS.communication,
        _action: 'communication',
      },
      { title: 'Library', path: financePath, icon: ICONS.library, _action: 'library' },
      {
        title: 'Transport',
        path: '/transport/dashboard',
        icon: ICONS.transport,
        _action: 'transport',
      },
      { title: 'Hostel', path: '/hostel/dashboard', icon: ICONS.hostel, _action: 'transport' },
      { title: 'Security', path: '/security/role', icon: ICONS.security, _action: 'security' },
      // {
      //   title: 'Setting',
      //   path: hrPath,
      //   icon: ICONS.dashboard,
      //   _action: 'setting',
      //   style: {
      //     height: '100%',
      //     justifyContent: 'end',
      //   },
      // },
    ],
  },
  /**
   * Management
   */
  // {
  //   subheader: 'Management',
  //   items: [
  //     {
  //       title: 'Group',
  //       path: paths.dashboard.group.root,
  //       icon: ICONS.user,
  //       children: [
  //         { title: 'Four', path: paths.dashboard.group.root },
  //         { title: 'Five', path: paths.dashboard.group.five },
  //         { title: 'Six', path: paths.dashboard.group.six },
  //       ],
  //     },
  //   ],
  // },
];

export const settingMenu = {
  title: 'Institute Setup',
  path: '/setting/basic-information',
  icon: (
    <Iconify
      icon="emojione-monotone:school"
      sx={{ height: '20px !important', width: '20px !important' }}
      height={18}
      width={18}
    />
  ),
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
          children: [
            {
              title: 'Dashboard',
              path: '/student/enrollment/dashboard',
              _action: 'student-enrollment-dashboard',
            },
            {
              title: 'Inquiry',
              path: '/student/enrollment/inquiry',
              _action: 'student-enrollment-inquiry',
            },
            {
              title: 'Registration',
              path: '/student/enrollment/registration',
              _action: 'student-enrollment-registration',
            },
            {
              title: 'Entrance Exam',
              path: '/student/enrollment/entrance-exam',
              _action: 'student-enrollment-entrance-exam',
            },
            {
              title: 'Follow-up',
              path: '/student/enrollment/follow-up',
              _action: 'student-enrollment-follow-up',
            },
            {
              title: 'Admission',
              path: '/student/enrollment/admission',
              _action: 'student-enrollment-admission',
            },

            {
              title: 'Enrollment Status Tracking',
              path: '/student/enrollment/enrollment-status-tracking',
              _action: 'student-enrollment-enrollment-status-tracking',
            },
            {
              title: 'Reports',
              path: '/student/enrollment/reports',
              _action: 'student-enrollment-reports',
            },
            {
              title: 'Setting',
              path: '/student/enrollment/setting',
              _action: 'student-enrollment-setting',
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
              title: 'Reports',
              path: '/student/attendance/reports',
              _action: 'student-attendance-reports',
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
            },
            {
              title: 'Setting',
              path: '/student/attendance/setting',
              _action: 'student-attendance-setting',
            },
          ],
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
              title: 'Role Assignment',
              path: '/security/permission',
              _action: 'permission',
            },
            {
              title: 'Access Control',
              path: '/security/access-control',
              _action: 'access-control',
            },
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
          title: 'Curriculum Setup',
          path: '/setting/curriculum-setup',
          _action: 'curriculum-setup',
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
        },
        {
          title: 'Employee',
          path: '',
          _action: 'employee',
          children: [
            {
              title: 'Employee Enroll',
              path: '/hr/employee',
              _action: 'employee',
            },
            {
              title: 'I-card',
              path: '/hr/i-card',
              _action: 'i-card',
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
            {
              title: 'Import Attendance',
              path: '/hr/payroll/import-attendance',
              _action: 'payroll-import-attendance',
            },
            {
              title: 'Pay Process',
              path: '/hr/payroll/pay-process',
              _action: 'pay-process',
            },
            // {
            //   title: 'Pay Process Preview',
            //   path: '/hr/payroll/pay-process-preview',
            //   _action: 'pay-process-preview',
            // },
            {
              title: 'Payslip Generation',
              path: '/hr/payroll/payslip-generation',
              _action: 'payslip-generation',
            },
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
              title: 'Biometric Integration',
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
            {
              title: 'Notifications History',
              path: '/hr/attendance-notification',
              _action: 'hr-attendance-notification',
            },
            {
              title: 'Setting',
              path: '/hr/setting',
              _action: 'setting',
            },
          ],
        },
        {
          title: 'Professional Management',
          path: '/hr/professional-management',
          _action: 'professional-management',
        },
        {
          title: 'Reports',
          path: '/hr/reports',
          _action: 'reports',
        },
        {
          title: 'Staff Directory',
          path: '/hr/staff-directory',
          _action: 'staff-directory',
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
          title: 'Curriculum Management',
          path: '/academic/curriculum-management',
          _action: 'curriculum-management',
        },
        {
          title: 'Course Management',
          path: '/academic/course-management',
          _action: 'course-management',
        },
        {
          title: 'Timetable & Schedule Management',
          path: '/academic/timetable-schedule-management',
          _action: 'timetable-schedule-management',
        },
        // {
        //   title: 'Examination & Assessment Management',
        //   path: '/academic/examination-assessment-management',
        //   _action: 'examination-assessment-management',
        // },
        {
          title: 'Learning Management System (LMS)',
          path: '/academic/learning-management-system',
          _action: 'learning-management-system',
        },
        {
          title: 'Gradebook & Performance Tracking',
          path: '/academic/gradebook-performance-tracking',
          _action: 'gradebook-performance-tracking',
        },
        {
          title: 'Student Progress & Analytics',
          path: '/academic/student-progress-analytics',
          _action: 'student-progress-analytics',
        },
        {
          title: 'Resources/Content Library',
          path: '/academic/resources-content-library',
          _action: 'resources-content-library',
        },
        {
          title: 'Parent-Teacher Communication',
          path: '/academic/parent-teacher-communication',
          _action: 'parent-teacher-communication',
        },
        {
          title: 'Homework & Assignment Management',
          path: '/academic/homework-assignment-management',
          _action: 'homework-assignment-management',
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
          path: '/communication/messages',
          _action: 'messages',
        },
        {
          title: 'Announcements',
          path: '/communication/announcement',
          _action: 'announcement',
        },
        {
          title: 'Events & Calendar',
          path: '/communication/eventsAndCalendar',
          _action: 'eventsAndCalendar',
        },
        {
          title: 'Feedback & Survey',
          path: '/communication/feedbackAndSurvey',
          _action: 'feedbackAndSurvey',
        },
        {
          title: 'Settings',
          path: '/communication/settings',
          _action: 'settings',
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
          path: '/examination',
          _action: 'examination',
        },
        {
          title: 'Assessment',
          path: '/examination/assessment',
          _action: 'assessment',
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
          path: '/finance/settings',
          _action: 'finance-settings',
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
          title: 'Staff Transport',
          path: '/transport/staff-transport',
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
export const navSubData = {
  ...studentModule,
  ...securityModule,
  ...settingModule,
  ...hrModule,
  ...academicModule,
  ...examinationModule,
  ...financeModule,
  ...transportModule,
  ...communicationModule,
};
