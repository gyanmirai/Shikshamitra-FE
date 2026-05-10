export enum HomeworkSubmissionStatus {
  Pending = 0,
  Submitted = 1,
  Late = 2,
  Excused = 3,
  Reviewed = 4,
  Draft = 5,
  NeedsReview = 6,
}

export const HomeworkSubmissionStatusColor = {
  [HomeworkSubmissionStatus.Pending]: 'warning',
  [HomeworkSubmissionStatus.Submitted]: 'info',
  [HomeworkSubmissionStatus.Late]: 'error',
  [HomeworkSubmissionStatus.Excused]: 'default',
  [HomeworkSubmissionStatus.Reviewed]: 'success',
  [HomeworkSubmissionStatus.Draft]: 'default',
  [HomeworkSubmissionStatus.NeedsReview]: 'warning',
};

export const HomeworkSubmissionStatusOptions = [
  { label: 'Pending', value: HomeworkSubmissionStatus.Pending },
  { label: 'Submitted', value: HomeworkSubmissionStatus.Submitted },
  { label: 'Late', value: HomeworkSubmissionStatus.Late },
  { label: 'Excused', value: HomeworkSubmissionStatus.Excused },
  { label: 'Reviewed', value: HomeworkSubmissionStatus.Reviewed },
  { label: 'Draft', value: HomeworkSubmissionStatus.Draft },
  { label: 'Needs Review', value: HomeworkSubmissionStatus.NeedsReview },
];
