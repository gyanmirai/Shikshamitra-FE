export enum SubmissionType {
  'Online Text',
  'File Upload',
  'In Person',
  'No Submission Required',
}

export const SubmissionTypeOptions = [
  {
    label: 'Online Text',
    value: SubmissionType['Online Text'],
  },
  {
    label: 'File Upload',
    value: SubmissionType['File Upload'],
  },
  {
    label: 'In Person',
    value: SubmissionType['In Person'],
  },
  {
    label: 'No Submission Required',
    value: SubmissionType['No Submission Required'],
  },
];

export const SubmissionTypeColors = {
  [SubmissionType['Online Text']]: 'primary',
  [SubmissionType['File Upload']]: 'secondary',
  [SubmissionType['In Person']]: 'success',
  [SubmissionType['No Submission Required']]: 'default',
};
