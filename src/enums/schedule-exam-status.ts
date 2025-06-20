export enum ScheduleExamStatus {
  Pending,
  Draft,
  Published,
  Submitted,
  Reviewed,
  Completed,
}

export const ScheduleExamStatusColor = {
  [ScheduleExamStatus.Pending]: 'default',
  [ScheduleExamStatus.Draft]: 'warning',
  [ScheduleExamStatus.Published]: 'info',
  [ScheduleExamStatus.Submitted]: 'success',
  [ScheduleExamStatus.Reviewed]: 'secondary',
  [ScheduleExamStatus.Completed]: 'sucess',
};

export const ScheduleExamStatusOptions = [
  { label: 'Completed', value: ScheduleExamStatus.Completed },
  { label: 'Pending', value: ScheduleExamStatus.Pending },
  { label: 'Draft', value: ScheduleExamStatus.Draft },
  { label: 'Published', value: ScheduleExamStatus.Published },
  { label: 'Submitted', value: ScheduleExamStatus.Submitted },
  { label: 'Reviewed', value: ScheduleExamStatus.Reviewed },
];
