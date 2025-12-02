import { settingPath } from 'src/routes/paths';

const instituteSetupModule = {
  [settingPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Basic Information',
          path: '/setting/basic-information',
          _action: 'basic-information',
          shortcutKey: 'Ctrl+B',
          shortcutKeyName: 'Ctrl+B',
        },
        {
          title: 'Academic Setup',
          path: '/setting/academic-setup',
          _action: 'academic-year-setup',
          shortcutKey: 'Ctrl+A',
          shortcutKeyName: 'Ctrl+A',
        },
        {
          title: 'Shift Management',
          path: '/setting/shift-management',
          _action: 'shift-management',
          shortcutKey: 'Ctrl+S',
          shortcutKeyName: 'Ctrl+S',
        },
        {
          title: 'Rooms Management',
          path: '/setting/room-management',
          _action: 'building-management',
          shortcutKey: 'Ctrl+B',
          shortcutKeyName: 'Ctrl+B',
          children: [
            {
              title: 'Building Management',
              path: '/setting/building-management',
              _action: 'building-list',
              shortcutKey: 'Ctrl+B+L',
              shortcutKeyName: 'Ctrl+B+L',
            },
            {
              title: 'Room Type Management',
              path: '/setting/room-type',
              _action: 'room-type-management',
              shortcutKey: 'Ctrl+B+T',
              shortcutKeyName: 'Ctrl+B+T',
            },
            {
              title: 'Room Management',
              path: '/setting/room',
              _action: 'room-management',
              shortcutKey: 'Ctrl+B+R',
              shortcutKeyName: 'Ctrl+B+R',
            },
          ],
        },
      ],
    },
  ],
};

export default instituteSetupModule;
