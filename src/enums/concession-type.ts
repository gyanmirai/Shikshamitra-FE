export enum ConcessionStatusType {
  Approved,
  'Under Review',
  Pending,
  Rejected,
}

export const ConcessionStatusTypeOptions = [
  {
    label: 'Approved',
    value: ConcessionStatusType.Approved,
  },
  {
    label: 'Under Review',
    value: ConcessionStatusType['Under Review'],
  },
  {
    label: 'Pending',
    value: ConcessionStatusType.Pending,
  },
  {
    label: 'Rejected',
    value: ConcessionStatusType.Rejected,
  },
];

export const ConcessionStatusTypeColor: Record<
  ConcessionStatusType,
  'success' | 'warning' | 'error' | 'info'
> = {
  [ConcessionStatusType.Approved]: 'success',
  [ConcessionStatusType['Under Review']]: 'info',
  [ConcessionStatusType.Pending]: 'warning',
  [ConcessionStatusType.Rejected]: 'error',
};
