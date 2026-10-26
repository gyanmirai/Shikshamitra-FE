import type { InstituteFormattingScope } from 'src/redux/InstituteSetup/institute-field-formatting-api';

type Field = { key: string; label: string; example: string; previewLabel?: string };
type Config = {
  fields: readonly Field[];
  viewPermission: string;
  editPermissions: readonly string[];
};
const institute = 'ShikshaMitra.Module.InstituteSetup';

export const INSTITUTE_FORMATTING_CONFIG: Record<InstituteFormattingScope, Config> = {
  buildings: {
    fields: [
      { key: 'buildingName', label: 'Building name', example: 'north building' },
      { key: 'floorName', label: 'Floor name', example: 'ground floor' },
      { key: 'description', label: 'Description', example: 'main school building' },
    ],
    viewPermission: `${institute}.BuildingManagement.View`,
    editPermissions: [`${institute}.BuildingManagement.Add`],
  },
  roomTypes: {
    fields: [
      { key: 'roomTypeName', label: 'Room type', example: 'science laboratory' },
      { key: 'shortName', label: 'Short name', example: 'sci lab' },
    ],
    viewPermission: `${institute}.RoomTypeManagement.View`,
    editPermissions: [`${institute}.RoomTypeManagement.Add`],
  },
  rooms: {
    fields: [
      { key: 'roomName', label: 'Room name/no.', example: 'classroom a' },
      {
        key: 'featureName',
        label: 'Extra feature',
        example: 'reading corner',
        previewLabel: 'New feature format',
      },
    ],
    viewPermission: `${institute}.RoomManagement.Room.View`,
    editPermissions: [`${institute}.RoomManagement.Room.Add`],
  },
  shifts: {
    fields: [{ key: 'shiftName', label: 'Shift name', example: 'morning shift' }],
    viewPermission: 'InstituteSetup.ShiftManagement.View',
    editPermissions: ['InstituteSetup.ShiftManagement.Edit'],
  },
  schoolIdentity: {
    fields: [
      { key: 'principalName', label: 'Principal’s name', example: 'principal name' },
      { key: 'designation', label: 'Designation', example: 'school principal' },
    ],
    viewPermission: 'InstituteSetup.SchoolIdentity.View',
    editPermissions: [
      'InstituteSetup.SchoolIdentity.ManageDefaults',
      'InstituteSetup.SchoolIdentity.AccessSignature',
    ],
  },
  schoolDocuments: {
    fields: [
      { key: 'name', label: 'Document name', example: 'school approval' },
      { key: 'notes', label: 'Notes', example: 'approval for the current year' },
    ],
    viewPermission: 'InstituteSetup.SchoolDocuments.View',
    editPermissions: ['InstituteSetup.SchoolDocuments.Add'],
  },
};
