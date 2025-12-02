import { hostelPath } from 'src/routes/paths';

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

export default hostelModule;
