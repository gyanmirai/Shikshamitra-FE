import { calendarPath } from 'src/routes/paths';

import menuIconView from './icon-view';
import { defaultModulePermissionName } from './student-menu';

const defaultCalendarPermissionName = 'Calendar.';

export const calendarPaths = {
  dashboard: '/calendar/dashboard',
  view: '/calendar/view',
  events: '/calendar/events',
  holidays: '/calendar/holidays',
  groupManagement: '/calendar/group-management',
  settings: {
    root: '/calendar/settings',
    eventType: '/calendar/setting/eventType',
    holidayType: '/calendar/setting/holidayType',
  },
};

export const calendarPermissions = {
  root: `${defaultModulePermissionName}Calendar`,
  dashboard: `${defaultModulePermissionName}${defaultCalendarPermissionName}Dashboard`,
  view: `${defaultModulePermissionName}${defaultCalendarPermissionName}CalendarView`,
  events: `${defaultModulePermissionName}${defaultCalendarPermissionName}Events`,
  holidays: `${defaultModulePermissionName}${defaultCalendarPermissionName}Holidays`,
  groupManagement: `${defaultModulePermissionName}${defaultCalendarPermissionName}GroupManagement`,
  settings: {
    root: `${defaultModulePermissionName}${defaultCalendarPermissionName}Settings`,
    eventType: `${defaultCalendarPermissionName}Settings.EventType`,
    holidayType: `${defaultCalendarPermissionName}Settings.HolidayType`,
  },
};

const calendarModule = {
  [calendarPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: calendarPaths.dashboard,
          _action: 'dashboard',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
          permissionName: calendarPermissions.dashboard,
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
        {
          title: 'Calendar View',
          path: calendarPaths.view,
          _action: 'view',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
          permissionName: calendarPermissions.view,
          icon: menuIconView('mdi:calendar-month-outline'),
        },
        {
          title: 'Events',
          path: calendarPaths.events,
          _action: 'events',
          shortcutKey: 'Alt+C+E',
          shortcutKeyName: 'Alt+C+E',
          permissionName: calendarPermissions.events,
          icon: menuIconView('mdi:calendar-clock-outline'),
        },
        {
          title: 'Holidays',
          path: calendarPaths.holidays,
          _action: 'meetings',
          shortcutKey: 'Alt+C+T',
          shortcutKeyName: 'Alt+C+T',
          permissionName: calendarPermissions.holidays,
          icon: menuIconView('mdi:calendar-heart-outline'),
        },
        {
          title: 'Group Management',
          path: calendarPaths.groupManagement,
          _action: 'group-management',
          shortcutKey: 'Alt+C+G',
          shortcutKeyName: 'Alt+C+G',
          permissionName: calendarPermissions.groupManagement,
          icon: menuIconView('mdi:account-group-outline'),
        },
        {
          title: 'Settings',
          path: calendarPaths.settings.root,
          _action: 'settings',
          shortcutKey: 'Alt+C+S',
          shortcutKeyName: 'Alt+C+S',
          permissionName: calendarPermissions.settings.root,
          icon: menuIconView('mdi:cog-outline'),
          children: [
            {
              title: 'Event Type',
              path: calendarPaths.settings.eventType,
              _action: 'setting-eventType',
              shortcutKey: 'Alt+C+S+4',
              shortcutKeyName: 'Alt+C+S+4',
              permissionName: calendarPermissions.settings.eventType,
              icon: menuIconView('mdi:calendar-edit-outline'),
            },
            {
              title: 'Holiday Type',
              path: calendarPaths.settings.holidayType,
              _action: 'setting-holidayType',
              shortcutKey: 'Alt+C+S+6',
              shortcutKeyName: 'Alt+C+S+6',
              permissionName: calendarPermissions.settings.holidayType,
              icon: menuIconView('mdi:calendar-star-outline'),
            },
          ],
        },
      ],
    },
  ],
};

export default calendarModule;
