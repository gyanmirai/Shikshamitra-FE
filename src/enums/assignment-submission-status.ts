export enum AssignmentSubmissionStatus {
  Pending,
  Submitted,
  Checked,
}

export const AssignmentSubmissionStatusColor = {
  [AssignmentSubmissionStatus.Pending]: 'warning',
  [AssignmentSubmissionStatus.Submitted]: 'info',
  [AssignmentSubmissionStatus.Checked]: 'success',
};

export const AssignmentSubmissionStatusOptions = [
  {
    label: 'Pending',
    value: AssignmentSubmissionStatus.Pending,
  },
  {
    label: 'Submitted',
    value: AssignmentSubmissionStatus.Submitted,
  },
  {
    label: 'Checked',
    value: AssignmentSubmissionStatus.Checked,
  },
];
