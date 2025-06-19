export enum SubmissionType {
  ONLINE_TEXT,
  FILE_UPLOAD,
  IN_PERSON,
}

export const SubmissionTypeOptions = [
  {
    label: 'Online Text',
    value: SubmissionType.ONLINE_TEXT,
  },
  {
    label: 'File Upload',
    value: SubmissionType.FILE_UPLOAD,
  },
  {
    label: 'In Person',
    value: SubmissionType.IN_PERSON,
  },
];

export const SubmissionTypeColors = {
  [SubmissionType.ONLINE_TEXT]: 'primary',
  [SubmissionType.FILE_UPLOAD]: 'secondary',
  [SubmissionType.IN_PERSON]: 'success',
};
