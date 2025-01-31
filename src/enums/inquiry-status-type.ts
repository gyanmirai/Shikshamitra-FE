export enum InquiryStatusType {
  Pending,
  Interested,
  'Not Interested',
}

export const InquiryStatusTypeOptions = [
  {
    label: 'Pending',
    value: InquiryStatusType.Pending,
  },
  {
    label: 'Interested',
    value: InquiryStatusType.Interested,
  },
  {
    label: 'Not Interested',
    value: InquiryStatusType['Not Interested'],
  },
];

export const InquiryStatusTypeColors = {
  [InquiryStatusType.Pending]: 'warning',
  [InquiryStatusType.Interested]: 'success',
  [InquiryStatusType['Not Interested']]: 'error',
};
