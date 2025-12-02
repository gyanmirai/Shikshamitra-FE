import { transportPath } from 'src/routes/paths';

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
          caption: 'Coming Soon',
          shortcutKeyName: 'Alt+T+1',
        },
        {
          title: 'Stop Management',
          path: '/transport/stopManagement',
          _action: 'stop-management',
          shortcutKey: 'Alt+T+4',
          shortcutKeyName: 'Alt+T+4',
        },
        {
          title: 'Route Management',
          path: '/transport/routeManagement',
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
          title: ' Transport Staff Management',
          path: '/transport/driverManagement',
          _action: 'driver-management',
          shortcutKey: 'Alt+T+3',
          shortcutKeyName: 'Alt+T+3',
        },
        // {
        //   title: 'Route Allocation',
        //   path: '/transport/member-transport',
        //   _action: 'member-transport',
        //   shortcutKey: 'Alt+T+4',
        //   shortcutKeyName: 'Alt+T+4',
        // },
        {
          title: 'Application Management',
          path: '/transport/application-management',
          _action: 'application-management',
          shortcutKey: 'Alt+T+5',
          shortcutKeyName: 'Alt+T+5',
        },
        {
          title: 'Reports',
          path: '/transport/reports-analytics',
          _action: 'reports-analytics',
          shortcutKey: 'Alt+T+6',
          shortcutKeyName: 'Alt+T+6',
          caption: 'Coming Soon',
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
          children: [
            {
              title: 'Vehicle Type',
              path: '/transport/settings/vehicleType',
              _action: 'vehicle-type',
              shortcutKey: 'Alt+T+S+1',
              shortcutKeyName: 'Alt+T+S+1',
            },
            {
              title: 'Required Vehicle Document',
              path: '/transport/settings/vehicleDocument',
              _action: 'vehicle-document',
              shortcutKey: 'Alt+T+S+2',
              shortcutKeyName: 'Alt+T+S+2',
            },
            {
              title: 'Servicing Type',
              path: '/transport/settings/serviceType',
              _action: 'service-type',
              shortcutKey: 'Alt+T+S+3',
              shortcutKeyName: 'Alt+T+S+3',
            },
            // {
            //   title: 'Licence Type',
            //   path: '/transport/settings/licenceType',
            //   _action: 'license-type',
            //   shortcutKey: 'Alt+T+S+4',
            //   shortcutKeyName: 'Alt+T+S+4',
            // },
            // {
            //   title: 'Fuel Type',
            //   path: '/transport/settings/fuelType',
            //   _action: 'fuel-type',
            //   shortcutKey: 'Alt+T+S+5',
            //   shortcutKeyName: 'Alt+T+S+5',
            // },
            {
              title: 'Fee Configuration',
              path: '/transport/settings/feeConfiguration',
              _action: 'fee-configuration',
              shortcutKey: 'Alt+T+S+6',
              shortcutKeyName: 'Alt+T+S+6',
            },
            {
              title: 'Zone/Area Configuration',
              path: '/transport/settings/zoneAreaConfiguration',
              _action: 'zone-area-configuration',
              shortcutKey: 'Alt+T+S+6',
              shortcutKeyName: 'Alt+T+S+6',
            },
          ],
        },
      ],
    },
  ],
};

export default transportModule;
