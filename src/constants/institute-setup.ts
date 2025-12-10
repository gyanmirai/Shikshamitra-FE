import { settingPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultInstituteSetupPermissionName = 'InstituteSetup.';

export const instituteSetupPaths = {
  academicSetup: '/setting/academic-setup',
  shiftManagement: '/setting/shift-management',
  roomsManagement: {
    root: '/setting/room-management',
    building: '/setting/building-management',
    roomType: '/setting/room-type',
    room: '/setting/room',
  },
};

export const instituteSetupPermissions = {
  academicSetup: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}AcademicSetup`,
  shiftManagement: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}ShiftManagement`,
  roomsManagement: {
    root: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomsManagement`,
    building: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomsManagement.BuildingManagement`,
    roomType: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomsManagement.RoomTypeManagement`,
    room: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomsManagement.RoomManagement`,
  },
};

const instituteSetupModule = {
  [settingPath]: [
    {
      subheader: '',
      items: [
        // {
        //   title: 'Basic Information',
        //   path: '/setting/basic-information',
        //   _action: 'basic-information',
        //   shortcutKey: 'Ctrl+B',
        //   shortcutKeyName: 'Ctrl+B',
        // },
        {
          title: 'Academic Setup',
          path: instituteSetupPaths.academicSetup,
          _action: 'academic-year-setup',
          shortcutKey: 'Ctrl+A',
          shortcutKeyName: 'Ctrl+A',
          permissionName: instituteSetupPermissions.academicSetup,
        },
        {
          title: 'Shift Management',
          path: instituteSetupPaths.shiftManagement,
          _action: 'shift-management',
          shortcutKey: 'Ctrl+S',
          shortcutKeyName: 'Ctrl+S',
          permissionName: instituteSetupPermissions.shiftManagement,
        },
        {
          title: 'Rooms Management',
          path: instituteSetupPaths.roomsManagement.root,
          _action: 'building-management',
          shortcutKey: 'Ctrl+B',
          shortcutKeyName: 'Ctrl+B',
          permissionName: instituteSetupPermissions.roomsManagement.root,
          children: [
            {
              title: 'Building Management',
              path: instituteSetupPaths.roomsManagement.building,
              _action: 'building-list',
              shortcutKey: 'Ctrl+B+L',
              shortcutKeyName: 'Ctrl+B+L',
              permissionName: instituteSetupPermissions.roomsManagement.building,
            },
            {
              title: 'Room Type Management',
              path: instituteSetupPaths.roomsManagement.roomType,
              _action: 'room-type-management',
              shortcutKey: 'Ctrl+B+T',
              shortcutKeyName: 'Ctrl+B+T',
              permissionName: instituteSetupPermissions.roomsManagement.roomType,
            },
            {
              title: 'Room Management',
              path: instituteSetupPaths.roomsManagement.room,
              _action: 'room-management',
              shortcutKey: 'Ctrl+B+R',
              shortcutKeyName: 'Ctrl+B+R',
              permissionName: instituteSetupPermissions.roomsManagement.room,
            },
          ],
        },
      ],
    },
  ],
};

export default instituteSetupModule;
