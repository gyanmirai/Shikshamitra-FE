import { communicationPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultCommunicationPermissionName = 'Communication.';

export const communicationPaths = {
  dashboard: '/communication/dashboard',
  announcements: '/communication/announcement',
  notification: {
    root: '',
    sent: '/communication/notification/send-notification',
    templates: '/communication/notification/templates',
    setting: '/communication/notification/notificationSetting',
  },
  history: '/communication/notification-history',
  settings: {
    root: '/communication/settings',
    announcementType: '/communication/settings/announcementType',
  },
};

export const communicationPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Dashboard`,
  announcement: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Announcement`,
  notification: {
    root: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Notification`,
    sent: `${defaultCommunicationPermissionName}Notification.SentNotification`,
    templates: `${defaultCommunicationPermissionName}Notification.Templates`,
    setting: `${defaultCommunicationPermissionName}Notification.NotificationSetting`,
  },
  history: `${defaultModulePermissionName}${defaultCommunicationPermissionName}NotificationHistory`,
  settings: {
    root: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Settings`,
    announcementType: `${defaultCommunicationPermissionName}Settings.AnnouncementType`,
  },
};

const communicationModule = {
  [communicationPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: communicationPaths.dashboard,
          _action: 'dashboard',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
          permissionName: communicationPermissions.dashboard,
        },
        {
          title: 'Announcements',
          path: communicationPaths.announcements,
          _action: 'announcement',
          shortcutKey: 'Alt+C+A',
          shortcutKeyName: 'Alt+C+A',
          permissionName: communicationPermissions.announcement,
        },
        {
          title: 'Notification',
          path: communicationPaths.notification.root,
          _action: 'notification',
          shortcutKey: 'Alt+C+N',
          shortcutKeyName: 'Alt+C+N',
          permissionName: communicationPermissions.notification.root,
          children: [
            {
              title: 'Sent Notification',
              path: communicationPaths.notification.sent,
              _action: 'send-notification',
              shortcutKey: 'Alt+C+N+1',
              shortcutKeyName: 'Alt+C+N+1',
              permissionName: communicationPermissions.notification.sent,
            },
            {
              title: 'Templates',
              path: communicationPaths.notification.templates,
              _action: 'templates',
              shortcutKey: 'Alt+C+T',
              shortcutKeyName: 'Alt+C+T',
              permissionName: communicationPermissions.notification.templates,
            },
            {
              title: 'Notification Setting',
              path: communicationPaths.notification.setting,
              _action: 'notification-setting',
              shortcutKey: 'Alt+C+N+3',
              shortcutKeyName: 'Alt+C+N+3',
              permissionName: communicationPermissions.notification.setting,
            },
          ],
        },
        {
          title: 'Notification History',
          path: communicationPaths.history,
          _action: 'notification-history',
          shortcutKey: 'Alt+C+H',
          shortcutKeyName: 'Alt+C+H',
          permissionName: communicationPermissions.history,
        },
        {
          title: 'Settings',
          path: communicationPaths.settings.root,
          _action: 'settings',
          shortcutKey: 'Alt+C+S',
          shortcutKeyName: 'Alt+C+S',
          permissionName: communicationPermissions.settings.root,
          children: [
            {
              title: 'Announcement Type',
              path: communicationPaths.settings.announcementType,
              _action: 'settings-announcementType',
              shortcutKey: 'Alt+C+S+5',
              shortcutKeyName: 'Alt+C+S+5',
              permissionName: communicationPermissions.settings.announcementType,
            },
          ],
        },
      ],
    },
  ],
};

export default communicationModule;
