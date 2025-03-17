export enum FollowUpStatusType {
  Pending,
  Interested,
  'Not Interested',
}

export const FollowUpStatusTypeOptions = [
  {
    label: 'Pending',
    value: FollowUpStatusType.Pending,
  },
  {
    label: 'Interested',
    value: FollowUpStatusType.Interested,
  },
  {
    label: 'Not Interested',
    value: FollowUpStatusType['Not Interested'],
  },
];

export const InquiryStatusTypeColors = {
  [FollowUpStatusType.Pending]: 'warning',
  [FollowUpStatusType.Interested]: 'success',
  [FollowUpStatusType['Not Interested']]: 'error',
};
