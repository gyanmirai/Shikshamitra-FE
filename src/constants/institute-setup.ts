import { settingPath } from 'src/routes/paths';

import menuIconView from './icon-view';
import { defaultModulePermissionName } from './student-menu';

const defaultInstituteSetupPermissionName = 'InstituteSetup.';

export const instituteSetupPaths = {
  academicSetup: '/setting/academic-setup',
  schoolIdentity: '/setting/school-identity',
  shiftManagement: '/setting/shift-management',
  roomsManagement: {
    root: '/setting/room-management',
    building: '/setting/building-management',
    roomType: '/setting/room-type',
    room: '/setting/room',
  },
};

export const instituteSetupPermissions = {
  root: `${defaultModulePermissionName}InstituteSetup`,
  academicSetup: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}AcademicSetup`,
  schoolIdentity: 'InstituteSetup.SchoolIdentity.View',
  shiftManagement: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}ShiftManagement`,
  roomsManagement: {
    root: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomManagement`,
    building: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}BuildingManagement`,
    roomType: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomTypeManagement`,
    room: `${defaultModulePermissionName}${defaultInstituteSetupPermissionName}RoomManagement.Room`,
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
          icon: menuIconView('mdi:school-outline'),
        },
        {
          title: 'School Identity',
          path: instituteSetupPaths.schoolIdentity,
          _action: 'school-identity',
          permissionName: instituteSetupPermissions.schoolIdentity,
          visibilityPermissionName: 'ShikshaMitra.Module.InstituteSetup.SchoolIdentity',
          icon: menuIconView('mdi:badge-account-horizontal-outline'),
        },
        {
          title: 'Shift Management',
          path: instituteSetupPaths.shiftManagement,
          _action: 'shift-management',
          shortcutKey: 'Ctrl+S',
          shortcutKeyName: 'Ctrl+S',
          permissionName: instituteSetupPermissions.shiftManagement,
          icon: menuIconView('mdi:clock-time-three-outline'),
        },
        {
          title: 'Rooms Management',
          path: instituteSetupPaths.roomsManagement.root,
          _action: 'building-management',
          shortcutKey: 'Ctrl+B',
          shortcutKeyName: 'Ctrl+B',
          permissionName: instituteSetupPermissions.roomsManagement.root,
          icon: menuIconView('mdi:door-closed'),
          children: [
            {
              title: 'Building Management',
              path: instituteSetupPaths.roomsManagement.building,
              _action: 'building-list',
              shortcutKey: 'Ctrl+B+L',
              shortcutKeyName: 'Ctrl+B+L',
              permissionName: instituteSetupPermissions.roomsManagement.building,
              icon: menuIconView('mdi:office-building'),
            },
            {
              title: 'Room Type Management',
              path: instituteSetupPaths.roomsManagement.roomType,
              _action: 'room-type-management',
              shortcutKey: 'Ctrl+B+T',
              shortcutKeyName: 'Ctrl+B+T',
              permissionName: instituteSetupPermissions.roomsManagement.roomType,
              icon: menuIconView('mdi:door-sliding'),
            },
            {
              title: 'Room Management',
              path: instituteSetupPaths.roomsManagement.room,
              _action: 'room-management',
              shortcutKey: 'Ctrl+B+R',
              shortcutKeyName: 'Ctrl+B+R',
              permissionName: instituteSetupPermissions.roomsManagement.room,
              icon: menuIconView('mdi:door-closed'),
            },
          ],
        },
      ],
    },
  ],
};

export default instituteSetupModule;
