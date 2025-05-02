export enum SLAMeetStatusType {
  Yes,
  No,
}

export const SLAMeetStatusTypeOptions = [
  {
    label: 'Yes',
    value: SLAMeetStatusType.Yes,
  },
  {
    label: 'No',
    value: SLAMeetStatusType.No,
  },
];

export const SLAMeetStatusTypeColor = {
  [SLAMeetStatusType.Yes]: 'success',
  [SLAMeetStatusType.No]: 'error',
};
