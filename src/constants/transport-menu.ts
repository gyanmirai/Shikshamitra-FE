import { transportPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultTransportPermissionName = 'Transport.';

export const transportPaths = {
  dashboard: '/transport/dashboard',
  stopManagement: '/transport/stopManagement',
  routeManagement: '/transport/routeManagement',
  vehicleManagement: '/transport/vehicle-management',
  driverManagement: '/transport/driverManagement',
  applicationManagement: '/transport/application-management',
  reports: '/transport/reports-analytics',
  notification: '/transport/transport-notification',
  settings: {
    root: '/transport/settings',
    vehicleType: '/transport/settings/vehicleType',
    vehicleDocument: '/transport/settings/vehicleDocument',
    serviceType: '/transport/settings/serviceType',
    feeConfiguration: '/transport/settings/feeConfiguration',
    zoneAreaConfiguration: '/transport/settings/zoneAreaConfiguration',
  },
};

export const transportPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultTransportPermissionName}Dashboard`,
  stopManagement: `${defaultModulePermissionName}${defaultTransportPermissionName}StopManagement`,
  routeManagement: `${defaultModulePermissionName}${defaultTransportPermissionName}RouteManagement`,
  vehicleManagement: `${defaultModulePermissionName}${defaultTransportPermissionName}VehicleManagement`,
  driverManagement: `${defaultModulePermissionName}${defaultTransportPermissionName}TransportStaffManagement`,
  applicationManagement: `${defaultModulePermissionName}${defaultTransportPermissionName}ApplicationManagement`,
  reports: `${defaultModulePermissionName}${defaultTransportPermissionName}Reports`,
  notification: `${defaultModulePermissionName}${defaultTransportPermissionName}Notification`,
  settings: {
    root: `${defaultModulePermissionName}${defaultTransportPermissionName}Settings`,
    vehicleType: `${defaultTransportPermissionName}Settings.VehicleType`,
    vehicleDocument: `${defaultTransportPermissionName}Settings.VehicleDocument`,
    serviceType: `${defaultTransportPermissionName}Settings.ServicingType`,
    feeConfiguration: `${defaultTransportPermissionName}Settings.FeeConfiguration`,
    zoneAreaConfiguration: `${defaultTransportPermissionName}Settings.ZoneAreaConfiguration`,
  },
};

const transportModule = {
  [transportPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: transportPaths.dashboard,
          _action: 'transport-dashboard',
          shortcutKey: 'Alt+T+1',
          caption: 'Coming Soon',
          shortcutKeyName: 'Alt+T+1',
          permissionName: transportPermissions.dashboard,
        },
        {
          title: 'Stop Management',
          path: transportPaths.stopManagement,
          _action: 'stop-management',
          shortcutKey: 'Alt+T+4',
          shortcutKeyName: 'Alt+T+4',
          permissionName: transportPermissions.stopManagement,
        },
        {
          title: 'Route Management',
          path: transportPaths.routeManagement,
          _action: 'routes-schedules',
          shortcutKey: 'Alt+T+2',
          shortcutKeyName: 'Alt+T+2',
          permissionName: transportPermissions.routeManagement,
        },
        {
          title: 'Vehicle Management',
          path: transportPaths.vehicleManagement,
          _action: 'vehicle-management',
          shortcutKey: 'Alt+T+3',
          shortcutKeyName: 'Alt+T+3',
          permissionName: transportPermissions.vehicleManagement,
        },
        {
          title: 'Transport Staff Management',
          path: transportPaths.driverManagement,
          _action: 'driver-management',
          shortcutKey: 'Alt+T+3',
          shortcutKeyName: 'Alt+T+3',
          permissionName: transportPermissions.driverManagement,
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
          path: transportPaths.applicationManagement,
          _action: 'application-management',
          shortcutKey: 'Alt+T+5',
          shortcutKeyName: 'Alt+T+5',
          permissionName: transportPermissions.applicationManagement,
        },
        {
          title: 'Reports',
          path: transportPaths.reports,
          _action: 'reports-analytics',
          shortcutKey: 'Alt+T+6',
          shortcutKeyName: 'Alt+T+6',
          caption: 'Coming Soon',
          permissionName: transportPermissions.reports,
        },
        {
          title: 'Notification',
          path: transportPaths.notification,
          _action: 'transport-notification',
          permissionName: transportPermissions.notification,
        },
        {
          title: 'Settings',
          path: transportPaths.settings.root,
          _action: 'settings',
          shortcutKey: 'Alt+T+S',
          shortcutKeyName: 'Alt+T+S',
          permissionName: transportPermissions.settings.root,
          children: [
            {
              title: 'Vehicle Type',
              path: transportPaths.settings.vehicleType,
              _action: 'vehicle-type',
              shortcutKey: 'Alt+T+S+1',
              shortcutKeyName: 'Alt+T+S+1',
              permissionName: transportPermissions.settings.vehicleType,
            },
            {
              title: 'Required Vehicle Document',
              path: transportPaths.settings.vehicleDocument,
              _action: 'vehicle-document',
              shortcutKey: 'Alt+T+S+2',
              shortcutKeyName: 'Alt+T+S+2',
              permissionName: transportPermissions.settings.vehicleDocument,
            },
            {
              title: 'Servicing Type',
              path: transportPaths.settings.serviceType,
              _action: 'service-type',
              shortcutKey: 'Alt+T+S+3',
              shortcutKeyName: 'Alt+T+S+3',
              permissionName: transportPermissions.settings.serviceType,
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
              path: transportPaths.settings.feeConfiguration,
              _action: 'fee-configuration',
              shortcutKey: 'Alt+T+S+6',
              shortcutKeyName: 'Alt+T+S+6',
              permissionName: transportPermissions.settings.feeConfiguration,
            },
            {
              title: 'Zone/Area Configuration',
              path: transportPaths.settings.zoneAreaConfiguration,
              _action: 'zone-area-configuration',
              shortcutKey: 'Alt+T+S+6',
              shortcutKeyName: 'Alt+T+S+6',
              permissionName: transportPermissions.settings.zoneAreaConfiguration,
            },
          ],
        },
      ],
    },
  ],
};

export default transportModule;
