export enum TimetableStatusType {
  'Publish' = 'Publish',
  'Pending' = 'Pending',
  'Draft' = 'Draft',
}

export const TimetableStatusOptions = [
  {
    label: 'Publish',
    value: TimetableStatusType.Publish,
  },
  {
    label: 'Pending',
    value: TimetableStatusType.Pending,
  },
  {
    label: 'Draft',
    value: TimetableStatusType.Draft,
  },
];

export const TimetableStatusTypeColors = {
  [TimetableStatusType.Publish]: 'success',
  [TimetableStatusType.Pending]: 'warning',
  [TimetableStatusType.Draft]: 'error',
};
