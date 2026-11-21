export enum LibraryBookStatus {
  Available,
  Issued,
  Reserved,
  Overdue,
  Returned,
  UnderMaintenance,
  Lost,
  Damaged,
  Removed,
  InCustody,
  InTransit,
}

export const LibraryBookStatusOptions = [
  {
    label: 'Available',
    value: LibraryBookStatus.Available,
  },
  {
    label: 'Issued',
    value: LibraryBookStatus.Issued,
  },
  {
    label: 'Reserved',
    value: LibraryBookStatus.Reserved,
  },
  {
    label: 'Overdue',
    value: LibraryBookStatus.Overdue,
  },
  {
    label: 'Returned',
    value: LibraryBookStatus.Returned,
  },
  {
    label: 'Under Maintenance',
    value: LibraryBookStatus.UnderMaintenance,
  },
  {
    label: 'Lost',
    value: LibraryBookStatus.Lost,
  },
  {
    label: 'Damaged',
    value: LibraryBookStatus.Damaged,
  },
  {
    label: 'Removed',
    value: LibraryBookStatus.Removed,
  },
  {
    label: 'Classroom custody',
    value: LibraryBookStatus.InCustody,
  },
  {
    label: 'In transit',
    value: LibraryBookStatus.InTransit,
  },
];

export const LibraryBookStatusColors = {
  [LibraryBookStatus.Available]: 'success',
  [LibraryBookStatus.Issued]: 'info',
  [LibraryBookStatus.Reserved]: 'warning',
  [LibraryBookStatus.Overdue]: 'error',
  [LibraryBookStatus.Returned]: 'info',
  [LibraryBookStatus.UnderMaintenance]: 'warning',
  [LibraryBookStatus.Lost]: 'error',
  [LibraryBookStatus.Damaged]: 'error',
  [LibraryBookStatus.Removed]: 'default',
  [LibraryBookStatus.InCustody]: 'info',
  [LibraryBookStatus.InTransit]: 'info',
};
