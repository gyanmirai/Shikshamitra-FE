export enum LibraryBookStatus {
  Pending,
  Issued,
  Overdue,
  Returned,
}

export const LibraryBookStatusOptions = [
  {
    label: 'Pending',
    value: LibraryBookStatus.Pending,
  },
  {
    label: 'Issued',
    value: LibraryBookStatus.Issued,
  },
  {
    label: 'Overdue',
    value: LibraryBookStatus.Overdue,
  },
  {
    label: 'Returned',
    value: LibraryBookStatus.Returned,
  },
];

export const LibraryBookStatusColors = {
  [LibraryBookStatus.Pending]: 'warning',
  [LibraryBookStatus.Issued]: 'success',
  [LibraryBookStatus.Overdue]: 'error',
  [LibraryBookStatus.Returned]: 'info',
};
