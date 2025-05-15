export enum VisitorVisitingStatusType {
  'Awaiting Visit',
  'Checked In',
}
export const VisitorVisitingStatusOptions = [
  {
    label: 'Awaiting Visit',
    value: VisitorVisitingStatusType['Awaiting Visit'],
  },
  {
    label: 'Checked In',
    value: VisitorVisitingStatusType['Checked In'],
  },
];

export const VisitorVisitingStatusColors = {
  [VisitorVisitingStatusType['Checked In']]: 'success',
  [VisitorVisitingStatusType['Awaiting Visit']]: 'info',
};
