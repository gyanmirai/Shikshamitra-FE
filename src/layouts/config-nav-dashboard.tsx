import {
  hrPath,
  financePath,
  studentPath,
  settingPath,
  securityPath,
  dashboardPath,
  assessmentPath,
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
        path: '/student/profile',
        icon: ICONS.student,
        _action: 'student',
      },
      {
        title: 'Academic & Assesment',
        path: assessmentPath,
        icon: ICONS.dashboard,
        _action: 'assessment',
      },
      { title: 'HR/Staff', path: '/hr/dashboard', icon: ICONS.hr, _action: 'hr' },
      { title: 'Finance', path: financePath, icon: ICONS.finance, _action: 'finance' },
      {
        title: 'Communication',
        path: financePath,
        icon: ICONS.communication,
        _action: 'communication',
      },
      { title: 'Library', path: financePath, icon: ICONS.library, _action: 'library' },
      { title: 'Transport', path: financePath, icon: ICONS.transport, _action: 'transport' },
      { title: 'Hostel', path: financePath, icon: ICONS.hostel, _action: 'transport' },
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
              title: 'New Inquiry',
              path: '/student/enrollment/inquiry',
              _action: 'student-enrollment-inquiry',
            },
            {
              title: 'Registration',
              path: '/student/enrollment/registration',
              _action: 'student-enrollment-registration',
            },
            {
              title: 'Admission',
              path: '/student/enrollment/admission',
              _action: 'student-enrollment-admission',
            },
            {
              title: 'Follow-up',
              path: '/student/enrollment/follow-up',
              _action: 'student-enrollment-follow-up',
            },
            {
              title: 'Entrance Exam',
              path: '/student/enrollment/entrance-exam',
              _action: 'student-enrollment-entrance-exam',
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
            {
              title: 'Upload Student Photo',
              path: '/student/upload-student-photo',
              _action: 'student-upload-student-photo',
            },
            {
              title: 'Upload Student Documents',
              path: '/student/upload-student-documents',
              _action: 'student-upload-student-documents',
            },
            {
              title: 'Student I-Card',
              path: '/student/student-i-card',
              _action: 'student-i-card',
            },
            {
              title: 'Student Sibling',
              path: '/student/student-sibling',
              _action: 'student-sibling',
            },
            {
              title: 'Attendance',
              path: '',
              _action: 'student-attendance',
              children: [
                {
                  title: 'Take Attendance',
                  path: '/student/attendance/take-attendance',
                  _action: 'student-attendance-take-attendance',
                },
                {
                  title: 'Daily Attendance Tracking',
                  path: '/student/attendance/daily-attendance-tracking',
                  _action: 'student-attendance-daily-attendance-tracking',
                },
                {
                  title: 'Leave And Absent Records',
                  path: '/student/attendance/leave-and-absent-records',
                  _action: 'student-attendance-leave-and-absent-records',
                },
                {
                  title: 'Setting',
                  path: '/student/attendance/setting',
                  _action: 'student-attendance-setting',
                },
                {
                  title: 'Reports',
                  path: '/student/attendance/reports',
                  _action: 'student-attendance-reports',
                },
              ],
            },
            {
              title: 'Student Management',
              path: '',
              _action: 'student-management',
              children: [
                {
                  title: 'GR No. Generation',
                  path: '/student/management/gr-no-generation',
                  _action: 'student-management-gr-no-generation',
                },
                {
                  title: 'Roll No. Generation',
                  path: '/student/management/roll-no-generation',
                  _action: 'student-management-roll-no-generation',
                },
                {
                  title: 'Change Division',
                  path: '/student/management/change-division',
                  _action: 'student-management-change-division',
                },
                {
                  title: 'Change Class',
                  path: '/student/management/change-class',
                  _action: 'student-management-change-class',
                },
                {
                  title: 'Bulk Data Update',
                  path: '/student/management/bulk-data-update',
                  _action: 'student-management-bulk-data-update',
                },
                {
                  title: 'Bulk Student Add',
                  path: '/student/management/bulk-student-add',
                  _action: 'student-management-bulk-student-add',
                },
              ],
            },
            {
              title: 'Certificates',
              path: '',
              _action: 'student-certificates',
              children: [
                {
                  title: 'Bonafied Certificates',
                  path: '/student/certificates/bonafied',
                  _action: 'student-certificates-bonafied',
                  children: [
                    {
                      title: 'Individual',
                      path: '/student/certificates/bonafied/individual',
                      _action: 'student-certificates-bonafied-individual',
                    },
                    {
                      title: 'Bulk',
                      path: '/student/certificates/bonafied/bulk',
                      _action: 'student-certificates-bonafied-bulk',
                    },
                  ],
                },
                {
                  title: 'First Trial Certificates',
                  path: '/student/certificates/first-trial',
                  _action: 'student-certificates-first-trial',
                  children: [
                    {
                      title: 'Individual',
                      path: '/student/certificates/first-trial/individual',
                      _action: 'student-certificates-first-trial-individual',
                    },
                    {
                      title: 'Bulk',
                      path: '/student/certificates/first-trial/bulk',
                      _action: 'student-certificates-first-trial-bulk',
                    },
                  ],
                },
                {
                  title: 'Leaving Certificates',
                  path: '/student/certificates/leaving',
                  _action: 'student-certificates-leaving',
                  children: [
                    {
                      title: 'Individual',
                      path: '/student/certificates/leaving/individual',
                      _action: 'student-certificates-leaving-individual',
                    },
                    {
                      title: 'Bulk',
                      path: '/student/certificates/leaving/bulk',
                      _action: 'student-certificates-leaving-bulk',
                    },
                  ],
                },
                {
                  title: 'Character Certificates',
                  path: '/student/certificates/character',
                  _action: 'student-certificates-character',
                  children: [
                    {
                      title: 'Individual',
                      path: '/student/certificates/character/individual',
                      _action: 'student-certificates-character-individual',
                    },
                    {
                      title: 'Bulk',
                      path: '/student/certificates/character/bulk',
                      _action: 'student-certificates-character-bulk',
                    },
                  ],
                },
              ],
            },
            {
              title: 'Student Custom Search',
              path: '/student/custom-search',
              _action: 'student-custom-search',
            },
            {
              title: 'Student Reports',
              path: '/student/reports',
              _action: 'student-reports',
            },
            {
              title: 'Student Summary Reports',
              path: '/student/summary-reports',
              _action: 'student-summary-reports',
            },
            {
              title: 'Setting',
              path: '/student/setting',
              _action: 'student-setting',
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
              title: 'Salary Calculation and Disbursement',
              path: '/hr/salary-calculation-and-disbursement',
              _action: 'salary-calculation-and-disbursement',
            },
            {
              title: 'Tax and PF Deductions',
              path: '/hr/tax-and-pf-deductions',
              _action: 'tax-and-pf-deductions',
            },
            {
              title: 'Payslip Generation',
              path: '/hr/payslip-generation',
              _action: 'payslip-generation',
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
          ],
        },
        {
          title: 'Professional Development',
          path: '',
          _action: 'professional-development',
          children: [
            {
              title: 'Training and Workshops',
              path: '/hr/training-and-workshops',
              _action: 'training-and-workshops',
            },
            {
              title: 'Performance Appraisals',
              path: '/hr/performance-appraisals',
              _action: 'performance-appraisals',
            },
            {
              title: 'Certification Tracking',
              path: '/hr/certification-tracking',
              _action: 'certification-tracking',
            },
          ],
        },
        {
          title: 'Reports',
          path: '/hr/reports',
          _action: 'reports',
        },
      ],
    },
  ],
};

export const navSubData = { ...studentModule, ...securityModule, ...settingModule, ...hrModule };
