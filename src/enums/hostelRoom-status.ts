export enum HostelRoomStatusType {
  Occupied,
  Available,
  'Under Maintenance',
}

export const HostelRoomStatusOptions = [
  {
    label: 'Occupied',
    value: HostelRoomStatusType.Occupied,
  },
  {
    label: 'Available',
    value: HostelRoomStatusType.Available,
  },
  {
    label: 'Under Maintenance',
    value: HostelRoomStatusType['Under Maintenance'],
  },
];

export const HostelRoomStatusColors = {
  [HostelRoomStatusType.Occupied]: 'error',
  [HostelRoomStatusType.Available]: 'success',
  [HostelRoomStatusType['Under Maintenance']]: 'secondary',
};
