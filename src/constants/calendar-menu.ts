import { calendarPath } from 'src/routes/paths';

const calendarModule = {
  [calendarPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/calendar/dashboard',
          _action: 'dashboard',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
        },
        {
          title: 'Calendar View',
          path: '/calendar/view',
          _action: 'view',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
        },
        {
          title: 'Events',
          path: '/calendar/events',
          _action: 'events',
          shortcutKey: 'Alt+C+E',
          shortcutKeyName: 'Alt+C+E',
        },
        {
          title: 'Holidays',
          path: '/calendar/holidays',
          _action: 'meetings',
          shortcutKey: 'Alt+C+T',
          shortcutKeyName: 'Alt+C+T',
        },
        {
          title: 'Group Management',
          path: '/calendar/group-management',
          _action: 'group-management',
          shortcutKey: 'Alt+C+G',
          shortcutKeyName: 'Alt+C+G',
        },
        {
          title: 'Settings',
          path: '/calendar/settings',
          _action: 'settings',
          shortcutKey: 'Alt+C+S',
          shortcutKeyName: 'Alt+C+S',
          children: [
            {
              title: 'Event Type',
              path: '/calendar/setting/eventType',
              _action: 'setting-eventType',
              shortcutKey: 'Alt+C+S+4',
              shortcutKeyName: 'Alt+C+S+4',
            },
            {
              title: 'Holiday Type',
              path: '/calendar/setting/holidayType',
              _action: 'setting-holidayType',
              shortcutKey: 'Alt+C+S+6',
              shortcutKeyName: 'Alt+C+S+6',
            },
          ],
        },
      ],
    },
  ],
};

export default calendarModule;
