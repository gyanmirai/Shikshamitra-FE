export enum PublishUnpublishStatusType {
  Published,
  Draft,
}

export const PublishUnpublishStatusOptions = [
  {
    label: 'Published',
    value: PublishUnpublishStatusType.Published,
  },
  {
    label: 'Draft',
    value: PublishUnpublishStatusType.Draft,
  },
];

export const PublishUnpublishStatusTypeColors = {
  [PublishUnpublishStatusType.Published]: 'success',
  [PublishUnpublishStatusType.Draft]: 'default',
};
