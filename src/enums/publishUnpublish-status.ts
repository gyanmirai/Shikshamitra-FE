export enum PublishUnpublishStatusType {
  Published,
  Draft,
}

export const PublishUnpublishStatusOptions = [
  {
    label: 'Draft',
    value: PublishUnpublishStatusType.Draft,
  },
  {
    label: 'Published',
    value: PublishUnpublishStatusType.Published,
  },
];

export const PublishUnpublishStatusTypeColors = {
  [PublishUnpublishStatusType.Draft]: 'default',
  [PublishUnpublishStatusType.Published]: 'success',
};
