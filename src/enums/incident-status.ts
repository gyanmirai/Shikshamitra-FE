export enum IncidentStatusType {
  Pending,
  Resolved,
  Rejected,
}

export const IncidentStatusOptions = [
  {
    label: 'Pending',
    value: IncidentStatusType.Pending,
  },
  {
    label: 'Resolved',
    value: IncidentStatusType.Resolved,
  },
  {
    label: 'Rejected',
    value: IncidentStatusType.Rejected,
  },
];

export const IncidentStatusColors: Record<IncidentStatusType, 'success' | 'error' | 'warning'> = {
  [IncidentStatusType.Pending]: 'warning',
  [IncidentStatusType.Resolved]: 'success',
  [IncidentStatusType.Rejected]: 'error',
};
