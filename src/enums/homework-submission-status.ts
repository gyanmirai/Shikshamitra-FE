export enum HomeworkSubmissionStatus {
  Pending = 0,
  Submitted = 1,
  Completed = 2,
}

export const HomeworkSubmissionStatusColor = {
  [HomeworkSubmissionStatus.Pending]: 'warning',
  [HomeworkSubmissionStatus.Submitted]: 'info',
  [HomeworkSubmissionStatus.Completed]: 'success',
};

export const HomeworkSubmissionStatusOptions = [
  {
    label: 'Pending',
    value: HomeworkSubmissionStatus.Pending,
  },
  {
    label: 'Submitted',
    value: HomeworkSubmissionStatus.Submitted,
  },
  {
    label: 'Completed',
    value: HomeworkSubmissionStatus.Completed,
  },
];
