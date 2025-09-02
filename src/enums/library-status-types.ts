// Book Issue Status Types
export enum BookIssueStatusType {
  Issued,
  Returned,
  Overdue,
}

export const BookIssueStatusTypeOptions = [
  {
    label: 'Issued',
    value: BookIssueStatusType.Issued,
  },
  {
    label: 'Returned',
    value: BookIssueStatusType.Returned,
  },
  {
    label: 'Overdue',
    value: BookIssueStatusType.Overdue,
  },
];

export const BookIssueStatusTypeColors = {
  [BookIssueStatusType.Issued]: 'info',
  [BookIssueStatusType.Returned]: 'success',
  [BookIssueStatusType.Overdue]: 'error',
};

// Book Reservation Status Types
export enum BookReservationStatusType {
  Active,
  Cancelled,
  Reserved,
  Issued,
  Available,
}

export const BookReservationStatusTypeOptions = [
  {
    label: 'Active',
    value: BookReservationStatusType.Active,
  },
  {
    label: 'Cancelled',
    value: BookReservationStatusType.Cancelled,
  },
  {
    label: 'Reserved',
    value: BookReservationStatusType.Reserved,
  },
  {
    label: 'Issued',
    value: BookReservationStatusType.Issued,
  },
  {
    label: 'Available',
    value: BookReservationStatusType.Available,
  },
];

export const BookReservationStatusTypeColors = {
  [BookReservationStatusType.Active]: 'success',
  [BookReservationStatusType.Cancelled]: 'error',
  [BookReservationStatusType.Reserved]: 'info',
  [BookReservationStatusType.Issued]: 'success',
  [BookReservationStatusType.Available]: 'success',
};

// Fines & Charges Status Types
export enum FinesChargesStatusType {
  Unpaid,
  Paid,
}

export const FinesChargesStatusTypeOptions = [
  {
    label: 'Unpaid',
    value: FinesChargesStatusType.Unpaid,
  },
  {
    label: 'Paid',
    value: FinesChargesStatusType.Paid,
  },
];

export const FinesChargesStatusTypeColors = {
  [FinesChargesStatusType.Unpaid]: 'error',
  [FinesChargesStatusType.Paid]: 'success',
};

// Member Status Types (existing - keeping for reference)
export enum MemberStatusType {
  Active,
  Inactive,
  Suspended,
}

export const MemberStatusOptions = [
  {
    label: 'Active',
    value: MemberStatusType.Active,
  },
  {
    label: 'Inactive',
    value: MemberStatusType.Inactive,
  },
  {
    label: 'Suspended',
    value: MemberStatusType.Suspended,
  },
];

export const MemberStatusTypeColors = {
  [MemberStatusType.Active]: 'success',
  [MemberStatusType.Inactive]: 'warning',
  [MemberStatusType.Suspended]: 'error',
};
