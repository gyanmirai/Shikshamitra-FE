import { securityGuardPath } from 'src/routes/paths';

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

export default securityGuardModule;
