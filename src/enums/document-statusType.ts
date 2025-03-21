export enum DocumentStatusType {
  Pending,
  Uploaded,
}

export const DocumentStatusOptions = [
  {
    label: 'Pending',
    value: DocumentStatusType.Pending,
  },
  {
    label: 'Uploaded',
    value: DocumentStatusType.Uploaded,
  },
];

export const DocumentStatusTypeColors = {
  [DocumentStatusType.Pending]: 'warning',
  [DocumentStatusType.Uploaded]: 'success',
};
