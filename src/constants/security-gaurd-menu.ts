import { securityGuardPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultSecurityGuardPermissionName = 'SecurityGuard.';

export const securityGuardPaths = {
  dashboard: '/security-guard/dashboard',
  visitorManagement: {
    root: '',
    checkpoint: '/security-guard/visitor-management/visitor-check-in',
    preApproval: '/security-guard/visitor-management/visitor-pre-approval',
  },
  gatePass: {
    root: '',
    accessLogs: '/security-guard/gate-pass-management/access-logs-management',
    create: '/security-guard/gate-pass-management/create-gate-pass',
    request: '/security-guard/gate-pass-management/gate-pass',
    reviewRequest: '/security-guard/gate-pass-management/review-gate-pass-request',
    requestStaff: '/security-guard/gate-pass-management/gate-pass-staff',
    reviewRequestStaff: '/security-guard/gate-pass-management/review-gate-pass-staff',
  },
  guardManagement: {
    root: '',
    assignment: '/security-guard/guard-management/guard-assignment',
    dutySchedule: '/security-guard/guard-management/duty-schedule',
    shiftConfig: '/security-guard/guard-management/setting-configuration',
    dutyOverview: '/security-guard/guard-management/hand-over-notes',
  },
  alert: {
    root: '',
    live: '/security-guard/alert/live-security-alert',
    dashboard: '/security-guard/alert/alert-dashboard',
    report: '/security-guard/alert/alert-report',
  },
  reports: '/security-guard/reports',
};

export const securityGuardPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultSecurityGuardPermissionName}Dashboard`,
  visitorManagement: {
    root: `${defaultModulePermissionName}${defaultSecurityGuardPermissionName}VisitorManagement`,
    checkpoint: `${defaultSecurityGuardPermissionName}VisitorManagement.VisitorCheckIn`,
    preApproval: `${defaultSecurityGuardPermissionName}VisitorManagement.VisitorPreApproval`,
  },
  gatePass: {
    root: `${defaultModulePermissionName}${defaultSecurityGuardPermissionName}GatePassManagement`,
    accessLogs: `${defaultSecurityGuardPermissionName}GatePassManagement.AccessLogsManagement`,
    create: `${defaultSecurityGuardPermissionName}GatePassManagement.CreateGatePass`,
    request: `${defaultSecurityGuardPermissionName}GatePassManagement.GatePass`,
    reviewRequest: `${defaultSecurityGuardPermissionName}GatePassManagement.ReviewGatePassRequest`,
    requestStaff: `${defaultSecurityGuardPermissionName}GatePassManagement.GatePassStaff`,
    reviewRequestStaff: `${defaultSecurityGuardPermissionName}GatePassManagement.ReviewGatePassStaff`,
  },
  guardManagement: {
    root: `${defaultModulePermissionName}${defaultSecurityGuardPermissionName}GuardManagement`,
    assignment: `${defaultSecurityGuardPermissionName}GuardManagement.GuardAssignment`,
    dutySchedule: `${defaultSecurityGuardPermissionName}GuardManagement.DutySchedule`,
    shiftConfig: `${defaultSecurityGuardPermissionName}GuardManagement.SettingConfiguration`,
    dutyOverview: `${defaultSecurityGuardPermissionName}GuardManagement.HandOverNotes`,
  },
  alert: {
    root: `${defaultModulePermissionName}${defaultSecurityGuardPermissionName}Alert`,
    live: `${defaultSecurityGuardPermissionName}Alert.LiveSecurityAlert`,
    dashboard: `${defaultSecurityGuardPermissionName}Alert.AlertDashboard`,
    report: `${defaultSecurityGuardPermissionName}Alert.AlertReport`,
  },
  reports: `${defaultModulePermissionName}${defaultSecurityGuardPermissionName}Reports`,
};

const securityGuardModule = {
  [securityGuardPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: securityGuardPaths.dashboard,
          _action: 'dashboard',
          permissionName: securityGuardPermissions.dashboard,
        },

        {
          title: 'Visitor Management',
          path: securityGuardPaths.visitorManagement.root,
          _action: 'visitor-management',
          permissionName: securityGuardPermissions.visitorManagement.root,
          children: [
            {
              title: 'Visitor Checkpoint',
              path: securityGuardPaths.visitorManagement.checkpoint,
              _action: 'visitor-check-in',
              permissionName: securityGuardPermissions.visitorManagement.checkpoint,
            },
            {
              title: 'Visitor Pre Approval',
              path: securityGuardPaths.visitorManagement.preApproval,
              _action: 'visitor-pre-approval',
              permissionName: securityGuardPermissions.visitorManagement.preApproval,
            },
          ],
        },
        {
          title: 'Gate Pass Management',
          path: securityGuardPaths.gatePass.root,
          _action: 'gate-pass-management',
          permissionName: securityGuardPermissions.gatePass.root,
          children: [
            // {
            //   title: 'Gate Pass System',
            //   path: '/security-guard/gate-pass-management/gate-pass-system',
            //   _action: 'gate-pass-system',
            // },
            {
              title: 'Access Logs',
              path: securityGuardPaths.gatePass.accessLogs,
              _action: 'access-logs-management',
              permissionName: securityGuardPermissions.gatePass.accessLogs,
            },
            {
              title: 'Create Gate Pass',
              path: securityGuardPaths.gatePass.create,
              _action: 'create-gate-pass',
              permissionName: securityGuardPermissions.gatePass.create,
            },
            {
              title: 'Gate Pass Request',
              path: securityGuardPaths.gatePass.request,
              _action: 'gate-pass',
              permissionName: securityGuardPermissions.gatePass.request,
            },
            {
              title: 'Review Gate Pass Request',
              path: securityGuardPaths.gatePass.reviewRequest,
              _action: 'review-gate-pass-request',
              permissionName: securityGuardPermissions.gatePass.reviewRequest,
            },
            // {
            //   title: 'Access Logs Management security-guard',
            //   path: '/security-guard/gate-pass-management/access-logs-management-security-guard',
            //   _action: 'access-logs-management-security-guard',
            // },
            {
              title: 'Gate Pass Request',
              path: securityGuardPaths.gatePass.requestStaff,
              _action: 'gate-pass-staff',
              permissionName: securityGuardPermissions.gatePass.requestStaff,
            },
            {
              title: 'Review Gate Pass Request',
              path: securityGuardPaths.gatePass.reviewRequestStaff,
              _action: 'review-gate-pass-staff',
              permissionName: securityGuardPermissions.gatePass.reviewRequestStaff,
            },
          ],
        },

        {
          title: 'Guard Management',
          path: securityGuardPaths.guardManagement.root,
          _action: 'guard-management',
          permissionName: securityGuardPermissions.guardManagement.root,
          children: [
            {
              title: 'Guard Assignment',
              path: securityGuardPaths.guardManagement.assignment,
              _action: 'guard-assignment',
              permissionName: securityGuardPermissions.guardManagement.assignment,
            },
            {
              title: 'My Duty Schedule',
              path: securityGuardPaths.guardManagement.dutySchedule,
              _action: 'duty-schedule',
              permissionName: securityGuardPermissions.guardManagement.dutySchedule,
            },
            {
              title: 'Guard Shift Configuration',
              path: securityGuardPaths.guardManagement.shiftConfig,
              _action: 'setting-configuration',
              permissionName: securityGuardPermissions.guardManagement.shiftConfig,
            },
            {
              title: 'Guard Duty Overview',
              path: securityGuardPaths.guardManagement.dutyOverview,
              _action: 'hand-over-notes',
              permissionName: securityGuardPermissions.guardManagement.dutyOverview,
            },
          ],
        },

        {
          title: 'Alert',
          path: securityGuardPaths.alert.root,
          _action: 'alert',
          permissionName: securityGuardPermissions.alert.root,
          children: [
            {
              title: 'Live Security Alert',
              path: securityGuardPaths.alert.live,
              _action: 'live-security-alerts',
              permissionName: securityGuardPermissions.alert.live,
            },
            {
              title: 'Alert Dashboard',
              path: securityGuardPaths.alert.dashboard,
              _action: 'alert-dashboard',
              permissionName: securityGuardPermissions.alert.dashboard,
            },
            {
              title: 'Alert Report',
              path: securityGuardPaths.alert.report,
              _action: 'alert-report',
              permissionName: securityGuardPermissions.alert.report,
            },
          ],
        },
        {
          title: 'Reports',
          path: securityGuardPaths.reports,
          _action: 'reports',
          permissionName: securityGuardPermissions.reports,
        },
      ],
    },
  ],
};

export default securityGuardModule;
