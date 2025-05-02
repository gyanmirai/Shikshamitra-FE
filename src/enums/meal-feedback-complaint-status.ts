export enum FeedBackComplaintStatusType {
  Pending,
  Resolved,
  Rejected,
}

export const FeedBackComplaintStatusOptions = [
  {
    label: 'Pending',
    value: FeedBackComplaintStatusType.Pending,
  },
  {
    label: 'Resolved',
    value: FeedBackComplaintStatusType.Resolved,
  },
  {
    label: 'Rejected',
    value: FeedBackComplaintStatusType.Rejected,
  },
];

export const FeedBackComplaintStatusColors = {
  [FeedBackComplaintStatusType.Pending]: 'warning',
  [FeedBackComplaintStatusType.Resolved]: 'success',
  [FeedBackComplaintStatusType.Rejected]: 'error',
};
