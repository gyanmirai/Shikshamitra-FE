import type { ConcessionApplication } from 'src/redux/finance/ConcessionManagement/types';

import { ConcessionStatusType } from 'src/enums/concession-status-type';

const statuses = [
  { value: ConcessionStatusType.Draft, label: 'Draft' },
  { value: ConcessionStatusType.Pending, label: 'Pending' },
  { value: ConcessionStatusType.Approved, label: 'Approved' },
  { value: ConcessionStatusType.PartiallyReversed, label: 'Partially Reversed' },
  { value: ConcessionStatusType.Reversed, label: 'Reversed' },
  { value: ConcessionStatusType.Rejected, label: 'Rejected' },
  { value: ConcessionStatusType.Cancelled, label: 'Cancelled' },
];

export function concessionStatusOptions(tab: string) {
  const values =
    tab === 'pending'
      ? [ConcessionStatusType.Draft, ConcessionStatusType.Pending]
      : tab === 'approved'
        ? [
            ConcessionStatusType.Approved,
            ConcessionStatusType.PartiallyReversed,
            ConcessionStatusType.Reversed,
          ]
        : [ConcessionStatusType.Rejected, ConcessionStatusType.Cancelled];
  return statuses.filter((status) => values.includes(status.value));
}

export function concessionStatusLabel(status: number) {
  return statuses.find((option) => option.value === status)?.label ?? '-';
}

export function toConcessionTableRow(item: ConcessionApplication) {
  return {
    ...item,
    studentIdentity: `${item.studentName || '-'}${item.grNumber ? ` (${item.grNumber})` : ''}`,
    classDivision: `${item.standardName || '-'} (${item.divisionName || '-'})`,
  };
}
