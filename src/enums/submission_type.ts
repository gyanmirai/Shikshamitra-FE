export enum SubmissionType {
  'Online Text',
  'File Upload',
  'In Person',
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
];

export const SubmissionTypeColors = {
  [SubmissionType['Online Text']]: 'primary',
  [SubmissionType['File Upload']]: 'secondary',
  [SubmissionType['In Person']]: 'success',
};
