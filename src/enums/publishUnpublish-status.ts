export enum PublishUnpublishStatusType {
  Publish,
  Draft,
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
