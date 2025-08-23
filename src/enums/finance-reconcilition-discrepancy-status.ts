export enum DiscrepancyStatusType {
  Pending,
  Investigating,
  Resolved,
}

export const DiscrepancyStatusOptions = [
  {
    label: 'Pending',
    value: DiscrepancyStatusType.Pending,
  },
  {
    label: 'Investigating',
    value: DiscrepancyStatusType.Investigating,
  },
  {
    label: 'Resolved',
    value: DiscrepancyStatusType.Resolved,
  },
];

export const DiscrepancyStatusColor = {
  [DiscrepancyStatusType.Pending]: 'warning',
  [DiscrepancyStatusType.Investigating]: 'info',
  [DiscrepancyStatusType.Resolved]: 'success',
};
