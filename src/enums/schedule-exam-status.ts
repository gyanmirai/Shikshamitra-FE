export enum ScheduleExamStatus {
  Pending,
  Completed,
}

export const ScheduleExamStatusColor = {
  [ScheduleExamStatus.Pending]: 'warning', // Orange color for pending status
  [ScheduleExamStatus.Completed]: 'primary', // Green color for completed status
};

export const ScheduleExamStatusOptions = [
  { label: 'Pending', value: ScheduleExamStatus.Pending },
  { label: 'Completed', value: ScheduleExamStatus.Completed },
];
