import { hrPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultHrPermissionName = 'HR.';

export const hrPaths = {
  dashboard: '/hr/dashboard',
  employee: {
    root: '',
    list: '/hr/employee',
    iCard: '/hr/i-card',
    setting: {
      root: '/hr/setting',
      documentTypes: '/hr/setting', // Note: Same path as root setting in original
    },
  },
  payroll: {
    root: '',
    dashboard: '/hr/payroll/dashboard',
    runPayroll: '/hr/payroll/run-payroll',
    generateSalarySlip: '/hr/payroll/generate-salary-slip',
    settings: {
      root: '',
      earningComponents: '/hr/payroll/setting/earning-component',
      deductionComponents: '/hr/payroll/setting/deduction-component',
      pfRule: '/hr/payroll/setting/pf',
    },
  },
  attendance: {
    root: '',
    importAttendance: '/hr/biometric-integration',
    leaveManagement: '/hr/leave-requests',
    attendanceTracking: '/hr/attendance-tracking',
    setting: {
      root: '/hr/attendance-setting',
      shiftManagement: '/hr/attendance-setting/shiftManagement',
      leaveType: '/hr/attendance-setting/leaveType',
      leavePolicy: '/hr/attendance-setting/leavePolicy',
    },
  },
  professionalManagement: '/hr/professional-management',
  reports: '/hr/reports',
  notification: '/hr/hr-notification',
};

export const hrPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultHrPermissionName}Dashboard`,
  employee: {
    root: `${defaultModulePermissionName}${defaultHrPermissionName}Employee`,
    list: `${defaultHrPermissionName}Employee.EmployeeList`,
    iCard: `${defaultHrPermissionName}Employee.ICard`,
    setting: {
      root: `${defaultModulePermissionName}${defaultHrPermissionName}Employee.Settings`,
      documentTypes: `${defaultHrPermissionName}Employee.Setting.DocumentTypes`,
    },
  },
  payroll: {
    root: `${defaultModulePermissionName}${defaultHrPermissionName}Payroll`,
    dashboard: `${defaultHrPermissionName}PayrollManagement`,
    runPayroll: `${defaultHrPermissionName}PayrollManagement.RunPayroll`,
    generateSalarySlip: `${defaultHrPermissionName}PayrollManagement.GenerateSalarySlip`,
    settings: {
      root: `${defaultModulePermissionName}${defaultHrPermissionName}Payroll.Settings`,
      earningComponents: `${defaultHrPermissionName}PayrollManagement.Settings.EarningComponents`,
      deductionComponents: `${defaultHrPermissionName}PayrollManagement.Settings.DeductionComponents`,
      pfRule: `${defaultHrPermissionName}PayrollManagement.Settings.PfRule`,
    },
  },
  attendance: {
    root: `${defaultModulePermissionName}${defaultHrPermissionName}AttendanceManagement`,
    importAttendance: `${defaultHrPermissionName}AttendanceAndLeave.ImportAttendance`,
    leaveManagement: `${defaultHrPermissionName}AttendanceAndLeave.LeaveManagement`,
    attendanceTracking: `${defaultHrPermissionName}AttendanceAndLeave.AttendanceTracking`,
    setting: {
      root: `${defaultModulePermissionName}${defaultHrPermissionName}AttendanceManagement.Settings`,
      shiftManagement: `${defaultHrPermissionName}AttendanceAndLeave.Setting.ShiftManagement`,
      leaveType: `${defaultHrPermissionName}AttendanceAndLeave.Setting.LeaveType`,
      leavePolicy: `${defaultHrPermissionName}AttendanceAndLeave.Setting.LeavePolicy`,
    },
  },
  professionalManagement: `${defaultModulePermissionName}${defaultHrPermissionName}ProfessionalManagement`,
  reports: `${defaultModulePermissionName}${defaultHrPermissionName}Reports`,
  notification: `${defaultModulePermissionName}${defaultHrPermissionName}Notification`,
};

const hrModule = (isDdvs: boolean) => ({
  [hrPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: hrPaths.dashboard,
          _action: 'dashboard',
          shortcutKey: 'Alt+H+1',
          shortcutKeyName: 'Alt+H+1',
          permissionName: hrPermissions.dashboard,
          disabled: !isDdvs,
        },
        {
          title: 'Employee',
          path: hrPaths.employee.root,
          _action: 'employee',
          shortcutKey: 'Alt+H+E',
          shortcutKeyName: 'Alt+H+E',
          permissionName: hrPermissions.employee.root,
          children: [
            {
              title: 'Employee List',
              path: hrPaths.employee.list,
              _action: 'employee-list',
              shortcutKey: 'Alt+H+E+1',
              shortcutKeyName: 'Alt+H+E+1',
              permissionName: hrPermissions.employee.list,
            },
            {
              title: 'I-card',
              path: hrPaths.employee.iCard,
              _action: 'i-card',
              disabled: !isDdvs,
              caption: 'Coming Soon',
              shortcutKey: 'Alt+H+E+2',
              shortcutKeyName: 'Alt+H+E+2',
              permissionName: hrPermissions.employee.iCard,
            },
            {
              title: 'Setting',
              path: hrPaths.employee.setting.root,
              _action: 'hr-setting',
              shortcutKey: 'Alt+H+S',
              shortcutKeyName: 'Alt+H+S',
              permissionName: hrPermissions.employee.setting.root,
              children: [
                {
                  title: 'Document Types',
                  path: hrPaths.employee.setting.documentTypes,
                  _action: 'hr-document-types',
                  shortcutKey: 'Alt+H+S+1',
                  shortcutKeyName: 'Alt+H+S+1',
                  permissionName: hrPermissions.employee.setting.documentTypes,
                },
              ],
            },
          ],
        },
        {
          title: 'Payroll Management',
          path: hrPaths.payroll.root,
          _action: 'payroll-management',
          shortcutKey: 'Alt+H+P',
          shortcutKeyName: 'Alt+H+P',
          permissionName: hrPermissions.payroll.root,
          children: [
            {
              title: 'Dashboard',
              path: hrPaths.payroll.dashboard,
              _action: 'payroll-dashboard',
              shortcutKey: 'Alt+H+P+1',
              shortcutKeyName: 'Alt+H+P+1',
              permissionName: hrPermissions.payroll.dashboard,
            },
            {
              title: 'Run Payroll',
              path: hrPaths.payroll.runPayroll,
              _action: 'run-payroll',
              shortcutKey: 'Alt+H+P+2',
              shortcutKeyName: 'Alt+H+P+2',
              permissionName: hrPermissions.payroll.runPayroll,
            },
            {
              title: 'Generate Salary Slip',
              path: hrPaths.payroll.generateSalarySlip,
              _action: 'generate-salary-slip',
              shortcutKey: 'Alt+H+P+3',
              shortcutKeyName: 'Alt+H+P+3',
              permissionName: hrPermissions.payroll.generateSalarySlip,
            },
            {
              title: 'Settings',
              path: hrPaths.payroll.settings.root,
              _action: 'payroll-setting',
              shortcutKey: 'Alt+H+P+4',
              shortcutKeyName: 'Alt+H+P+4',
              permissionName: hrPermissions.payroll.settings.root,
              children: [
                {
                  title: 'Earning Components',
                  path: hrPaths.payroll.settings.earningComponents,
                  _action: 'payroll-setting-earning-components',
                  shortcutKey: 'Alt+H+P+4',
                  shortcutKeyName: 'Alt+H+P+4',
                  permissionName: hrPermissions.payroll.settings.earningComponents,
                },
                {
                  title: 'Deduction Components',
                  path: hrPaths.payroll.settings.deductionComponents,
                  _action: 'payroll-setting-deduction-components',
                  shortcutKey: 'Alt+H+P+4+2',
                  shortcutKeyName: 'Alt+H+P+4+2',
                  permissionName: hrPermissions.payroll.settings.deductionComponents,
                },
                {
                  title: 'PF Rule',
                  path: hrPaths.payroll.settings.pfRule,
                  _action: 'payroll-setting-pf',
                  shortcutKey: 'Alt+H+P+4+2',
                  shortcutKeyName: 'Alt+H+P+4+2',
                  permissionName: hrPermissions.payroll.settings.pfRule,
                },
              ],
            },
          ],
        },
        {
          title: 'Attendance & Leave',
          path: hrPaths.attendance.root,
          _action: 'attendance-and-leave-management',
          shortcutKey: 'Alt+H+A',
          shortcutKeyName: 'Alt+H+A',
          permissionName: hrPermissions.attendance.root,
          children: [
            {
              title: 'Import Attendance',
              path: hrPaths.attendance.importAttendance,
              _action: 'biometric-integration',
              shortcutKey: 'Alt+H+A+1',
              shortcutKeyName: 'Alt+H+A+1',
              permissionName: hrPermissions.attendance.importAttendance,
            },
            {
              title: 'Leave Management',
              path: hrPaths.attendance.leaveManagement,
              _action: 'leave-requests-and-approvals',
              shortcutKey: 'Alt+H+A+2',
              shortcutKeyName: 'Alt+H+A+2',
              permissionName: hrPermissions.attendance.leaveManagement,
            },
            {
              title: 'Attendance Tracking',
              path: hrPaths.attendance.attendanceTracking,
              _action: 'attendance-tracking',
              shortcutKey: 'Alt+H+A+3',
              shortcutKeyName: 'Alt+H+A+3',
              permissionName: hrPermissions.attendance.attendanceTracking,
            },
            {
              title: 'Setting',
              path: hrPaths.attendance.setting.root,
              _action: 'setting',
              shortcutKey: 'Alt+H+A+4',
              shortcutKeyName: 'Alt+H+A+4',
              permissionName: hrPermissions.attendance.setting.root,
              children: [
                {
                  title: 'Shift Management',
                  path: hrPaths.attendance.setting.shiftManagement,
                  _action: 'shift-management',
                  shortcutKey: 'Alt+H+A+4+1',
                  shortcutKeyName: 'Alt+H+A+4+1',
                  permissionName: hrPermissions.attendance.setting.shiftManagement,
                },
                {
                  title: 'Leave Type',
                  path: hrPaths.attendance.setting.leaveType,
                  _action: 'leave-type',
                  shortcutKey: 'Alt+H+A+4+2',
                  shortcutKeyName: 'Alt+H+A+4+2',
                  permissionName: hrPermissions.attendance.setting.leaveType,
                },
                {
                  title: 'Leave Policy',
                  path: hrPaths.attendance.setting.leavePolicy,
                  _action: 'leave-policy',
                  shortcutKey: 'Alt+H+A+4+3',
                  shortcutKeyName: 'Alt+H+A+4+3',
                  permissionName: hrPermissions.attendance.setting.leavePolicy,
                },
              ],
            },
          ],
        },
        {
          title: 'Professional Management',
          path: hrPaths.professionalManagement,
          _action: 'professional-management',
          disabled: !isDdvs,
          caption: 'Coming Soon',
          shortcutKey: 'Alt+H+M',
          shortcutKeyName: 'Alt+H+M',
          permissionName: hrPermissions.professionalManagement,
        },
        {
          title: 'Reports',
          path: hrPaths.reports,
          _action: 'reports',
          shortcutKey: 'Alt+H+R',
          shortcutKeyName: 'Alt+H+R',
          permissionName: hrPermissions.reports,
        },
        // {
        //   title: 'Events & Holidays',
        //   _action: 'events-holidays',
        //   path: '/hr/events-holidays',
        //   shortcutKey: 'Alt+H+V',
        //   shortcutKeyName: 'Alt+H+V',
        // },
        {
          title: 'Notification',
          path: hrPaths.notification,
          _action: 'hr-notification',
          permissionName: hrPermissions.notification,
        },
      ],
    },
  ],
});

export default hrModule;
