import { communicationPath } from 'src/routes/paths';

import menuIconView from './icon-view';
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
  inbox: '/communication/messages',
  settings: {
    root: '/communication/settings',
    announcementType: '/communication/settings/announcementType',
    deliveryChannelType: '/communication/settings/deliveryChannelType',
    importanceLevel: '/communication/settings/importanceLevel',
  },
};

export const communicationPermissions = {
  root: `${defaultModulePermissionName}Communication`,
  dashboard: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Dashboard`,
  announcement: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Announcements`,
  notification: {
    root: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Notification`,
    sent: `${defaultCommunicationPermissionName}Notification.SentNotification`,
    templates: `${defaultCommunicationPermissionName}Notification.Templates`,
    setting: `${defaultCommunicationPermissionName}Notification.NotificationSetting`,
  },
  history: `${defaultCommunicationPermissionName}History.View`,
  inbox: `${defaultCommunicationPermissionName}Inbox.View`,
  settings: {
    root: `${defaultModulePermissionName}${defaultCommunicationPermissionName}Settings`,
    announcementType: `${defaultCommunicationPermissionName}Settings.AnnouncementType`,
    providerSettings: `${defaultCommunicationPermissionName}Settings.ProviderSettings.View`,
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
          icon: menuIconView('mdi:bell-outline'),
        },
        {
          title: 'Announcements',
          path: communicationPaths.announcements,
          _action: 'announcement',
          shortcutKey: 'Alt+C+A',
          shortcutKeyName: 'Alt+C+A',
          permissionName: communicationPermissions.announcement,
          icon: menuIconView('mdi:bullhorn-outline'),
        },
        {
          title: 'Notification',
          path: communicationPaths.notification.root,
          _action: 'notification',
          shortcutKey: 'Alt+C+N',
          shortcutKeyName: 'Alt+C+N',
          permissionName: communicationPermissions.notification.root,
          icon: menuIconView('mdi:bell-outline'),
          children: [
            {
              title: 'Sent Notification',
              path: communicationPaths.notification.sent,
              _action: 'send-notification',
              shortcutKey: 'Alt+C+N+1',
              shortcutKeyName: 'Alt+C+N+1',
              permissionName: communicationPermissions.notification.sent,
              icon: menuIconView('mdi:send-check-outline'),
            },
            {
              title: 'Templates',
              path: communicationPaths.notification.templates,
              _action: 'templates',
              shortcutKey: 'Alt+C+T',
              shortcutKeyName: 'Alt+C+T',
              permissionName: communicationPermissions.notification.templates,
              icon: menuIconView('mdi:file-document-outline'),
            },
            {
              title: 'Notification Setting',
              path: communicationPaths.notification.setting,
              _action: 'notification-setting',
              shortcutKey: 'Alt+C+N+3',
              shortcutKeyName: 'Alt+C+N+3',
              permissionName: communicationPermissions.notification.setting,
              icon: menuIconView('mdi:cog-outline'),
            },
          ],
        },
        {
          title: 'History',
          path: communicationPaths.history,
          _action: 'history',
          shortcutKey: 'Alt+C+H',
          shortcutKeyName: 'Alt+C+H',
          permissionName: communicationPermissions.history,
          icon: menuIconView('mdi:history'),
        },
        {
          title: 'Inbox',
          path: communicationPaths.inbox,
          _action: 'inbox',
          shortcutKey: 'Alt+C+I',
          shortcutKeyName: 'Alt+C+I',
          permissionName: communicationPermissions.inbox,
          icon: menuIconView('mdi:inbox-outline'),
        },
        {
          title: 'Settings',
          path: communicationPaths.settings.root,
          _action: 'settings',
          shortcutKey: 'Alt+C+S',
          shortcutKeyName: 'Alt+C+S',
          permissionName: communicationPermissions.settings.root,
          icon: menuIconView('mdi:cog-outline'),
          children: [
            {
              title: 'Announcement Type',
              path: communicationPaths.settings.announcementType,
              _action: 'settings-announcementType',
              shortcutKey: 'Alt+C+S+5',
              shortcutKeyName: 'Alt+C+S+5',
              permissionName: communicationPermissions.settings.announcementType,
              icon: menuIconView('mdi:format-list-bulleted'),
            },
            {
              title: 'Provider Settings',
              path: communicationPaths.settings.deliveryChannelType,
              _action: 'settings-deliveryChannelType',
              shortcutKey: 'Alt+C+S+1',
              shortcutKeyName: 'Alt+C+S+1',
              permissionName: communicationPermissions.settings.providerSettings,
              icon: menuIconView('mdi:message-cog-outline'),
            },
            {
              title: 'Importance Levels',
              path: communicationPaths.settings.importanceLevel,
              _action: 'settings-importanceLevel',
              shortcutKey: 'Alt+C+S+2',
              shortcutKeyName: 'Alt+C+S+2',
              permissionName: communicationPermissions.settings.providerSettings,
              icon: menuIconView('mdi:priority-high'),
            },
          ],
        },
      ],
    },
  ],
};

export default communicationModule;
