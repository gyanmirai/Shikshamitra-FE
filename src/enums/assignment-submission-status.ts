export enum AssignmentSubmissionStatus {
  Pending = 0,
  Submitted = 1,
  Late = 2,
  Excused = 3,
  Reviewed = 4,
  Draft = 5,
  NeedsReview = 6,
}

export const AssignmentSubmissionStatusColor = {
  [AssignmentSubmissionStatus.Pending]: 'warning',
  [AssignmentSubmissionStatus.Submitted]: 'info',
  [AssignmentSubmissionStatus.Late]: 'error',
  [AssignmentSubmissionStatus.Excused]: 'default',
  [AssignmentSubmissionStatus.Reviewed]: 'success',
  [AssignmentSubmissionStatus.Draft]: 'default',
  [AssignmentSubmissionStatus.NeedsReview]: 'warning',
};

export const AssignmentSubmissionStatusOptions = [
  { label: 'Pending', value: AssignmentSubmissionStatus.Pending },
  { label: 'Submitted', value: AssignmentSubmissionStatus.Submitted },
  { label: 'Late', value: AssignmentSubmissionStatus.Late },
  { label: 'Excused', value: AssignmentSubmissionStatus.Excused },
  { label: 'Reviewed', value: AssignmentSubmissionStatus.Reviewed },
  { label: 'Draft', value: AssignmentSubmissionStatus.Draft },
  { label: 'Needs Review', value: AssignmentSubmissionStatus.NeedsReview },
];
