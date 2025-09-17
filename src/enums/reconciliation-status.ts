export enum ReconciliationStatusType {
  Matched,
  Unmatched,
  Discrepant,
}

export const ReconciliationStatusOptions = [
  {
    label: 'Matched',
    value: ReconciliationStatusType.Matched,
  },
  {
    label: 'Unmatched',
    value: ReconciliationStatusType.Unmatched,
  },
  {
    label: 'Discrepant',
    value: ReconciliationStatusType.Discrepant,
  },
];

export const ReconciliationStatusTypeColors = {
  [ReconciliationStatusType.Matched]: 'success',
  [ReconciliationStatusType.Unmatched]: 'error',
  [ReconciliationStatusType.Discrepant]: 'warning',
};
