// Enum for Timetable Status
export enum TimetableStatusType {
  'Not Created',
  Draft,
  Created,
}

// Options for dropdown/select use
export const TimetableStatusOptions = [
  {
    label: 'Not Created',
    value: TimetableStatusType['Not Created'],
  },
  {
    label: 'Draft',
    value: TimetableStatusType.Draft,
  },
  {
    label: 'Created',
    value: TimetableStatusType.Created,
  },
];

// Corresponding colors for status
export const TimetableStatusColors = {
  [TimetableStatusType['Not Created']]: 'error',
  [TimetableStatusType.Draft]: 'warning',
  [TimetableStatusType.Created]: 'success',
};
