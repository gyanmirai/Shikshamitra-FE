export enum PublishUnpublishStatusType {
  'Publish' = 'Publish',
  'Draft' = 'Draft',
}

export const PublishUnpublishStatusOptions = [
  {
    label: 'Publish',
    value: PublishUnpublishStatusType.Publish,
  },
  {
    label: 'Draft',
    value: PublishUnpublishStatusType.Draft,
  },
];

export const PublishUnpublishStatusTypeColors = {
  [PublishUnpublishStatusType.Publish]: 'success',
  [PublishUnpublishStatusType.Draft]: 'error',
};
